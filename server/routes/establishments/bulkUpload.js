'use strict';

const moment = require('moment');
const csv = require('csvtojson');
const uuid = require('uuid');

const config = rfr('server/config/config');
const dbModels = rfr('server/models');
const timerLog = rfr('server/utils/timerLog');

const s3 = new (require('aws-sdk')).S3({
  region: String(config.get('bulkupload.region'))
});
const Bucket = String(config.get('bulkupload.bucketname'));

const EstablishmentCsvValidator = rfr('server/models/BulkImport/csv/establishments').Establishment;
const WorkerCsvValidator = rfr('server/models/BulkImport/csv/workers').Worker;
const TrainingCsvValidator = rfr('server/models/BulkImport/csv/training').Training;
const { MetaData } = rfr('server/models/BulkImport/csv/metaData');

const { Establishment } = rfr('server/models/classes/establishment');
const { Worker } = rfr('server/models/classes/worker');
const { Qualification } = rfr('server/models/classes/qualification');
const { Training } = rfr('server/models/classes/training');
const { User } = rfr('server/models/classes/user');
const { attemptToAcquireLock, updateLockState, lockStatus, releaseLockQuery } = rfr('server/data/bulkUploadLock');

const buStates = [
  'READY',
  'DOWNLOADING',
  'UPLOADING',
  'UPLOADED',
  'VALIDATING',
  'FAILED',
  'WARNINGS',
  'PASSED',
  'COMPLETING'
].reduce((acc, item) => {
  acc[item] = item;

  return acc;
}, Object.create(null));

const ignoreMetaDataObjects = /.*metadata.json$/;
const ignoreRoot = /.*\/$/;
const filenameRegex = /^(.+\/)*(.+)\.(.+)$/;

// Prevent multiple bulk upload requests from being ongoing simultaneously so we can store what was previously the http responses in the S3 bucket
// This function can't be an express middleware as it needs to run both before and after the regular logic
const acquireLock = async function (logic, newState, req, res) {
  const { establishmentId } = req;

  req.startTime = (new Date()).toISOString();

  console.log(`Acquiring lock for establishment ${establishmentId}.`);

  // attempt to acquire the lock
  const currentLockState = await attemptToAcquireLock(establishmentId);

  // if no records were updated the lock could not be acquired
  // Just respond with a 409 http code and don't call the regular logic
  // close the response either way and continue processing in the background
  if (currentLockState[1] === 0) {
    console.log('Lock *NOT* acquired.');
    res
      .status(409)
      .send({
        message: `The lock for establishment ${establishmentId} was not acquired as it's already being held by another ongoing process.`
      });

    return;
  }

  console.log('Lock acquired.', newState);

  let nextState;

  switch (newState) {
    case buStates.DOWNLOADING: {
      // get the current bulk upload state
      const currentState = await lockStatus(establishmentId);

      if (currentState.length === 1) {
        // don't update the status for downloads, just hold the lock
        newState = currentState[0].bulkUploadState;
        nextState = null;
      } else {
        nextState = buStates.READY;
      }
    } break;

    case buStates.UPLOADING:
      nextState = buStates.UPLOADED;
      break;

    case buStates.VALIDATING:
      // we don't yet know wether the validation should go to the PASSED, FAILED
      // or WARNINGS state next as it depends on whether the data is valid or not
      nextState = null;
      break;

    case buStates.COMPLETING:
      nextState = buStates.READY;
      break;

    default:
      newState = buStates.READY;
      nextState = buStates.READY;
      break;
  }

  // update the current state
  await updateLockState(establishmentId, newState);

  req.buRequestId = String(uuid()).toLowerCase();

  res
    .status(200)
    .send({
      message: `Lock for establishment ${establishmentId} acquired.`,
      requestId: req.buRequestId
    });

  // run whatever the original logic was
  try {
    await logic(req, res);
  } catch (e) {

  }

  if (newState === buStates.VALIDATING) {
    switch (res.buValidationResult) {
      case buStates.PASSED:
      case buStates.WARNINGS:
        nextState = res.buValidationResult;
        break;

      default:
        nextState = buStates.FAILED;
        break;
    }
  }

  // release the lock
  await releaseLock(req, null, null, nextState);
};

const lockStatusGet = async (req, res) => {
  const { establishmentId } = req;

  const currentLockState = await lockStatus(establishmentId);

  res
    .status(200) // don't allow this to be able to test if an establishment exists so always return a 200 response
    .send(
      currentLockState.length === 0
        ? {
          establishmentId,
          bulkUploadState: buStates.READY,
          bulkUploadLockHeld: true
        } : currentLockState[0]
    );

  return currentLockState[0];
};

const releaseLock = async (req, res, next, nextState = null) => {
  const establishmentId = req.query.subEstId || req.establishmentId;

  if (Number.isInteger(establishmentId)) {
    await releaseLockQuery(establishmentId, nextState);

    console.log(`Lock released for establishment ${establishmentId}`);
  }

  if (res !== null) {
    res
      .status(200)
      .send({
        establishmentId
      });
  }
};

const responseGet = (req, res) => {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const buRequestId = String(req.params.buRequestId).toLowerCase();

  if (!uuidRegex.test(buRequestId)) {
    res.status(400).send({
      message: 'request id must be a uuid'
    });

    return;
  }

  s3.getObject({
    Bucket,
    Key: `${req.establishmentId}/intermediary/${buRequestId}.json`
  }).promise()
    .then(data => {
      const jsonData = JSON.parse(data.Body.toString());

      if (Number.isInteger(jsonData.responseCode) && jsonData.responseCode > 99) {
        if (jsonData.responseHeaders) {
          res.set(jsonData.responseHeaders);
        }

        res.status(jsonData.responseCode).send(jsonData.responseBody);
      } else {
        console.log('bulkUpload::responseGet: Response code was not numeric', jsonData);

        throw new Error('Response code was not numeric');
      }
    })
    .catch(err => {
      console.log('bulkUpload::responseGet: getting data returned an error:', err);

      res.status(404).send({
        message: 'Not Found'
      });
    });
};

const saveResponse = async (req, res, statusCode, body, headers) => {
  if (!Number.isInteger(statusCode) || statusCode < 100) {
    statusCode = 500;
  }

  return s3.putObject({
    Bucket,
    Key: `${req.establishmentId}/intermediary/${req.buRequestId}.json`,
    Body: JSON.stringify({
      url: req.url,
      startTime: req.startTime,
      endTime: (new Date()).toISOString(),
      responseCode: statusCode,
      responseBody: body,
      responseHeaders: (typeof headers === 'object' ? headers : undefined)
    })
  }).promise();
};

const uploadedGet = async (req, res) => {
  try {
    const data = await s3.listObjects({
      Bucket,
      Prefix: `${req.establishmentId}/latest/`
    }).promise();

    const returnData = await Promise.all(
      data.Contents.filter(
        myFile => !ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)
      )
        .map(async file => {
          const elements = file.Key.split('/');

          const objData = await s3.headObject({
            Bucket,
            Key: file.Key
          }).promise();

          const username = objData && objData.Metadata ? objData.Metadata.username : '';

          const fileMetaData = data.Contents.filter(myFile => myFile.Key === (file.Key + '.metadata.json'));

          let metadataJSON = {};

          if (fileMetaData.length === 1) {
            const metaData = await downloadContent(fileMetaData[0].Key);
            metadataJSON = JSON.parse(metaData.data);
          }

          return {
            filename: elements[elements.length - 1],
            uploaded: file.LastModified,
            username,
            records: metadataJSON.records ? metadataJSON.records : 0,
            errors: metadataJSON.errors ? metadataJSON.errors : 0,
            warnings: metadataJSON.warnings ? metadataJSON.warnings : 0,
            fileType: metadataJSON.fileType ? metadataJSON.fileType : null,
            size: file.Size,
            key: encodeURI(file.Key)
          };
        })
    );

    await saveResponse(req, res, 200, {
      establishment: {
        uid: req.establishmentId
      },
      files: returnData
    });
  } catch (err) {
    console.error(err);

    await saveResponse(req, res, 503, {});
  }
};

const uploadedStarGet = async (req, res) => {
  const Key = req.params['0'];
  const elements = Key.split('/');

  try {
    const objHeadData = await s3.headObject({
      Bucket,
      Key
    }).promise();

    await saveResponse(req, res, 200, {
      file: {
        filename: elements[elements.length - 1],
        uploaded: objHeadData.LastModified,
        username: objHeadData.Metadata.username,
        size: objHeadData.ContentLength,
        key: Key,
        signedUrl: s3.getSignedUrl('getObject', {
          Bucket,
          Key,
          Expires: config.get('bulkupload.uploadSignedUrlExpire')
        })
      }
    });
  } catch (err) {
    if (err.code && err.code === 'NotFound') {
      await saveResponse(req, res, 404, {});
    } else {
      console.log(err);
      await saveResponse(req, res, 503, {});
    }
  }
};

const purgeBulkUploadS3Objects = async establishmentId => {
  // drop all in latest
  const listParams = {
    Bucket,
    Prefix: `${establishmentId}/latest/`
  };

  const latestObjects = await s3.listObjects(listParams).promise();
  const deleteKeys = [];

  latestObjects.Contents.forEach(myFile => {
    const ignoreRoot = /.*\/$/;
    if (!ignoreRoot.test(myFile.Key)) {
      deleteKeys.push({
        Key: myFile.Key
      });
    }
  });

  listParams.Prefix = `${establishmentId}/intermediary/`;
  const intermediaryObjects = await s3.listObjects(listParams).promise();
  intermediaryObjects.Contents.forEach(myFile => {
    deleteKeys.push({
      Key: myFile.Key
    });
  });

  listParams.Prefix = `${establishmentId}/validation/`;
  const validationObjects = await s3.listObjects(listParams).promise();
  validationObjects.Contents.forEach(myFile => {
    deleteKeys.push({
      Key: myFile.Key
    });
  });

  if (deleteKeys.length > 0) {
    // now delete the objects in one go
    await s3.deleteObjects({
      Bucket,
      Delete: {
        Objects: deleteKeys,
        Quiet: true
      }
    }).promise();
  }
};

const uploadedPost = async (req, res) => {
  const establishmentId = String(req.establishmentId);
  const username = req.username;
  const uploadedFiles = req.body.files;

  const MINIMUM_NUMBER_OF_FILES = 2;
  const MAXIMUM_NUMBER_OF_FILES = 3;

  if (
    !uploadedFiles ||
    !Array.isArray(uploadedFiles) ||
    uploadedFiles.length < MINIMUM_NUMBER_OF_FILES ||
    uploadedFiles.length > MAXIMUM_NUMBER_OF_FILES
  ) {
    await saveResponse(req, res, 400, {});
    return;
  }

  try {
    // clean up existing bulk upload objects
    await purgeBulkUploadS3Objects(establishmentId);

    const signedUrls = [];

    uploadedFiles.forEach(thisFile => {
      if (thisFile.filename) {
        thisFile.signedUrl = s3.getSignedUrl('putObject', {
          Bucket,
          Key: `${establishmentId}/latest/${thisFile.filename}`,
          ContentType: req.query.type,
          Metadata: {
            username,
            establishmentId,
            validationstatus: 'pending'
          },
          Expires: config.get('bulkupload.uploadSignedUrlExpire')
        });
        signedUrls.push(thisFile);
      }
    });

    await saveResponse(req, res, 200, signedUrls);
  } catch (err) {
    console.error('API POST bulkupload/uploaded: ', err);
    await saveResponse(req, res, 503, {});
  }
};

const signedUrlGet = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;

    await saveResponse(req, res, 200, {
      urls: s3.getSignedUrl('putObject', {
        Bucket,
        Key: `${establishmentId}/latest/${req.query.filename}`,
        ContentType: req.query.type,
        Metadata: {
          username: String(req.username),
          establishmentId: String(establishmentId),
          validationstatus: 'pending'
        },
        Expires: config.get('bulkupload.uploadSignedUrlExpire')
      })
    });
  } catch (err) {
    console.error('establishment::bulkupload GET/:PreSigned - failed', err.message);
    await saveResponse(req, res, 503, {});
  }
};

const uploadedPut = async (req, res) => {
  const establishmentId = req.establishmentId;
  const username = req.username;
  const myDownloads = {};
  const establishmentMetadata = new MetaData();
  const workerMetadata = new MetaData();
  const trainingMetadata = new MetaData();

  try {
    // awaits must be within a try/catch block - checking if file exists - saves having to repeatedly download from S3 bucket
    const createModelPromises = [];

    const data = await s3.listObjects({
      Bucket,
      Prefix: `${req.establishmentId}/latest/`
    }).promise();

    data.Contents.forEach(myFile => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;

      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        createModelPromises.push(downloadContent(myFile.Key, myFile.Size, myFile.LastModified));
      }
    });

    const allContent = await Promise.all(createModelPromises);

    allContent.forEach(myfile => {
      if (EstablishmentCsvValidator.isContent(myfile.data)) {
        myDownloads.establishments = myfile.data;
        establishmentMetadata.filename = myfile.filename;
        establishmentMetadata.fileType = 'Establishment';
        establishmentMetadata.userName = myfile.username;
        establishmentMetadata.size = myfile.size;
        establishmentMetadata.key = myfile.key;
        establishmentMetadata.lastModified = myfile.lastModified;
      } else if (WorkerCsvValidator.isContent(myfile.data)) {
        myDownloads.workers = myfile.data;
        workerMetadata.filename = myfile.filename;
        workerMetadata.fileType = 'Worker';
        workerMetadata.userName = myfile.username;
        workerMetadata.size = myfile.size;
        workerMetadata.key = myfile.key;
        workerMetadata.lastModified = myfile.lastModified;
      } else if (TrainingCsvValidator.isContent(myfile.data)) {
        myDownloads.trainings = myfile.data;
        trainingMetadata.filename = myfile.filename;
        trainingMetadata.fileType = 'Training';
        trainingMetadata.userName = myfile.username;
        trainingMetadata.size = myfile.size;
        trainingMetadata.key = myfile.key;
        trainingMetadata.lastModified = myfile.lastModified;
      }
    });

    let workerHeaders;
    let establishmentHeaders;
    let trainingHeaders;
    let importedWorkers = null;
    let importedEstablishments = null;
    let importedTraining = null;

    const headerPromises = [];

    if (myDownloads.establishments) {
      importedEstablishments = await csv().fromString(myDownloads.establishments);
      const positionOfNewline = myDownloads.establishments.indexOf('\n');
      const headerLine = myDownloads.establishments.substring(0, positionOfNewline);
      establishmentHeaders = headerLine.trim();
    }

    if (myDownloads.workers) {
      importedWorkers = await csv().fromString(myDownloads.workers);
      const positionOfNewline = myDownloads.workers.indexOf('\n');
      const headerLine = myDownloads.workers.substring(0, positionOfNewline);
      workerHeaders = headerLine.trim();
    }

    if (myDownloads.trainings) {
      importedTraining = await csv().fromString(myDownloads.trainings);
      const positionOfNewline = myDownloads.trainings.indexOf('\n');
      const headerLine = myDownloads.trainings.substring(0, positionOfNewline);
      trainingHeaders = headerLine.trim();
    }

    await Promise.all(headerPromises);

    // ////////////////////////////
    const firstRow = 0;
    const firstLineNumber = 1;
    const metadataS3Promises = [];

    if (importedEstablishments) {
      if ((new EstablishmentCsvValidator(importedEstablishments[firstRow], firstLineNumber)).preValidate(establishmentHeaders)) {
        // count records and update metadata
        establishmentMetadata.records = importedEstablishments.length;
        metadataS3Promises.push(uploadAsJSON(
          username,
          establishmentId,
          establishmentMetadata,
          `${establishmentId}/latest/${establishmentMetadata.filename}.metadata.json`
        ));
      } else {
        // reset metadata filetype because this is not an expected establishment
        establishmentMetadata.fileType = null;
      }
    }

    if (importedWorkers) {
      if ((new WorkerCsvValidator(importedWorkers[firstRow], firstLineNumber)).preValidate(workerHeaders)) {
        // count records and update metadata
        workerMetadata.records = importedWorkers.length;
        metadataS3Promises.push(uploadAsJSON(
          username,
          establishmentId,
          workerMetadata,
          `${establishmentId}/latest/${workerMetadata.filename}.metadata.json`
        ));
      } else {
        // reset metadata filetype because this is not an expected establishment
        workerMetadata.fileType = null;
      }
    }

    if (importedTraining) {
      if ((new TrainingCsvValidator(importedTraining[firstRow], firstLineNumber)).preValidate(trainingHeaders)) {
        // count records and update metadata
        trainingMetadata.records = importedTraining.length;
        metadataS3Promises.push(uploadAsJSON(
          username,
          establishmentId,
          trainingMetadata,
          `${establishmentId}/latest/${trainingMetadata.filename}.metadata.json`
        ));
      } else {
        // reset metadata filetype because this is not an expected establishment
        trainingMetadata.fileType = null;
      }
    }

    // ////////////////////////////////////
    await Promise.all(metadataS3Promises);

    const generateReturnData = metaData => ({
      filename: metaData.filename,
      uploaded: metaData.lastModified,
      username: metaData.userName ? metaData.userName : null,
      records: metaData.records,
      errors: 0,
      warnings: 0,
      fileType: metaData.fileType,
      size: metaData.size,
      key: metaData.key
    });

    const returnData = [];

    // now forn response for each file
    data.Contents.forEach(myFile => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;
      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        if (myFile.Key === establishmentMetadata.key) {
          returnData.push(generateReturnData(establishmentMetadata));
        } else if (myFile.Key === workerMetadata.key) {
          returnData.push(generateReturnData(workerMetadata));
        } else if (myFile.Key === trainingMetadata.key) {
          returnData.push(generateReturnData(trainingMetadata));
        } else {
          const fileNameElements = myFile.Key.split('/');
          const fileName = fileNameElements[fileNameElements.length - 1];

          returnData.push(generateReturnData({
            filename: fileName,
            uploaded: myFile.LastModified,
            username: myFile.username,
            records: 0,
            errors: 0,
            warnings: 0,
            fileType: null,
            size: myFile.size,
            key: myFile.Key
          }));
        }
      }
    });

    await saveResponse(req, res, 200, returnData);
  } catch (err) {
    console.error(err);
    await saveResponse(req, res, 503, {});
  }
};

const validatePut = async (req, res) => {
  const keepAlive = (stepName = '', stepId = '') => {
    console.log(`Bulk Upload /validate keep alive: ${new Date()} ${stepName} ${stepId}`);
  };

  const establishments = {
    imported: null,
    establishmentMetadata: new MetaData()
  };

  const workers = {
    imported: null,
    workerMetadata: new MetaData()
  };

  const trainings = {
    imported: null,
    trainingMetadata: new MetaData()
  };

  let estNotFound = true;
  let wrkNotFound = true;
  let trnNotFound = true;
  const establishmentId = req.establishmentId;

  try {
    const validationResponse =

      // get list of files from s3 bucket
      await s3.listObjects({
        Bucket,
        Prefix: `${establishmentId}/latest/`
      }).promise()

      // download the contents of the appropriate ones we find
        .then(data => Promise.all(data.Contents.reduce((arr, myFileStats) => {
          keepAlive('bucket listed'); // keep connection alive

          if (!(/.*metadata.json$/.test(myFileStats.Key) || /.*\/$/.test(myFileStats.Key))) {
            arr.push(
              downloadContent(myFileStats.Key)

              // for each downloaded file, test its type then update the closure variables
                .then(myFile => {
                  keepAlive('file downloaded', `${myFileStats.Key}`); // keep connection alive

                  let obj = null;
                  let metadata = null;

                  // figure out which type of csv this file is and load the data
                  if (estNotFound && EstablishmentCsvValidator.isContent(myFile.data)) {
                    estNotFound = false;
                    obj = establishments;
                    metadata = establishments.establishmentMetadata;

                    metadata.filename = myFile.filename;
                    metadata.fileType = 'Establishment';
                    metadata.userName = myFile.username;
                  } else if (wrkNotFound && WorkerCsvValidator.isContent(myFile.data)) {
                    wrkNotFound = false;
                    obj = workers;
                    metadata = workers.workerMetadata;

                    metadata.filename = myFile.filename;
                    metadata.fileType = 'Worker';
                    metadata.userName = myFile.username;
                  } else if (trnNotFound && TrainingCsvValidator.isContent(myFile.data)) {
                    trnNotFound = false;
                    obj = trainings;
                    metadata = trainings.trainingMetadata;

                    metadata.filename = myFile.filename;
                    metadata.fileType = 'Training';
                    metadata.userName = myFile.username;
                  }

                  // if not one of our expected types then just return
                  if (obj === null) {
                    return true;
                  }
                  // parse the file contents as csv then return the data
                  return csv().fromString(myFile.data).then(imported => {
                    keepAlive('csv parsed', myFileStats.Key); // keep connection alive

                    obj.imported = imported;

                    return true;
                  });
                })
            );
          }

          return arr;
        }, [])))

      // validate the csv files we found
        .then(() => validateBulkUploadFiles(
          true,
          req.username,
          establishmentId,
          req.isParent,
          establishments,
          workers,
          trainings,
          keepAlive
        ));

    // set what the next state should be
    res.buValidationResult = validationResponse.status;

    // handle parsing errors
    await saveResponse(req, res, 200, {
      establishment: validationResponse.metaData.establishments.toJSON(),
      workers: validationResponse.metaData.workers.toJSON(),
      training: validationResponse.metaData.training.toJSON()
    });
  } catch (err) {
    console.error(err);

    await saveResponse(req, res, 503, {});
  }
};

const downloadContent = async (key, size, lastModified) => {
  try {
    return await s3.getObject({
      Bucket,
      Key: key
    })
      .promise()
      .then(objData => ({
        key,
        data: objData.Body.toString(),
        filename: key.match(filenameRegex)[2] + '.' + key.match(filenameRegex)[3],
        username: objData.Metadata.username,
        size,
        lastModified
      }));
  } catch (err) {
    console.error(`api/establishment/bulkupload/downloadFile: ${key})\n`, err);
    throw new Error(`Failed to download S3 object: ${key}`);
  }
};

const uploadAsJSON = async (username, establishmentId, content, key) => {
  try {
    await s3.putObject({
      Bucket,
      Key: key,
      Body: JSON.stringify(content, null, 2),
      ContentType: 'application/json',
      Metadata: {
        username,
        establishmentId: String(establishmentId)
      }
    }).promise();
  } catch (err) {
    console.error('uploadAsJSON: ', err);
    throw new Error(`Failed to upload S3 object: ${key}`);
  }
};

const validateEstablishmentCsv = async (
  thisLine,
  currentLineNumber,
  csvEstablishmentSchemaErrors,
  myEstablishments,
  myAPIEstablishments,
  myCurrentEstablishments,
  keepAlive = () => {}
) => {
  const lineValidator = new EstablishmentCsvValidator(thisLine, currentLineNumber, myCurrentEstablishments);

  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  await lineValidator.validate();
  lineValidator.transform();

  const thisEstablishmentAsAPI = lineValidator.toAPI();

  try {
    const thisApiEstablishment = new Establishment();
    thisApiEstablishment.initialise(
      thisEstablishmentAsAPI.Address1,
      thisEstablishmentAsAPI.Address2,
      thisEstablishmentAsAPI.Address3,
      thisEstablishmentAsAPI.Town,
      null,
      thisEstablishmentAsAPI.LocationId,
      thisEstablishmentAsAPI.ProvId,
      thisEstablishmentAsAPI.Postcode,
      thisEstablishmentAsAPI.IsCQCRegulated
    );

    await thisApiEstablishment.load(thisEstablishmentAsAPI);

    keepAlive('establishment loaded', currentLineNumber);

    if (thisApiEstablishment.validate()) {
      // No validation errors in the entity itself, so add it ready for completion
      myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
    } else {
      const errors = thisApiEstablishment.errors;

      if (errors.length === 0) {
        myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
      } else {
        // TODO: Remove this when capacities and services are fixed; temporarily adding establishments
        // even though they're in error (because service/capacity validations put all in error)
        myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
      }
    }
  } catch (err) {
    console.error('WA - localised validate establishment error until validation card', err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach(thisError => csvEstablishmentSchemaErrors.push(thisError));
  }

  myEstablishments.push(lineValidator);
};

const loadWorkerQualifications = async (
  lineValidator,
  thisQual,
  thisApiWorker,
  myAPIQualifications,
  keepAlive = () => {}
) => {
  const thisApiQualification = new Qualification();

  // load while ignoring the "column" attribute (being the CSV column index, e.g "03" from which the qualification is mapped)
  const isValid = await thisApiQualification.load(thisQual);

  keepAlive('qualification loaded', lineValidator.lineNumber);

  if (isValid) {
    // no validation errors in the entity itself, so add it ready for completion
    myAPIQualifications[lineValidator.lineNumber] = thisApiQualification;

    // associate the qualification entity to the Worker
    thisApiWorker.associateQualification(thisApiQualification);
  } else {
    const errors = thisApiQualification.errors;
    const warnings = thisApiQualification.warnings;

    lineValidator.addQualificationAPIValidation(thisQual.column, errors, warnings);

    if (errors.length === 0) {
      myAPIQualifications[lineValidator.lineNumber] = thisApiQualification;

      // associate the qualification entity to the Worker
      thisApiWorker.associateQualification(thisApiQualification);
    }
  }
};

const validateWorkerCsv = async (
  thisLine,
  currentLineNumber,
  csvWorkerSchemaErrors,
  myWorkers,
  myAPIWorkers,
  myAPIQualifications,
  myCurrentEstablishments,
  keepAlive = () => {}
) => {
  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  const lineValidator = new WorkerCsvValidator(thisLine, currentLineNumber, myCurrentEstablishments);

  lineValidator.validate();
  lineValidator.transform();

  const thisWorkerAsAPI = lineValidator.toAPI();

  try {
    // construct Worker entity
    const thisApiWorker = new Worker();
    await thisApiWorker.load(thisWorkerAsAPI);

    keepAlive('worker loaded', currentLineNumber);

    if (thisApiWorker.validate()) {
      // no validation errors in the entity itself, so add it ready for completion
      myAPIWorkers[currentLineNumber] = thisApiWorker;

      // construct Qualification entities (can be multiple of a single Worker record) - regardless of whether the
      //  Worker is valid or not; we need to return as many errors/warnings in one go as possible
      await Promise.all(lineValidator.toQualificationAPI().map(thisQual => loadWorkerQualifications(
        lineValidator,
        thisQual,
        thisApiWorker,
        myAPIQualifications,
        keepAlive
      )));
    } else {
      const errors = thisApiWorker.errors;

      if (errors.length === 0) {
        myAPIWorkers[currentLineNumber] = thisApiWorker;
      }
    }
  } catch (err) {
    console.error('WA - localised validate workers error until validation card', err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach(thisError => csvWorkerSchemaErrors.push(thisError));
  }

  myWorkers.push(lineValidator);
};

const validateTrainingCsv = async (
  thisLine,
  currentLineNumber,
  csvTrainingSchemaErrors,
  myTrainings,
  myAPITrainings,
  keepAlive = () => {}
) => {
  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  const lineValidator = new TrainingCsvValidator(thisLine, currentLineNumber);

  lineValidator.validate();
  lineValidator.transform();

  const thisTrainingAsAPI = lineValidator.toAPI();
  try {
    const thisApiTraining = new Training();
    const isValid = await thisApiTraining.load(thisTrainingAsAPI);

    keepAlive('training loaded', currentLineNumber);

    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      myAPITrainings[currentLineNumber] = thisApiTraining;
    } else {
      const errors = thisApiTraining.errors;

      if (errors.length === 0) {
        myAPITrainings[currentLineNumber] = thisApiTraining;
      }
    }
  } catch (err) {
    console.error('WA - localised validate training error until validation card', err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach(thisError => csvTrainingSchemaErrors.push(thisError));
  }

  myTrainings.push(lineValidator);
};

// if commit is false, then the results of validation are not uploaded to S3
const validateBulkUploadFiles = async (
  commit,
  username,
  establishmentId,
  isParent,
  establishments,
  workers,
  training,
  keepAlive = () => {}
) => {
  const csvEstablishmentSchemaErrors = [];
  const csvWorkerSchemaErrors = [];
  const csvTrainingSchemaErrors = [];

  const myEstablishments = [];
  const myWorkers = [];
  const myTrainings = [];
  const workersKeyed = [];

  const validateStartTime = new Date();

  // restore the current known state this primary establishment (including all subs)
  const RESTORE_ASSOCIATION_LEVEL = 1;

  keepAlive('begin validate files', establishmentId); // keep connection alive

  const myCurrentEstablishments = await restoreExistingEntities(username, establishmentId, isParent, RESTORE_ASSOCIATION_LEVEL, false, keepAlive);

  const validateRestoredStateTime = new Date();

  timerLog('WA DEBUG - have restored existing state as reference', validateStartTime, validateRestoredStateTime);

  // rather than an array of entities, entities will be known by their line number within the source, e.g:
  // establishments: {
  //    1: { },
  //    2: { },
  //    ...
  // }
  const myAPIEstablishments = {};
  const myAPIWorkers = {};
  const myAPITrainings = {};
  const myAPIQualifications = {};

  // for unique/cross-reference validations
  const allEstablishmentsByKey = {};
  const allWorkersByKey = {};

  // /////////////////////////
  // Parse and process Establishments CSV
  if (Array.isArray(establishments.imported) && establishments.imported.length > 0 && establishments.establishmentMetadata.fileType === 'Establishment') {
    // validate all establishment rows
    await Promise.all(establishments.imported.map((thisLine, currentLineNumber) => validateEstablishmentCsv(
      thisLine,
      currentLineNumber + 2,
      csvEstablishmentSchemaErrors,
      myEstablishments,
      myAPIEstablishments,
      myCurrentEstablishments,
      keepAlive
    )));

    // having parsed all establishments, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'LOCALESTID` as property name
    myEstablishments.forEach(thisEstablishment => {
      const keyNoWhitespace = thisEstablishment.localId.replace(/\s/g, '');
      if (allEstablishmentsByKey[keyNoWhitespace]) {
        // this establishment is a duplicate
        csvEstablishmentSchemaErrors.push(thisEstablishment.addDuplicate(allEstablishmentsByKey[keyNoWhitespace]));

        // remove the entity
        delete myAPIEstablishments[keyNoWhitespace];
      } else {
        // does not yet exist
        allEstablishmentsByKey[keyNoWhitespace] = thisEstablishment.lineNumber;
      }
    });
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no establishment records');
  }

  const validateEstablishmentsTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have validated establishments', validateRestoredStateTime, validateEstablishmentsTime);

  establishments.establishmentMetadata.records = myEstablishments.length;

  // /////////////////////////
  // Parse and process Workers CSV
  if (Array.isArray(workers.imported) && workers.imported.length > 0 && workers.workerMetadata.fileType === 'Worker') {
    await Promise.all(workers.imported.map((thisLine, currentLineNumber) => validateWorkerCsv(
      thisLine,
      currentLineNumber + 2,
      csvWorkerSchemaErrors,
      myWorkers,
      myAPIWorkers,
      myAPIQualifications,
      myCurrentEstablishments,
      keepAlive
    )));

    keepAlive('workers validated'); // keep connection alive

    // having parsed all workers, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'UNIQUEWORKERID`as property name
    myWorkers.forEach(thisWorker => {
      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = (thisWorker.local + thisWorker.uniqueWorker).replace(/\s/g, '');
      const changeKeyNoWhitespace = thisWorker.changeUniqueWorker ? (thisWorker.local + thisWorker.changeUniqueWorker).replace(/\s/g, '') : null;

      if (allWorkersByKey[keyNoWhitespace]) {
        // this worker is a duplicate
        csvWorkerSchemaErrors.push(thisWorker.addDuplicate(allWorkersByKey[keyNoWhitespace]));

        // remove the entity
        delete myAPIWorkers[thisWorker.lineNumber];

      // the worker will be known by LOCALSTID and UNIQUEWORKERID, but if CHGUNIQUEWORKERID is given, then it's combination of LOCALESTID and CHGUNIQUEWORKERID must be unique
      } else if (changeKeyNoWhitespace && allWorkersByKey[changeKeyNoWhitespace]) {
        // this worker is a duplicate
        csvWorkerSchemaErrors.push(thisWorker.addChgDuplicate(allWorkersByKey[keyNoWhitespace]));

        // remove the entity
        delete myAPIWorkers[thisWorker.lineNumber];
      } else {
        // does not yet exist - check this worker can be associated with a known establishment
        const establishmentKeyNoWhitespace = thisWorker.local ? thisWorker.local.replace(/\s/g, '') : '';

        const myWorkersTotalHours = myWorkers.reduce((sum, thatWorker) => {
          if (thisWorker.nationalInsuranceNumber === thatWorker.nationalInsuranceNumber) {
            if (thatWorker.weeklyContractedHours) {
              return sum + thatWorker.weeklyContractedHours;
            }
            if (thatWorker.weeklyAverageHours) {
              return sum + thatWorker.weeklyAverageHours;
            }
          }
          return sum;
        }, 0);

        if (myWorkersTotalHours > 65) {
          csvWorkerSchemaErrors.push(thisWorker.exceedsNationalInsuranceMaximum());
        }

        if (!allEstablishmentsByKey[establishmentKeyNoWhitespace]) {
          // not found the associated establishment
          csvWorkerSchemaErrors.push(thisWorker.uncheckedEstablishment());

          // remove the entity
          delete myAPIWorkers[thisWorker.lineNumber];
        } else {
          // this worker is unique and can be associated to establishment
          allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;

          // to prevent subsequent Worker duplicates, add also the change worker id if CHGUNIQUEWORKERID is given
          if (changeKeyNoWhitespace) {
            allWorkersByKey[changeKeyNoWhitespace] = thisWorker.lineNumber;
          }

          // associate this worker to the known establishment
          const knownEstablishment = myAPIEstablishments[establishmentKeyNoWhitespace] ? myAPIEstablishments[establishmentKeyNoWhitespace] : null;

          // key workers, to be used in training
          const workerKeyNoWhitespace = (thisWorker._currentLine.LOCALESTID + thisWorker._currentLine.UNIQUEWORKERID).replace(/\s/g, '');
          workersKeyed[workerKeyNoWhitespace] = thisWorker._currentLine;

          if (knownEstablishment && myAPIWorkers[thisWorker.lineNumber]) {
            knownEstablishment.associateWorker(myAPIWorkers[thisWorker.lineNumber].key, myAPIWorkers[thisWorker.lineNumber]);
          } else {
            // this should never happen
            console.error(`FATAL: failed to associate worker (line number: ${thisWorker.lineNumber}/unique id (${thisWorker.uniqueWorker})) with a known establishment.`);
          }
        }
      }
    });
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no workers records');
  }
  workers.workerMetadata.records = myWorkers.length;

  const validateWorkersTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have validated workers', validateEstablishmentsTime, validateWorkersTime);

  // /////////////////////////
  // Parse and process Training CSV
  if (Array.isArray(training.imported) && training.imported.length > 0 && training.trainingMetadata.fileType === 'Training') {
    await Promise.all(training.imported.map((thisLine, currentLineNumber) => validateTrainingCsv(
      thisLine,
      currentLineNumber + 2,
      csvTrainingSchemaErrors,
      myTrainings,
      myAPITrainings
    )));

    keepAlive('trainings processed');

    // note - there is no uniqueness test for a training record

    // Having parsed all establishments, workers and training, need to cross-check all training records' establishment reference
    // (LOCALESTID) against all parsed establishments
    // Having parsed all establishments, workers and training, need to cross-check all training records' worker reference
    // (UNIQUEWORKERID) against all parsed workers
    myTrainings.forEach(thisTraingRecord => {
      const establishmentKeyNoWhitespace = (thisTraingRecord.localeStId || '').replace(/\s/g, '');
      const workerKeyNoWhitespace = ((thisTraingRecord.localeStId || '') + (thisTraingRecord.uniqueWorkerId || '')).replace(/\s/g, '');

      if (!allEstablishmentsByKey[establishmentKeyNoWhitespace]) {
        // not found the associated establishment
        csvTrainingSchemaErrors.push(thisTraingRecord.uncheckedEstablishment());

        // remove the entity
        delete myAPITrainings[thisTraingRecord.lineNumber];
      } else if (!allWorkersByKey[workerKeyNoWhitespace]) {
        // not found the associated worker
        csvTrainingSchemaErrors.push(thisTraingRecord.uncheckedWorker());

        // remove the entity
        delete myAPITrainings[thisTraingRecord.lineNumber];
      } else {
        // gets here, all is good with the training record

        // find the associated Worker entity and forward reference this training record
        const foundWorkerByLineNumber = allWorkersByKey[workerKeyNoWhitespace];
        const knownWorker = foundWorkerByLineNumber ? myAPIWorkers[foundWorkerByLineNumber] : null;

        // training cross-validation against worker's date of birth (DOB) can only be applied, if:
        //  1. the associated Worker can be matched
        //  2. the worker has DOB defined (it's not a mandatory property)
        const trainingCompletedDate = moment.utc(thisTraingRecord._currentLine.DATECOMPLETED, 'DD-MM-YYYY');
        const foundAssociatedWorker = workersKeyed[workerKeyNoWhitespace];
        const workerDob = foundAssociatedWorker && foundAssociatedWorker.DOB ? moment.utc(workersKeyed[workerKeyNoWhitespace].DOB, 'DD-MM-YYYY') : null;

        if (workerDob && workerDob.isValid() && trainingCompletedDate.diff(workerDob, 'years') < 14) {
          csvTrainingSchemaErrors.push(thisTraingRecord.dobTrainingMismatch());
        }

        if (knownWorker) {
          knownWorker.associateTraining(myAPITrainings[thisTraingRecord.lineNumber]);
        } else {
          // this should never happen
          console.error(`FATAL: failed to associate worker (line number: ${thisTraingRecord.lineNumber}/unique id (${thisTraingRecord.uniqueWorker})) with a known establishment.`);
        }
      }
    });
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no training records');
  }

  training.trainingMetadata.records = myTrainings.length;

  const validateTrainingTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have validated training', validateWorkersTime, validateTrainingTime);

  // /////////////////////////
  // Cross Entity Validations

  // If the logged in account performing this validation is not a parent, then
  // there should be just one establishment, and that establishment should the primary establishment
  if (!isParent) {
    const MAX_ESTABLISHMENTS = 1;

    if (establishments.imported.length !== MAX_ESTABLISHMENTS) {
      csvEstablishmentSchemaErrors.unshift(EstablishmentCsvValidator.justOneEstablishmentError());
    }
  }

  // The primary establishment should always be present
  // TODO - should use LOCAL_IDENTIFIER when available.
  const primaryEstablishment = myCurrentEstablishments.find(thisCurrentEstablishment => thisCurrentEstablishment.id === establishmentId);

  if (primaryEstablishment) {
    const onloadedPrimaryEstablishment = myAPIEstablishments[primaryEstablishment.key];

    if (!onloadedPrimaryEstablishment) {
      csvEstablishmentSchemaErrors.unshift(EstablishmentCsvValidator.missingPrimaryEstablishmentError(primaryEstablishment.name));
    } else {
      // primary establishment does exist in given CSV; check STATUS is not DELETE - cannot delete the primary establishment
      if (onloadedPrimaryEstablishment.status === 'DELETE') {
        csvEstablishmentSchemaErrors.unshift(EstablishmentCsvValidator.cannotDeletePrimaryEstablishmentError(primaryEstablishment.name));
      }
    }
  } else {
    console.error(('Seriously, if seeing this then something has truely gone wrong - the primary establishment should always be in the set of current establishments!'));
  }

  // Check for trying to upload against subsidaries for which this parent does not own (if a parent) - ignore the primary (self) establishment
  // must be a parent
  if (isParent) {
    Object.values(myAPIEstablishments).forEach(thisOnloadEstablishment => {
      if (thisOnloadEstablishment.key !== primaryEstablishment.key) {
        // we're not the primary
        const foundCurrentEstablishment = myCurrentEstablishments.find(thisCurrentEstablishment =>
          thisCurrentEstablishment.key === thisOnloadEstablishment.key
        );

        if (foundCurrentEstablishment && foundCurrentEstablishment.dataOwner !== 'Parent') {
          const lineValidator = myEstablishments.find(thisLineValidator => thisLineValidator.key === foundCurrentEstablishment.key);

          csvEstablishmentSchemaErrors.unshift(lineValidator.addNotOwner());
        }
      }
    });
  }

  // Run validations that require information about workers
  await Promise.all(myEstablishments.map(async establishment => {
    await establishment.crossValidate({
      csvEstablishmentSchemaErrors,
      myWorkers,
      fetchMyEstablishmentsWorkers: Establishment.fetchMyEstablishmentsWorkers
    });
  }));

  // /////////////////////////
  // Prepare validation results

  // prepare entities ready for upload/return
  const establishmentsAsArray = Object.values(myAPIEstablishments);
  const workersAsArray = Object.values(myAPIWorkers);
  const trainingAsArray = Object.values(myAPITrainings);
  const qualificationsAsArray = Object.values(myAPIQualifications);

  // update CSV metadata error/warning counts
  establishments.establishmentMetadata.errors = csvEstablishmentSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  establishments.establishmentMetadata.warnings = csvEstablishmentSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  workers.workerMetadata.errors = csvWorkerSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  workers.workerMetadata.warnings = csvWorkerSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  training.trainingMetadata.errors = csvTrainingSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  training.trainingMetadata.warnings = csvTrainingSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  // set the status based upon whether there were errors or warnings
  let status = buStates.FAILED;
  if ((
    establishments.establishmentMetadata.errors +
    workers.workerMetadata.errors +
    training.trainingMetadata.errors) === 0
  ) {
    status = (
      establishments.establishmentMetadata.warnings +
    workers.workerMetadata.warnings +
    training.trainingMetadata.warnings
    ) === 0
      ? buStates.PASSED
      : buStates.WARNINGS;
  }

  const validateCompleteTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have cross-checked validations', validateTrainingTime, validateCompleteTime);
  timerLog('CHECKPOINT - BU Validate - overall validations', validateRestoredStateTime, validateCompleteTime);

  // create the difference report, which includes trapping for deleting of primary establishment
  const report = validationDifferenceReport(establishmentId, establishmentsAsArray, myCurrentEstablishments);

  const validateDifferenceReportTime = new Date();
  timerLog('CHECKPOINT - BU Validate - diference report', validateCompleteTime, validateDifferenceReportTime);
  timerLog(
    'CHECKPOINT - BU Validate - overall validations including restoring state and difference report',
    validateStartTime,
    validateDifferenceReportTime
  );

  // from the validation report, get a summary of deleted establishments and workers
  // the report will always have new, udpated, deleted array values, even if empty
  // Note - Array.reduce but it doesn't work with empty arrays, except when you provide an initial value (0 in this case)
  establishments.establishmentMetadata.deleted = report.deleted.length;
  const numberOfDeletedWorkersFromUpdatedEstablishments = report.updated.reduce((total, current) => total + current.workers.deleted.length, 0);
  const numberOfDeletedWorkersFromDeletedEstablishments = report.deleted.reduce((total, current) => total + current.workers.deleted.length, 0);
  workers.workerMetadata.deleted = numberOfDeletedWorkersFromUpdatedEstablishments + numberOfDeletedWorkersFromDeletedEstablishments;

  // upload intermediary/validation S3 objects
  if (commit) {
    const s3UploadPromises = [];

    // upload the metadata as JSON to S3 - these are requested for uploaded list endpoint
    if (establishments.imported) {
      s3UploadPromises.push(uploadAsJSON(
        username,
        establishmentId,
        establishments.establishmentMetadata,
        `${establishmentId}/latest/${establishments.establishmentMetadata.filename}.metadata.json`
      ));
    }

    if (workers.imported) {
      s3UploadPromises.push(uploadAsJSON(
        username,
        establishmentId,
        workers.workerMetadata,
        `${establishmentId}/latest/${workers.workerMetadata.filename}.metadata.json`
      ));
    }

    if (training.imported) {
      s3UploadPromises.push(uploadAsJSON(
        username,
        establishmentId,
        training.trainingMetadata,
        `${establishmentId}/latest/${training.trainingMetadata.filename}.metadata.json`
      ));
    }

    // upload the validation data to S3 - these are reuquired for validation report -
    // although one object is likely to be quicker to upload - and only one object is required then to download
    s3UploadPromises.push(uploadAsJSON(
      username,
      establishmentId,
      csvEstablishmentSchemaErrors,
      `${establishmentId}/validation/establishments.validation.json`
    ));

    s3UploadPromises.push(uploadAsJSON(
      username,
      establishmentId,
      csvWorkerSchemaErrors,
      `${establishmentId}/validation/workers.validation.json`
    ));

    s3UploadPromises.push(uploadAsJSON(
      username,
      establishmentId,
      csvTrainingSchemaErrors,
      `${establishmentId}/validation/training.validation.json`
    ));

    s3UploadPromises.push(uploadAsJSON(
      username,
      establishmentId,
      report,
      `${establishmentId}/validation/difference.report.json`
    ));

    // to false to disable the upload of intermediary objects
    // the all entities intermediary file is required on completion - establishments entity for validation report
    if (establishmentsAsArray.length > 0) {
      s3UploadPromises.push(uploadAsJSON(
        username,
        establishmentId,
        establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON(false, false, false, false, true, null, true)),
        `${establishmentId}/intermediary/all.entities.json`
      ));
    }

    // for the purpose of the establishment validation report, need a list of all unique local authorities against all establishments
    const establishmentsOnlyForJson = establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON());
    const uniqueLocalAuthorities = establishmentsOnlyForJson.map(en => en.localAuthorities !== undefined ? en.localAuthorities : [])
      .reduce((acc, val) => acc.concat(val), [])
      .map(la => la.name)
      .sort((a, b) => a > b)
      .filter((value, index, self) => self.indexOf(value) === index);

    s3UploadPromises.push(uploadAsJSON(
      username,
      establishmentId,
      uniqueLocalAuthorities,
      `${establishmentId}/intermediary/all.localauthorities.json`
    ));

    if (config.get('bulkupload.validation.storeIntermediaries')) {
      // upload the converted CSV as JSON to S3 - these are temporary objects as we build confidence in bulk upload they can be removed
      if (myEstablishments.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          myEstablishments.map(thisEstablishment => thisEstablishment.toJSON()),
          `${establishmentId}/intermediary/${establishments.establishmentMetadata.filename}.csv.json`
        ));
      }

      if (myWorkers.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          myWorkers.map(thisEstablishment => thisEstablishment.toJSON()),
          `${establishmentId}/intermediary/${workers.workerMetadata.filename}.csv.json`
        ));
      }

      if (myTrainings.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          myTrainings.map(thisEstablishment => thisEstablishment.toJSON()),
          `${establishmentId}/intermediary/${training.trainingMetadata.filename}.csv.json`
        ));
      }

      // upload the intermediary entities as JSON to S3
      if (establishmentsAsArray.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          establishmentsOnlyForJson,
          `${establishmentId}/intermediary/establishment.entities.json`
        ));
      }

      if (workersAsArray.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          workersAsArray.map(thisWorker => thisWorker.toJSON()),
          `${establishmentId}/intermediary/worker.entities.json`
        ));
      }

      if (trainingAsArray.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          trainingAsArray.map(thisTraining => thisTraining.toJSON()),
          `${establishmentId}/intermediary/training.entities.json`
        ));
      }

      if (qualificationsAsArray.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          qualificationsAsArray.map(thisQualification => thisQualification.toJSON()),
          `${establishmentId}/intermediary/qualification.entities.json`
        ));
      }
    }

    // before returning, wait for all uploads to complete
    await Promise.all(s3UploadPromises);
  }

  const validateS3UploadTime = new Date();
  timerLog('CHECKPOINT - BU Validate - upload artifacts to S3', validateDifferenceReportTime, validateS3UploadTime);

  timerLog('CHECKPOINT - BU Validate - total', validateStartTime, validateS3UploadTime);

  return {
    status,
    report,
    validation: {
      establishments: csvEstablishmentSchemaErrors,
      workers: csvWorkerSchemaErrors,
      training: csvTrainingSchemaErrors
    },
    metaData: {
      establishments: establishments.establishmentMetadata,
      workers: workers.workerMetadata,
      training: training.trainingMetadata
    },
    data: {
      csv: {
        establishments: myEstablishments.map(thisEstablishment => thisEstablishment.toJSON()),
        workers: myWorkers.map(thisWorker => thisWorker.toJSON()),
        training: myTrainings.map(thisTraining => thisTraining.toJSON())
      },
      entities: {
        establishments: establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON()),
        workers: workersAsArray.map(thisWorker => thisWorker.toJSON()),
        training: trainingAsArray.map(thisTraining => thisTraining.toJSON()),
        qualifications: qualificationsAsArray.map(thisQualification => thisQualification.toJSON())
      },
      resulting: establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON(false, false, false, false, true, null, true))
    }
  };
};

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
// the "onlyMine" parameter is used to remove those subsidiary establishments where the parent is not the owner
const restoreExistingEntities = async (
  loggedInUsername,
  primaryEstablishmentId,
  isParent,
  assocationLevel = 1,
  onlyMine = false,
  keepAlive = () => {}
) => {
  try {
    const completionBulkUploadStatus = 'COMPLETE';
    const thisUser = new User(primaryEstablishmentId);
    await thisUser.restore(null, loggedInUsername, false);

    keepAlive('begin restore entities'); // keep connection alive

    // gets a list of "my establishments", which if a parent, includes all known subsidaries too, and this "parent's" access permissions to those subsidaries
    const myEstablishments = await thisUser.myEstablishments(isParent, null);
    keepAlive('establishments retrieved'); // keep connection alive

    // having got this list of establishments, now need to fully restore each establishment as entities.
    //  using an object adding entities by a known key to make lookup comparisions easier.
    const currentEntities = [];
    const restoreEntityPromises = [];

    // first add the primary establishment entity
    const primaryEstablishment = new Establishment(loggedInUsername, completionBulkUploadStatus);
    currentEntities.push(primaryEstablishment);

    restoreEntityPromises.push(primaryEstablishment.restore(myEstablishments.primary.uid, false, true, assocationLevel).then(data => {
      keepAlive('establishment restored', myEstablishments.primary.uid); // keep connection alive

      return data;
    }));

    if (myEstablishments.subsidaries && myEstablishments.subsidaries.establishments && Array.isArray(myEstablishments.subsidaries.establishments)) {
      myEstablishments.subsidaries.establishments.forEach(thisSubsidairy => {
        if (!onlyMine || (onlyMine && thisSubsidairy.dataOwner === 'Parent')) {
          const newSub = new Establishment(loggedInUsername, completionBulkUploadStatus);

          currentEntities.push(newSub);

          restoreEntityPromises.push(newSub.restore(thisSubsidairy.uid, false, true, assocationLevel).then(data => {
            keepAlive('sub establishment restored', thisSubsidairy.uid); // keep connection alive

            return data;
          }));
        }
      });
    }

    await Promise.all(restoreEntityPromises);

    return currentEntities;
  } catch (err) {
    console.error('/restoreExistingEntities: ERR: ', err.message);
    throw err;
  }
};

// having validated bulk upload files - and generated any number of validation errors and warnings
//  if there are no error, then the user will be able to complete the upload. But to be
//  able to complete on the upload though, they will need a report highlighting which, if any, of the
//  the establishments and workers will be deleted.
// Only generate this validation difference report, if there are no errors.
const validationDifferenceReport = (
  primaryEstablishmentId,
  onloadEntities,
  currentEntities
) => {
  const newEntities = [];
  const updatedEntities = [];
  const deletedEntities = [];

  if (!onloadEntities || !Array.isArray(onloadEntities)) {
    console.error('validationDifferenceReport: onload entities unexpected');
  }
  if (!currentEntities || !Array.isArray(currentEntities)) {
    console.error('validationDifferenceReport: current entities unexpected');
  }

  // determine new and updated establishments, by referencing the onload set against the current set
  onloadEntities.forEach(thisOnloadEstablishment => {
    // find a match for this establishment
    const foundCurrentEstablishment = currentEntities.find(thisCurrentEstablishment => thisCurrentEstablishment.key === thisOnloadEstablishment.key);

    if (foundCurrentEstablishment) {
      // for updated establishments, need to cross check the set of onload and current workers to identify the new, updated and deleted workers
      const currentWorkers = foundCurrentEstablishment.associatedWorkers;
      const onloadWorkers = thisOnloadEstablishment.associatedWorkers;
      const newWorkers = [];
      const updatedWorkers = [];
      const deletedWorkers = [];

      // find new/updated/deleted workers
      onloadWorkers.forEach(thisOnloadWorker => {
        const foundWorker = currentWorkers.find(thisCurrentWorker =>
          thisCurrentWorker === thisOnloadWorker
        );

        if (foundWorker) {
          const theWorker = foundCurrentEstablishment.theWorker(foundWorker);
          const theOnloadWorker = thisOnloadEstablishment.theWorker(thisOnloadWorker);

          // note - even though a worker has been found - and therefore it is obvious to update it
          // it may be marked for deletion
          if (theOnloadWorker.status === 'DELETE') {
            deletedWorkers.push({
              key: thisOnloadWorker,
              name: theWorker.nameOrId,
              localId: theWorker.localIdentifier,
              status: theOnloadWorker.status
            });
          } else {
            updatedWorkers.push({
              key: thisOnloadWorker,
              name: theWorker.nameOrId,
              localId: theWorker.localIdentifier,
              status: theOnloadWorker.status
            });
          }
        } else {
          const theWorker = thisOnloadEstablishment.theWorker(thisOnloadWorker);
          newWorkers.push({
            key: thisOnloadWorker,
            name: theWorker.nameOrId,
            localId: theWorker.localIdentifier,
            status: theWorker.status
          });
        }
      });

      // find deleted workers
      currentWorkers.forEach(thisCurrentWorker => {
        const foundWorker = onloadWorkers.find(thisOnloadWorker => thisCurrentWorker === thisOnloadWorker);

        if (!foundWorker) {
          const theWorker = foundCurrentEstablishment.theWorker(thisCurrentWorker);
          deletedWorkers.push({
            key: thisCurrentWorker,
            name: theWorker.nameOrId,
            localId: theWorker.localIdentifier,
            status: 'DELETED' // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight this has been automatically detected
          });
        }
      });

      // even though the establishment has found, it is obvious that it will be updated. But it could
      //  instead be marked for deletion
      if (thisOnloadEstablishment.status === 'DELETE') {
        // now, when deleting an establishment, all the workers are also deleted, regardless of their declared status
        const revisedSetOfDeletedWorkers = [...newWorkers, ...updatedWorkers, ...deletedWorkers];
        deletedEntities.push({
          key: thisOnloadEstablishment.key,
          name: thisOnloadEstablishment.name,
          localId: thisOnloadEstablishment.localIdentifier,
          status: thisOnloadEstablishment.status,
          workers: {
            deleted: revisedSetOfDeletedWorkers
          }
        });
      } else {
        updatedEntities.push({
          key: thisOnloadEstablishment.key,
          name: thisOnloadEstablishment.name,
          localId: thisOnloadEstablishment.localIdentifier,
          status: thisOnloadEstablishment.status,
          workers: {
            new: newWorkers,
            updated: updatedWorkers,
            deleted: deletedWorkers
          }
        });
      }
    } else {
      newEntities.push({
        key: thisOnloadEstablishment.key,
        name: thisOnloadEstablishment.name,
        localId: thisOnloadEstablishment.localIdentifier,
        status: thisOnloadEstablishment.status
      });
    }
  });

  // determine the delete establishments, by reference the current set against the onload set
  currentEntities.forEach(thisCurrentEstablishment => {
    if (thisCurrentEstablishment.id !== primaryEstablishmentId) {
      // ignore those establishments that the primary does not own
      if (thisCurrentEstablishment.parentUid && thisCurrentEstablishment.dataOwner === 'Parent') {
        // find a match for this establishment
        const foundOnloadEstablishment = onloadEntities.find(thisOnloadEstablishment => thisCurrentEstablishment.key === thisOnloadEstablishment.key);

        // cannot delete self
        if (!foundOnloadEstablishment) {
          // when delete an establishment, we're deleting all workers too
          const currentWorkers = thisCurrentEstablishment.associatedWorkers;
          const deletedWorkers = [];

          currentWorkers.forEach(thisCurrentWorker => {
            const thisWorker = thisCurrentEstablishment.theWorker(thisCurrentWorker);
            deletedWorkers.push({
              key: thisCurrentWorker,
              name: thisWorker.nameOrId,
              localId: thisWorker.localIdentifier,
              status: 'DELETED' // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight
              // this has been automatically detected
            });
          });

          deletedEntities.push({
            key: thisCurrentEstablishment.key,
            name: thisCurrentEstablishment.name,
            localId: thisCurrentEstablishment.localIdentifier,
            status: 'DELETED', // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight
            // this has been automatically detected
            workers: {
              deleted: deletedWorkers
            }
          });
        }
      }
    } else {
      // TODO
      // need to raise a validation error as a result of trying to delete self
    }
  });

  // return validation difference report
  return {
    new: newEntities,
    updated: updatedEntities,
    deleted: deletedEntities
  };
};

const reportGet = async (req, res) => {
  const NEWLINE = '\r\n';
  const reportTypes = ['training', 'establishments', 'workers'];
  const reportType = req.params.reportType;
  const readable = [];

  try {
    if (!reportTypes.includes(reportType)) {
      throw new Error(`router.route('/report').get - Invalid report type, valid types include - ${reportTypes.join(', ')}`);
    }

    let entities = null;
    let messages = null;
    let differenceReport = null;

    const entityKey = `${req.establishmentId}/intermediary/all.localauthorities.json`;
    const differenceReportKey = `${req.establishmentId}/validation/difference.report.json`;

    try {
      const establishment = await downloadContent(entityKey);
      const differenceReportS3 = await downloadContent(differenceReportKey);
      entities = establishment ? JSON.parse(establishment.data) : null;
      differenceReport = differenceReportS3 ? JSON.parse(differenceReportS3.data) : null;
    } catch (err) {
      throw new Error('router.route(\'/report\').get - failed to download: ', entityKey);
    }

    const reportKey = `${req.establishmentId}/validation/${reportType}.validation.json`;

    try {
      const content = await downloadContent(reportKey);
      messages = content ? JSON.parse(content.data) : null;
    } catch (err) {
      throw new Error('router.route(\'/report\').get - failed to download: ', reportKey);
    }

    const errorTitle = '* Errors (will cause file(s) to be rejected) *';
    const errorPadding = '*'.padStart(errorTitle.length, '*');
    readable.push(`${errorPadding}${NEWLINE}${errorTitle}${NEWLINE}${errorPadding}${NEWLINE}`);

    const errors = messages
      .reduce((acc, val) => acc.concat(val), [])
      .filter(msg => msg.errCode && msg.errType)
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .reduce((result, item) => ({
        ...result,
        [item.error]: [...(result[item.error] || []), item]
      }), {});

    printLine(readable, reportType, errors, NEWLINE);

    const warningTitle = '* Warnings (files will be accepted but data is incomplete or internally inconsistent) *';
    const warningPadding = '*'.padStart(warningTitle.length, '*');
    readable.push(`${NEWLINE}${warningPadding}${NEWLINE}${warningTitle}${NEWLINE}${warningPadding}${NEWLINE}`);

    const warnings = messages
      .reduce((acc, val) => acc.concat(val), [])
      .filter(msg => msg.warnCode && msg.warnType)
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .reduce((result, item) => ({ ...result, [item.warning]: [...(result[item.warning] || []), item] }), {});

    printLine(readable, reportType, warnings, NEWLINE);

    if (reportType === 'establishments') {
      const laTitle = '* You are sharing data with the following Local Authorities *';
      const laPadding = '*'.padStart(laTitle.length, '*');
      readable.push(`${NEWLINE}${laPadding}${NEWLINE}${laTitle}${NEWLINE}${laPadding}${NEWLINE}`);

      if (entities) {
        entities.forEach(item => readable.push(`${item}${NEWLINE}`));
      }

      // list all establishments that are being deleted
      if (differenceReport && differenceReport.deleted && Array.isArray(differenceReport.deleted) && differenceReport.deleted.length > 0) {
        const deletedTitle = '* Deleted (the following Workplaces will be deleted) *';
        const deletedPadding = '*'.padStart(deletedTitle.length, '*');
        readable.push(`${NEWLINE}${deletedPadding}${NEWLINE}${deletedTitle}${NEWLINE}${deletedPadding}${NEWLINE}`);

        differenceReport.deleted
          .sort((x, y) => x.name > y.name)
          .forEach(thisDeletedEstablishment => {
            readable.push(`"${thisDeletedEstablishment.name}" (LOCALSTID - ${thisDeletedEstablishment.localId})${NEWLINE}`);
          });
      }
    }

    if (reportType === 'workers') {
      // list all workers that are being deleted
      if (differenceReport) {
        const numberOfDeletedWorkersFromUpdatedEstablishments =
          differenceReport.updated.reduce((total, current) => total + current.workers.deleted.length, 0);
        const numberOfDeletedWorkersFromDeletedEstablishments =
          differenceReport.deleted.reduce((total, current) => total + current.workers.deleted.length, 0);

        if (numberOfDeletedWorkersFromDeletedEstablishments) {
          const deletedTitle = '* Deleted Workplaces (the following Staff will be deleted) *';
          const deletedPadding = '*'.padStart(deletedTitle.length, '*');
          readable.push(`${NEWLINE}${deletedPadding}${NEWLINE}${deletedTitle}${NEWLINE}${deletedPadding}${NEWLINE}`);

          differenceReport.deleted
            .sort((x, y) => x.name > y.name)
            .forEach(thisDeletedEstablishment => {
              if (thisDeletedEstablishment.workers && thisDeletedEstablishment.workers.deleted) {
                thisDeletedEstablishment.workers.deleted
                  .sort((x, y) => x.name > y.name)
                  .forEach(thisWorker => {
                    readable.push(
                      `"${thisDeletedEstablishment.name}" (LOCALSTID - ${thisDeletedEstablishment.localId}) - "${thisWorker.name}" (UNIQUEWORKERID - ${thisWorker.localId})${NEWLINE}`
                    );
                  });
              }
            });
        }

        if (numberOfDeletedWorkersFromUpdatedEstablishments) {
          const deletedTitle = '* Existing Workplaces (the following Staff will be deleted) *';
          const deletedPadding = '*'.padStart(deletedTitle.length, '*');
          readable.push(`${NEWLINE}${deletedPadding}${NEWLINE}${deletedTitle}${NEWLINE}${deletedPadding}${NEWLINE}`);

          differenceReport.updated
            .sort((x, y) => x.name > y.name)
            .forEach(thisUpdatedEstablishment => {
              if (thisUpdatedEstablishment.workers && thisUpdatedEstablishment.workers.deleted) {
                thisUpdatedEstablishment.workers.deleted
                  .sort((x, y) => x.name > y.name)
                  .forEach(thisWorker => {
                    readable.push(
                      `"${thisUpdatedEstablishment.name}" (LOCALSTID - ${thisUpdatedEstablishment.localId})- "${thisWorker.name}" (UNIQUEWORKERID - ${thisWorker.localId})${NEWLINE}`
                    );
                  });
              }
            });
        }
      }
    }

    await saveResponse(req, res, 200, readable.join(NEWLINE), {
      'Content-Type': 'text/plain',
      'Content-disposition': `attachment; filename=${getFileName(reportType)}`
    });
  } catch (err) {
    console.error(err);
    await saveResponse(req, res, 503, {});
  }
};

const printLine = (readable, reportType, errors, sep) => {
  Object.keys(errors).forEach(key => {
    readable.push(`${sep}${key}${sep}`);
    errors[key].forEach(item => {
      if (reportType === 'training') {
        return readable.push(`For worker with ${item.name} Subsidiary 3 and UNIQUEWORKERID ${item.worker} on line ${item.lineNumber}${sep}`);
      } else if (reportType === 'establishments') {
        return readable.push(`For establishment called ${item.name} on line ${item.lineNumber}${sep}`);
      } else if (reportType === 'workers') {
        return readable.push(`For worker with LOCALESTID ${item.name} and UNIQUEWORKERID ${item.worker} on line ${item.lineNumber}${sep}`);
      }
    });
  });
};

const getFileName = reportType => {
  switch (reportType) {
    case 'training':
      return 'TrainingResults.txt';

    case 'establishments':
      return 'WorkplaceResults.txt';

    case 'workers':
      return 'StaffrecordsResults.txt';
  }
};

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
const restoreOnloadEntities = async (
  loggedInUsername,
  primaryEstablishmentId,
  keepAlive = () => {}
) => {
  try {
    // the result of validation is to make available an S3 object outlining ALL entities ready to be uploaded
    const allEntitiesKey = `${primaryEstablishmentId}/intermediary/all.entities.json`;

    const onLoadEntitiesJSON = await downloadContent(allEntitiesKey).then(myFile => {
      keepAlive('restoreOnloadEntities');

      return myFile;
    });

    const onLoadEntities = JSON.parse(onLoadEntitiesJSON.data);

    // now create/load establishment entities from each of the establishments, including all associated entities (full depth including training/quals)
    const onLoadEstablishments = [];
    const onloadPromises = [];
    if (onLoadEntities && Array.isArray(onLoadEntities)) {
      onLoadEntities.forEach(thisEntity => {
        const newOnloadEstablishment = new Establishment(loggedInUsername);
        onLoadEstablishments.push(newOnloadEstablishment);

        newOnloadEstablishment.initialise(
          thisEntity.address1,
          thisEntity.address2,
          thisEntity.address3,
          thisEntity.town,
          thisEntity.county,
          thisEntity.locationId,
          thisEntity.provId,
          thisEntity.postcode,
          thisEntity.isRegulated
        );
        onloadPromises.push(newOnloadEstablishment.load(thisEntity, true).then(data => {
          keepAlive('newOnloadEstablishment loaded');

          return data;
        }));
      });
    }
    // wait here for the loading of all establishments from entities to complete
    await Promise.all(onloadPromises);

    return onLoadEstablishments;
  } catch (err) {
    console.error('/restoreExistingEntities: ERR: ', err.message);
    throw err;
  }
};

const completeNewEstablishment = async (
  thisNewEstablishment,
  theLoggedInUser,
  transaction,
  onloadEstablishments,
  primaryEstablishmentId,
  primaryEstablishmentUid,
  keepAlive = () => {}
) => {
  try {
    const startTime = new Date();

    // find the onload establishment by key
    const foundOnloadEstablishment = onloadEstablishments.find(thisOnload => thisOnload.key === thisNewEstablishment.key);

    // the entity is already loaded, so simply prep it ready for saving
    if (foundOnloadEstablishment) {
      // as this new establishment is created from a parent, it automatically becomes a sub
      foundOnloadEstablishment.initialiseSub(primaryEstablishmentId, primaryEstablishmentUid);
      keepAlive('foundOnloadEstablishment initialised');
      await foundOnloadEstablishment.save(theLoggedInUser, true, 0, transaction, true);
      keepAlive('foundOnloadEstablishment saved');
      await foundOnloadEstablishment.bulkUploadWdf(theLoggedInUser, transaction);
      keepAlive('foundOnloadEstablishment wdf calculated');
    }

    const endTime = new Date();
    const numberOfWorkers = foundOnloadEstablishment.workers.length;
    timerLog('CHECKPOINT - BU COMPLETE - new establishment', startTime, endTime, numberOfWorkers);
  } catch (err) {
    console.error('completeNewEstablishment: failed to complete upon new establishment: ', thisNewEstablishment.key);
    throw err;
  }
};

const completeUpdateEstablishment = async (
  thisUpdatedEstablishment,
  theLoggedInUser,
  transaction,
  onloadEstablishments,
  myCurrentEstablishments,
  keepAlive = () => {}
) => {
  try {
    const startTime = new Date();

    // find the current establishment and onload establishment by key
    const foundOnloadEstablishment = onloadEstablishments.find(thisOnload => thisOnload.key === thisUpdatedEstablishment.key);
    const foundCurrentEstablishment = myCurrentEstablishments.find(thisCurrent => thisCurrent.key === thisUpdatedEstablishment.key);

    // current is already restored, so simply need pass the onload entity into the current along with the associated set of worker entities
    if (foundCurrentEstablishment) {
      // when updating existing entities, need to remove the local identifer!
      // but because the properties are not actual properties - but managed properties - we can't just delete the property

      // simply work on the resulting full JSON presentation, whereby every property is a simply property
      const thisEstablishmentJSON = foundOnloadEstablishment.toJSON(false, false, false, false, true, null, true);
      delete thisEstablishmentJSON.localIdentifier;

      keepAlive('complete upload');
      await foundCurrentEstablishment.load(thisEstablishmentJSON, true, true);
      keepAlive('complete upload loaded');
      await foundCurrentEstablishment.save(theLoggedInUser, true, 0, transaction, true);
      keepAlive('complete upload saved');
      await foundCurrentEstablishment.bulkUploadWdf(theLoggedInUser, transaction);
      keepAlive('complete upload wdf');

      const endTime = new Date();
      const numberOfWorkers = foundCurrentEstablishment.workers.length;
      timerLog('CHECKPOINT - BU COMPLETE - update establishment', startTime, endTime, numberOfWorkers);
    }
  } catch (err) {
    console.error('completeUpdateEstablishment: failed to complete upon existing establishment: ', thisUpdatedEstablishment.key);
    throw err;
  }
};

const completeDeleteEstablishment = async (
  thisDeletedEstablishment,
  theLoggedInUser,
  transaction,
  myCurrentEstablishments
) => {
  try {
    const startTime = new Date();

    // find the current establishment by key
    const foundCurrentEstablishment = myCurrentEstablishments.find(thisCurrent => thisCurrent.key === thisDeletedEstablishment.key);

    // current is already restored, so simply need to delete it
    if (foundCurrentEstablishment) {
      await foundCurrentEstablishment.delete(theLoggedInUser, transaction, true);
    }

    const endTime = new Date();
    const numberOfWorkers = foundCurrentEstablishment.workers.length;
    timerLog('CHECKPOINT - BU COMPLETE - delete establishment', startTime, endTime, numberOfWorkers);
  } catch (err) {
    console.error('completeDeleteEstablishment: failed to complete upon deleting establishment: ', thisDeletedEstablishment.key);
    throw err;
  }
};

const completePost = async (req, res) => {
  const keepAlive = (stepName = '', stepId = '') => {
    console.log(`Bulk Upload /complete keep alive: ${new Date()} ${stepName} ${stepId}`);
  };

  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const primaryEstablishmentUid = req.establishment.uid;
  const isParent = req.isParent;

  try {
    // completing bulk upload must always work on the current set of known entities and not rely
    //  on any aspect of the current entities at the time of validation; there may be minutes/hours
    //  validating a bulk upload and completing it.
    const completeStartTime = new Date();
    // association level is just 1 (we need Establishment's workers for completion, but not the Worker's associated training and qualification)
    const myCurrentEstablishments = await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent, 1, keepAlive);

    keepAlive('restore existing entities', primaryEstablishmentId);

    const restoredExistingStateTime = new Date();
    timerLog('CHECKPOINT - BU COMPLETE - have restored current state of establishments/workers', completeStartTime, restoredExistingStateTime);

    try {
      const onloadEstablishments = await restoreOnloadEntities(theLoggedInUser, primaryEstablishmentId, keepAlive);
      const validationDiferenceReportDownloaded = await downloadContent(`${primaryEstablishmentId}/validation/difference.report.json`, null, null).then(data => {
        keepAlive('differences downloaded');

        return data;
      });
      const validationDiferenceReport = JSON.parse(validationDiferenceReportDownloaded.data);

      const restoredOnLoadStateTime = new Date();
      timerLog('CHECKPOINT - BU COMPLETE - have restored onloaded state from validation stage', restoredExistingStateTime, restoredOnLoadStateTime);

      // sequential promise console logger
      const log = result => result === null;

      // could look to parallel the three above tasks as each is relatively intensive - but happy path first
      // process the set of new, updated and deleted entities for bulk upload completion, within a single transaction
      let completeCommitTransactionTime = null;
      try {
        // all creates, updates and deletes (archive) are done in one transaction to ensure database integrity
        await dbModels.sequelize.transaction(async t => {
          // first create the new establishments - in sequence
          const starterNewPromise = Promise.resolve(null);
          await validationDiferenceReport
            .new
            .reduce((p, thisNewEstablishment) => p.then(() =>
              completeNewEstablishment(
                thisNewEstablishment,
                theLoggedInUser,
                t,
                onloadEstablishments,
                primaryEstablishmentId,
                primaryEstablishmentUid,
                keepAlive
              ).then(data => {
                keepAlive('complete new establishment');

                return data;
              }).then(log)), starterNewPromise);

          // now update the updated
          const starterUpdatedPromise = Promise.resolve(null);
          await validationDiferenceReport
            .updated
            .reduce((p, thisUpdatedEstablishment) => p.then(() =>
              completeUpdateEstablishment(
                thisUpdatedEstablishment,
                theLoggedInUser,
                t,
                onloadEstablishments,
                myCurrentEstablishments,
                keepAlive
              ).then(data => {
                keepAlive('completeUpdateEstablishment');

                return data;
              }).then(log)), starterUpdatedPromise);

          // and finally, delete the deleted
          const starterDeletedPromise = Promise.resolve(null);
          await validationDiferenceReport
            .deleted
            .reduce((p, thisDeletedEstablishment) => p.then(() =>
              completeDeleteEstablishment(
                thisDeletedEstablishment,
                theLoggedInUser,
                t,
                myCurrentEstablishments,
                keepAlive
              ).then(data => {
                keepAlive('completeDeleteEstablishment');

                return data;
              }).then(log)), starterDeletedPromise);

          completeCommitTransactionTime = new Date();
        });

        const completeSaveTime = new Date();
        if (completeCommitTransactionTime) {
          timerLog('CHECKPOINT - BU COMPLETE - commit transaction', completeCommitTransactionTime, completeSaveTime);
        }
        timerLog('CHECKPOINT - BU COMPLETE - have completed all establishments', restoredOnLoadStateTime, completeSaveTime);

        // gets here having successfully completed upon the bulk upload
        //  clean up the S3 objects
        await purgeBulkUploadS3Objects(primaryEstablishmentId);

        keepAlive('purgeBulkUploadS3Objects');

        // confirm success against the primary establishment
        await Establishment.bulkUploadSuccess(primaryEstablishmentId);

        keepAlive('bulkUploadSuccess');

        const completeEndTime = new Date();
        timerLog('CHECKPOINT - BU COMPLETE - clean up', completeSaveTime, completeEndTime);
        timerLog('CHECKPOINT - BU COMPLETE - overall', completeStartTime, completeEndTime);

        await saveResponse(req, res, 200, {});
      } catch (err) {
        console.error("route('/complete') err: ", err);

        await saveResponse(req, res, 503, {
          message: 'Failed to save'
        });
      }
    } catch (err) {
      console.error('router.route(\'/complete\').post: failed to download entities intermediary - atypical that the object does not exist because not yet validated: ', err);

      await saveResponse(req, res, 406, {
        message: 'Validation has not run'
      });
    }
  } catch (err) {
    console.error(err);

    await saveResponse(req, res, 503, {
      message: 'Service Unavailable'
    });
  }
};

// takes the given set of establishments, and returns the string equivalent of each of the establishments, workers and training CSV
const exportToCsv = async (NEWLINE, allMyEstablishments, primaryEstablishmentId, downloadType, responseSend) => {
  // before being able to write the worker header, we need to know the maximum number of qualifications
  // columns across all workers

  const determineMaxQuals = await dbModels.sequelize.query(
    'select cqc.maxQualifications(:givenPrimaryEstablishment);',
    {
      replacements: {
        givenPrimaryEstablishment: primaryEstablishmentId
      },
      type: dbModels.sequelize.QueryTypes.SELECT
    }
  );

  if (determineMaxQuals && determineMaxQuals[0].maxqualifications && Number.isInteger(parseInt(determineMaxQuals[0].maxqualifications, 10))) {
    const MAX_QUALS = parseInt(determineMaxQuals[0].maxqualifications, 10);

    // first the header rows
    let columnNames = '';

    switch (downloadType) {
      case 'establishments':
        columnNames = EstablishmentCsvValidator.headers();
        break;

      case 'workers':
        columnNames = WorkerCsvValidator.headers(MAX_QUALS);
        break;

      case 'training':
        columnNames = TrainingCsvValidator.headers();
        break;
    }

    responseSend(columnNames, 'column names');

    allMyEstablishments.forEach(thisEstablishment => {
      if (downloadType === 'establishments') {
        responseSend(NEWLINE + EstablishmentCsvValidator.toCSV(thisEstablishment), 'establishment');
      } else {
        // for each worker on this establishment
        thisEstablishment.workers.forEach(thisWorker => {
          // note - thisEstablishment.name will need to be local identifier once available
          if (downloadType === 'workers') {
            responseSend(NEWLINE + WorkerCsvValidator.toCSV(thisEstablishment.localIdentifier, thisWorker, MAX_QUALS), 'worker');
          } else if (thisWorker.training) { // or for this Worker's training records
            thisWorker.training.forEach(thisTrainingRecord => {
              responseSend(NEWLINE + TrainingCsvValidator.toCSV(thisEstablishment.key, thisWorker.key, thisTrainingRecord), 'training');
            });
          }
        });
      }
    });
  } else {
    console.error('bulk upload exportToCsv - max quals error: ', determineMaxQuals);
    throw new Error('max quals error: determineMaxQuals');
  }
};

// TODO: Note, regardless of which download type is requested, the way establishments, workers and training
// entities are restored, it is easy enough to create all three exports every time. Ideally the CSV content should
// be prepared and uploaded to S3, and then signed URLs returned for the browsers to download directly, thus not
// imposing the streaming of large data files through node.js API
const downloadGet = async (req, res) => {
  // manage the request timeout
  req.setTimeout(config.get('bulkupload.validation.timeout') * 1000);

  const NEWLINE = '\r\n';

  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const isParent = req.isParent;

  const ALLOWED_DOWNLOAD_TYPES = ['establishments', 'workers', 'training'];
  const downloadType = req.params.downloadType;

  const ENTITY_RESTORE_LEVEL = 2;

  const responseText = [];

  const responseSend = async (text, stepName = '') => {
    responseText.push(text);

    console.log(`Bulk upload /download/${downloadType}: ${new Date()} ${stepName}`);
  };

  if (ALLOWED_DOWNLOAD_TYPES.includes(downloadType)) {
    try {
      await exportToCsv(
        NEWLINE,
        // only restore those subs that this primary establishment owns
        await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent, ENTITY_RESTORE_LEVEL, true),
        primaryEstablishmentId,
        downloadType,
        responseSend
      );

      await saveResponse(req, res, 200, responseText.join(''), {
        'Content-Type': 'text/csv',
        'Content-disposition': `attachment; filename=${new Date().toISOString().split('T')[0]}-sfc-bulk-upload-${downloadType}.csv`
      });
    } catch (err) {
      console.error('router.get(\'/bulkupload/download\').get: failed to restore my establishments and all associated entities (workers, qualifications and training: ', err);

      await saveResponse(req, res, 503, {
        message: 'Failed to retrieve establishment data'
      });
    }
  } else {
    console.error(`router.get('/bulkupload/download').get: unexpected download type: ${downloadType}`, downloadType);

    await saveResponse(req, res, 400, {
      message: `Unexpected download type: ${downloadType}`
    });
  }
};

const router = require('express').Router();

router.route('/signedUrl').get(acquireLock.bind(null, signedUrlGet, buStates.DOWNLOADING));
router.route('/download/:downloadType').get(acquireLock.bind(null, downloadGet, buStates.DOWNLOADING));

router.route('/uploaded').put(acquireLock.bind(null, uploadedPut, buStates.UPLOADING));
router.route('/uploaded').post(acquireLock.bind(null, uploadedPost, buStates.UPLOADING));
router.route('/uploaded').get(acquireLock.bind(null, uploadedGet, buStates.DOWNLOADING));
router.route('/uploaded/*').get(acquireLock.bind(null, uploadedStarGet, buStates.DOWNLOADING));

router.route('/validate').put(acquireLock.bind(null, validatePut, buStates.VALIDATING));

router.route('/report/:reportType').get(acquireLock.bind(null, reportGet, buStates.DOWNLOADING));

router.route('/complete').post(acquireLock.bind(null, completePost, buStates.COMPLETING));
router.route('/lockstatus').get(lockStatusGet);
router.route('/unlock').get(releaseLock);
router.route('/response/:buRequestId').get(responseGet);

module.exports = router;
