const express = require('express');
const appConfig = require('../../config/config');
const AWS = require('aws-sdk');
const csv = require('csvtojson');
const Stream = require('stream');
const moment = require('moment');
const dbmodels = require('../../models');
const config = require('../../config/config');

const timerLog = require('../../utils/timerLog');

const UserAgentParser = require('ua-parser-js');

// Shorthand for hasOwnProperty that also works with bare objects
const hasProp = (obj, prop) =>
  Object.prototype.hasOwnProperty.bind(obj)(prop);

const router = express.Router();
const s3 = new AWS.S3({
  region: appConfig.get('bulkupload.region').toString()
});

const CsvEstablishmentValidator = require('../../models/BulkImport/csv/establishments').Establishment;
const CsvWorkerValidator = require('../../models/BulkImport/csv/workers').Worker;
const CsvTrainingValidator = require('../../models/BulkImport/csv/training').Training;
const MetaData = require('../../models/BulkImport/csv/metaData').MetaData;

var FileStatusEnum = { Latest: 'latest', Validated: 'validated', Imported: 'imported' };

const EstablishmentEntity = require('../../models/classes/establishment').Establishment;
const WorkerEntity = require('../../models/classes/worker').Worker;
const QualificationEntity = require('../../models/classes/qualification').Qualification;
const TrainingEntity = require('../../models/classes/training').Training;
const UserEntity = require('../../models/classes/user').User;

const FileValidationStatusEnum = { Pending: 'pending', Validating: 'validating', Pass: 'pass', PassWithWarnings: 'pass with warnings', Fail: 'fail' };

const ignoreMetaDataObjects = /.*metadata.json$/;
const ignoreRoot = /.*\/$/;

router.route('/uploaded').get(async (req, res) => {
  try {
    const params = {
      Bucket: appConfig.get('bulkupload.bucketname').toString(),
      Prefix: `${req.establishmentId}/latest/`
    };

    const data = await s3.listObjects(params).promise();
    const returnData = await Promise.all(data.Contents.filter(myFile => !ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key))
      .map(async (file) => {
        const elements = file.Key.split('/');
        const objData = await s3.headObject({ Bucket: params.Bucket, Key: file.Key }).promise();
        const returnData = {
          filename: elements[elements.length - 1],
          uploaded: file.LastModified,
          username: objData.Metadata.username,
          records: 0,
          errors: 0,
          warnings: 0,
          fileType: null,
          size: file.Size,
          key: encodeURI(file.Key)
        };

        const fileMetaData = data.Contents.filter(myFile => myFile.Key === file.Key + '.metadata.json');
        if (fileMetaData.length === 1) {
          const metaData = await downloadContent(fileMetaData[0].Key);
          const metadataJSON = JSON.parse(metaData.data);
          returnData.records = metadataJSON.records ? metadataJSON.records : 0;
          returnData.errors = metadataJSON.errors ? metadataJSON.errors : 0;
          returnData.warnings = metadataJSON.warnings ? metadataJSON.warnings : 0;
          returnData.fileType = metadataJSON.fileType ? metadataJSON.fileType : null;
        }

        return returnData;
      }));
    return res.status(200).send({ establishment: { uid: req.establishmentId }, files: returnData });
  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

router.route('/uploaded/*').get(async (req, res) => {
  const requestedKey = req.params['0'];

  const params = {
    Bucket: appConfig.get('bulkupload.bucketname').toString(),
    Prefix: `${req.establishmentId}/latest/`
  };

  try {
    const objHeadData = await s3.headObject({ Bucket: params.Bucket, Key: requestedKey }).promise();

    const elements = requestedKey.split('/');

    const returnData = {
      filename: elements[elements.length - 1],
      uploaded: objHeadData.LastModified,
      username: objHeadData.Metadata.username,
      size: objHeadData.ContentLength,
      key: requestedKey,
      signedUrl: s3.getSignedUrl('getObject', {
        Bucket: appConfig.get('bulkupload.bucketname').toString(),
        Key: requestedKey,
        Expires: appConfig.get('bulkupload.uploadSignedUrlExpire')
      })
    };

    return res.status(200).send({ file: returnData });
  } catch (err) {
    if (err.code && err.code === 'NotFound') {
      return res.status(404).send({});
    }
    console.log(err);
    return res.status(503).send({});
  }
});

const purgeBulkUploadS3Obbejcts = async (establishmentId) => {
  // drop all in latest
  const listParams = {
    Bucket: appConfig.get('bulkupload.bucketname').toString(),
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
    const deleteParams = {
      Bucket: appConfig.get('bulkupload.bucketname').toString(),
      Delete: {
        Objects: deleteKeys,
        Quiet: true
      }
    };
    await s3.deleteObjects(deleteParams).promise();
  }
};

/*
 * input:
 * "files": [
 *  {
 *    "filename": "blah-csv"
 *  }
 * ]
 *
 * output:
 * "files": [
 *  {
 *    "filename": "blah-csv",
 *    "signedUrl": "....."
 *  }
 * ]
 */
router.route('/uploaded').post(async function (req, res) {
  const myEstablishmentId = Number.isInteger(req.establishmentId) ? req.establishmentId.toString() : req.establishmentId;
  const username = req.username;
  const uploadedFiles = req.body.files;

  const MINIMUM_NUMBER_OF_FILES = 2;
  const MAXIMUM_NUMBER_OF_FILES = 3;

  if (!uploadedFiles || !Array.isArray(uploadedFiles) || uploadedFiles.length < MINIMUM_NUMBER_OF_FILES || uploadedFiles.length > MAXIMUM_NUMBER_OF_FILES) {
    return res.status(400).send({});
  }

  const signedUrls = [];
  try {
    // clean up existing bulk upload objects
    await purgeBulkUploadS3Obbejcts(myEstablishmentId);

    uploadedFiles.forEach(thisFile => {
      if (thisFile.filename) {
        thisFile.signedUrl = s3.getSignedUrl('putObject', {
          Bucket: appConfig.get('bulkupload.bucketname').toString(),
          Key: myEstablishmentId + '/' + FileStatusEnum.Latest + '/' + thisFile.filename,
          // ACL: 'public-read',
          ContentType: req.query.type,
          Metadata: {
            username,
            establishmentId: myEstablishmentId,
            validationstatus: FileValidationStatusEnum.Pending
          },
          Expires: appConfig.get('bulkupload.uploadSignedUrlExpire')
        });
        signedUrls.push(thisFile);
      }
    });

    return res.status(200).send(signedUrls);
  } catch (err) {
    console.error('API POST bulkupload/uploaded: ', err);
    return res.status(503).send({});
  }
});

router.route('/signedUrl').get(async function (req, res) {
  const establishmentId = req.establishmentId;
  const username = req.username;

  try {
    const myEstablishmentId = Number.isInteger(establishmentId) ? establishmentId.toString() : establishmentId;
    var uploadPreSignedUrl = s3.getSignedUrl('putObject', {
      Bucket: appConfig.get('bulkupload.bucketname').toString(),
      Key: establishmentId + '/' + FileStatusEnum.Latest + '/' + req.query.filename,
      // ACL: 'public-read',
      ContentType: req.query.type,
      Metadata: {
        username,
        establishmentId: myEstablishmentId,
        validationstatus: FileValidationStatusEnum.Pending
      },
      Expires: appConfig.get('bulkupload.uploadSignedUrlExpire')
    });
    res.json({ urls: uploadPreSignedUrl });
    res.end();
  } catch (err) {
    console.error('establishment::bulkupload GET/:PreSigned - failed', err.message);
    return res.status(503).send();
  }
});

// Prevalidate
router.route('/uploaded').put(async (req, res) => {
  const establishmentId = req.establishmentId;
  const username = req.username;
  const myDownloads = {};
  const establishmentMetadata = new MetaData();
  const workerMetadata = new MetaData();
  const trainingMetadata = new MetaData();

  try {
    // awaits must be within a try/catch block - checking if file exists - saves having to repeatedly download from S3 bucket
    const params = {
      Bucket: appConfig.get('bulkupload.bucketname').toString(),
      Prefix: `${req.establishmentId}/latest/`
    };
    const data = await s3.listObjects(params).promise();

    const createModelPromises = [];

    data.Contents.forEach(myFile => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;
      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        createModelPromises.push(downloadContent(myFile.Key, myFile.Size, myFile.LastModified));
      }
    });

    const allContent = await Promise.all(createModelPromises);

    allContent.forEach(myfile => {
      if (CsvEstablishmentValidator.isContent(myfile.data)) {
        myDownloads.establishments = myfile.data;
        establishmentMetadata.filename = myfile.filename;
        establishmentMetadata.fileType = 'Establishment';
        establishmentMetadata.userName = myfile.username;
        establishmentMetadata.size = myfile.size;
        establishmentMetadata.key = myfile.key;
        establishmentMetadata.lastModified = myfile.lastModified;
      } else if (CsvWorkerValidator.isContent(myfile.data)) {
        myDownloads.workers = myfile.data;
        workerMetadata.filename = myfile.filename;
        workerMetadata.fileType = 'Worker';
        workerMetadata.userName = myfile.username;
        workerMetadata.size = myfile.size;
        workerMetadata.key = myfile.key;
        workerMetadata.lastModified = myfile.lastModified;
      } else if (CsvTrainingValidator.isContent(myfile.data)) {
        myDownloads.trainings = myfile.data;
        trainingMetadata.filename = myfile.filename;
        trainingMetadata.fileType = 'Training';
        trainingMetadata.userName = myfile.username;
        trainingMetadata.size = myfile.size;
        trainingMetadata.key = myfile.key;
        trainingMetadata.lastModified = myfile.lastModified;
      }
    });

    let workerHeaders, establishmentHeaders, trainingHeaders;
    let importedWorkers = null; let importedEstablishments = null; let importedTraining = null;

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

    /// ///////////////////////////
    const firstRow = 0;
    const firstLineNumber = 1;
    const metadataS3Promises = [];

    if (importedEstablishments) {
      const establishmentsCsvValidator = new CsvEstablishmentValidator(importedEstablishments[firstRow], firstLineNumber);
      if (establishmentsCsvValidator.preValidate(establishmentHeaders)) {
        // count records and update metadata
        establishmentMetadata.records = importedEstablishments.length;
        metadataS3Promises.push(uploadAsJSON(username, establishmentId, establishmentMetadata, `${establishmentId}/latest/${establishmentMetadata.filename}.metadata.json`));
      } else {
        // reset metadata filetype because this is not an expected establishment
        establishmentMetadata.fileType = null;
      }
    }

    if (importedWorkers) {
      const workerCsvValidator = new CsvWorkerValidator(importedWorkers[firstRow], firstLineNumber);
      if (workerCsvValidator.preValidate(workerHeaders)) {
        // count records and update metadata
        workerMetadata.records = importedWorkers.length;
        metadataS3Promises.push(uploadAsJSON(username, establishmentId, workerMetadata, `${establishmentId}/latest/${workerMetadata.filename}.metadata.json`));
      } else {
        // reset metadata filetype because this is not an expected establishment
        workerMetadata.fileType = null;
      }
    }

    if (importedTraining) {
      const trainingCsvValidator = new CsvTrainingValidator(importedTraining[firstRow], firstLineNumber);
      if (trainingCsvValidator.preValidate(trainingHeaders)) {
        // count records and update metadata
        trainingMetadata.records = importedTraining.length;
        metadataS3Promises.push(uploadAsJSON(username, establishmentId, trainingMetadata, `${establishmentId}/latest/${trainingMetadata.filename}.metadata.json`));
      } else {
        // reset metadata filetype because this is not an expected establishment
        trainingMetadata.fileType = null;
      }
    }

    /// ///////////////////////////////////
    await Promise.all(metadataS3Promises);

    const generateReturnData = (metaData) => {
      return {
        filename: metaData.filename,
        uploaded: metaData.lastModified,
        username: metaData.userName ? metaData.userName : null,
        records: metaData.records,
        errors: 0,
        warnings: 0,
        fileType: metaData.fileType,
        size: metaData.size,
        key: metaData.key
      };
    };

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
          returnData.push(
            generateReturnData(
              {
                filename: fileName,
                uploaded: myFile.LastModified,
                username: myFile.username,
                records: 0,
                errors: 0,
                warnings: 0,
                fileType: null,
                size: myFile.size,
                key: myFile.Key
              })
          );
        }
      }
    });

    return res.status(200).send(returnData);
  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

router.route('/validate').put(async (req, res) => {
  // manage the request timeout
  req.setTimeout(config.get('bulkupload.validation.timeout') * 1000);

  const establishmentId = req.establishmentId;
  const username = req.username;
  const isParent = req.isParent;
  const myDownloads = {};
  const establishmentMetadata = new MetaData();
  const workerMetadata = new MetaData();
  const trainingMetadata = new MetaData();

  try {
    // awaits must be within a try/catch block - checking if file exists - saves having to repeatedly download from S3 bucket
    const params = {
      Bucket: appConfig.get('bulkupload.bucketname').toString(),
      Prefix: `${req.establishmentId}/latest/`
    };
    const data = await s3.listObjects(params).promise();

    const createModelPromises = [];
    data.Contents.forEach(myFile => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;
      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        createModelPromises.push(downloadContent(myFile.Key));
      }
    });

    await Promise.all(createModelPromises).then(function (values) {
      values.forEach(myfile => {
        if (CsvEstablishmentValidator.isContent(myfile.data)) {
          myDownloads.establishments = myfile.data;
          establishmentMetadata.filename = myfile.filename;
          establishmentMetadata.fileType = 'Establishment';
          establishmentMetadata.userName = myfile.username;
        } else if (CsvWorkerValidator.isContent(myfile.data)) {
          myDownloads.workers = myfile.data;
          workerMetadata.filename = myfile.filename;
          workerMetadata.fileType = 'Worker';
          workerMetadata.userName = myfile.username;
        } else if (CsvTrainingValidator.isContent(myfile.data)) {
          myDownloads.trainings = myfile.data;
          trainingMetadata.filename = myfile.filename;
          trainingMetadata.fileType = 'Training';
          trainingMetadata.userName = myfile.username;
        }
      });
    }).catch(err => {
      console.error('NM: validate.put', err);
    });

    const importedEstablishments = myDownloads.establishments ? await csv().fromString(myDownloads.establishments) : null;
    const importedWorkers = myDownloads.workers ? await csv().fromString(myDownloads.workers) : null;
    const importedTraining = myDownloads.trainings ? await csv().fromString(myDownloads.trainings) : null;

    const validationResponse = await validateBulkUploadFiles(
      true,
      username,
      establishmentId,
      isParent,
      { imported: importedEstablishments, establishmentMetadata: establishmentMetadata },
      { imported: importedWorkers, workerMetadata: workerMetadata },
      { imported: importedTraining, trainingMetadata: trainingMetadata });

    // handle parsing errors
    if (!validationResponse.status) {
      return res.status(400).send({
        establishment: validationResponse.metaData.establishments.toJSON(),
        workers: validationResponse.metaData.workers.toJSON(),
        training: validationResponse.metaData.training.toJSON()
      });
    } else {
      return res.status(200).send({
        establishment: validationResponse.metaData.establishments.toJSON(),
        workers: validationResponse.metaData.workers.toJSON(),
        training: validationResponse.metaData.training.toJSON()
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

// alternative (testable) route, which passes the establishment, worker and training CSV as content
//  return the validation errors as response
router.route('/validate').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const username = req.username;
  const isParent = req.isParent;
  const establishmentMetadata = new MetaData();
  const workerMetadata = new MetaData();
  const trainingMetadata = new MetaData();

  const establishmentRegex = /LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRES/;
  const trainingRegex = /LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DAT/;
  const filenameRegex = /^(.+\/)*(.+)\.(.+)$/;

  try {
    const importedEstablishments = await csv().fromString(req.body.establishments.csv);
    const importedWorkers = await csv().fromString(req.body.workers.csv);
    const importedTraining = await csv().fromString(req.body.training.csv);

    if (establishmentRegex.test(req.body.establishments.csv.substring(0, 50))) {
      const key = req.body.establishments.filename;
      establishmentMetadata.filename = key.match(filenameRegex)[2] + '.' + key.match(filenameRegex)[3];
      establishmentMetadata.fileType = 'Establishment';
    }
    if (trainingRegex.test(req.body.training.csv.substring(0, 50))) {
      const key = req.body.training.filename;
      trainingMetadata.filename = key.match(filenameRegex)[2] + '.' + key.match(filenameRegex)[3];
      trainingMetadata.fileType = 'Training';
    }

    const validationResponse = await validateBulkUploadFiles(
      false,
      username,
      establishmentId,
      isParent,
      { imported: importedEstablishments, establishmentMetadata: establishmentMetadata },
      { imported: importedWorkers, workerMetadata: workerMetadata },
      { imported: importedTraining, trainingMetadata: trainingMetadata });

    // handle parsing errors
    if (!validationResponse.status) {
      return res.status(400).send({
        report: validationResponse.report,
        establishments: {
          filename: null,
          records: importedEstablishments.length,
          deleted: validationResponse.metaData.establishments.deleted,
          errors: validationResponse.validation.establishments
            .filter(thisVal => hasProp(thisVal, 'errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.establishments
            .filter(thisVal => hasProp(thisVal, 'warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          data: {
            csv: validationResponse.data.csv.establishments,
            entities: validationResponse.data.entities.establishments
          }
        },
        workers: {
          filename: null,
          records: importedWorkers.length,
          deleted: validationResponse.metaData.workers.deleted,
          errors: validationResponse.validation.workers
            .filter(thisVal => hasProp(thisVal, 'errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.workers
            .filter(thisVal => hasProp(thisVal, 'warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          data: {
            csv: validationResponse.data.csv.workers,
            entities: {
              workers: validationResponse.data.entities.workers,
              qualifications: validationResponse.data.entities.qualifications
            }
          }
        },
        training: {
          filename: null,
          records: importedTraining.length,
          errors: validationResponse.validation.training
            .filter(thisVal => hasProp(thisVal, 'errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.training
            .filter(thisVal => hasProp(thisVal, 'warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          data: {
            csv: validationResponse.data.csv.training,
            entities: validationResponse.data.entities.training
          }
        },
        all: validationResponse.data.resulting
      });
    } else {
      return res.status(200).send(validationResponse.data.resulting);
    }
  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

async function downloadContent (key, objectSize, lastModified) {
  var params = {
    Bucket: appConfig.get('bulkupload.bucketname').toString(),
    Key: key
  };

  const filenameRegex = /^(.+\/)*(.+)\.(.+)$/;

  try {
    const objData = await s3.getObject(params).promise();
    return {
      key: key,
      data: objData.Body.toString(),
      filename: key.match(filenameRegex)[2] + '.' + key.match(filenameRegex)[3],
      username: objData.Metadata.username,
      size: objectSize,
      lastModified: lastModified
    };
  } catch (err) {
    console.error(`api/establishment/bulkupload/downloadFile: ${key})\n`, err);
    throw new Error(`Failed to download S3 object: ${key}`);
  }
}

async function uploadAsJSON (username, establishmentId, content, key) {
  const myEstablishmentId = Number.isInteger(establishmentId) ? establishmentId.toString() : establishmentId;

  var params = {
    Bucket: appConfig.get('bulkupload.bucketname').toString(),
    Key: key,
    Body: JSON.stringify(content, null, 2),
    ContentType: 'application/json',
    Metadata: {
      username,
      establishmentId: myEstablishmentId
    }
  };

  try {
    await s3.putObject(params).promise();
    // console.log(`${key} has been uploaded!`);
  } catch (err) {
    console.error('uploadAsJSON: ', err);
    throw new Error(`Failed to upload S3 object: ${key}`);
  }
}

async function uploadAsCSV (username, establishmentId, content, key) {
  const myEstablishmentId = Number.isInteger(establishmentId) ? establishmentId.toString() : establishmentId;

  var params = {
    Bucket: appConfig.get('bulkupload.bucketname').toString(),
    Key: key,
    Body: content,
    ContentType: 'text/csv',
    Metadata: {
      username,
      establishmentId: myEstablishmentId
    }
  };

  try {
    await s3.putObject(params).promise();
    // console.log(`${key} has been uploaded!`);
  } catch (err) {
    console.error('uploadAsCSV: ', err);
    throw new Error(`Failed to upload S3 object: ${key}`);
  }
}

const _validateEstablishmentCsv = async (thisLine, currentLineNumber, csvEstablishmentSchemaErrors, myEstablishments, myAPIEstablishments, myCurrentEstablishments) => {
  const lineValidator = new CsvEstablishmentValidator(thisLine, currentLineNumber, myCurrentEstablishments); // +2 because the first row is CSV headers, and forEach counter is zero index

  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  lineValidator.validate();
  lineValidator.transform();

  const thisEstablishmentAsAPI = lineValidator.toAPI();
  const thisApiEstablishment = new EstablishmentEntity();

  try {
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

    const isValid = thisApiEstablishment.validate();

    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      // console.log("WA DEBUG - this establishment entity: ", JSON.stringify(thisApiEstablishment.toJSON(), null, 2));
      myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
    } else {
      const errors = thisApiEstablishment.errors;
      const warnings = thisApiEstablishment.warnings;

      lineValidator.addAPIValidations(errors, warnings);

      if (errors.length === 0) {
        // console.log("WA DEBUG - this establishment entity: ", JSON.stringify(thisApiEstablishment.toJSON(), null, 2));
        myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
      } else {
        // TODO - remove this when capacities and services are fixed; temporarily adding establishments even though they're in error (because service/capacity validations put all in error)
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

  // console.log("WA DEBUG - this establishment: ", lineValidator.toJSON());
  // console.log("WA DEBUG - this establishment: ", JSON.stringify(lineValidator.toAPI(), null, 4));
  myEstablishments.push(lineValidator);
};

const _loadWorkerQualifications = async (lineValidator, thisQual, thisApiWorker, myAPIQualifications) => {
  const thisApiQualification = new QualificationEntity();
  const isValid = await thisApiQualification.load(thisQual); // ignores "column" attribute (being the CSV column index, e.g "03" from which the qualification is mapped)
  // console.log("WA DEBUG - this qualification entity: ", JSON.stringify(thisApiQualification.toJSON(), null, 2));

  if (isValid) {
    // no validation errors in the entity itself, so add it ready for completion
    // console.log("WA DEBUG - this qualification entity: ", JSON.stringify(thisApiQualification.toJSON(), null, 2));
    myAPIQualifications[lineValidator.lineNumber] = thisApiQualification;

    // associate the qualification entity to the Worker
    thisApiWorker.associateQualification(thisApiQualification);
  } else {
    const errors = thisApiQualification.errors;
    const warnings = thisApiQualification.warnings;

    lineValidator.addQualificationAPIValidation(thisQual.column, errors, warnings);

    if (errors.length === 0) {
      // console.log("WA DEBUG - this qualification entity: ", JSON.stringify(thisApiQualification.toJSON(), null, 2));
      myAPIQualifications[lineValidator.lineNumber] = thisApiQualification;

      // associate the qualification entity to the Worker
      thisApiWorker.associateQualification(thisApiQualification);
    }
  }
};

const _validateWorkerCsv = async (thisLine, currentLineNumber, csvWorkerSchemaErrors, myWorkers, myAPIWorkers, myAPIQualifications, myCurrentEstablishments) => {
  const lineValidator = new CsvWorkerValidator(thisLine, currentLineNumber, myCurrentEstablishments); // +2 because the first row is CSV headers, and forEach counter is zero index

  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  lineValidator.validate();
  lineValidator.transform();

  const thisWorkerAsAPI = lineValidator.toAPI();

  // construct Worker entity
  const thisApiWorker = new WorkerEntity();

  try {
    await thisApiWorker.load(thisWorkerAsAPI);

    const isValid = thisApiWorker.validate();
    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      // console.log("WA DEBUG - this worker entity: ", JSON.stringify(thisApiWorker.toJSON(), null, 2));
      myAPIWorkers[currentLineNumber] = thisApiWorker;

      // construct Qualification entities (can be multiple of a single Worker record) - regardless of whether the
      //  Worker is valid or not; we need to return as many errors/warnings in one go as possible
      const thisQualificationAsAPI = lineValidator.toQualificationAPI();
      await Promise.all(
        thisQualificationAsAPI.map((thisQual) => {
          return _loadWorkerQualifications(lineValidator, thisQual, thisApiWorker, myAPIQualifications);
        })
      );
    } else {
      const errors = thisApiWorker.errors;
      const warnings = thisApiWorker.warnings;

      lineValidator.addAPIValidations(errors, warnings);

      if (errors.length === 0) {
        // console.log("WA DEBUG - this worker entity: ", JSON.stringify(thisApiWorker.toJSON(), null, 2));
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

  // console.log("WA DEBUG - this establishment: ", lineValidator.toJSON());
  // console.log("WA DEBUG - this establishment: ", JSON.stringify(lineValidator.toAPI(), null, 4));
  myWorkers.push(lineValidator);
};

const _validateTrainingCsv = async (thisLine, currentLineNumber, csvTrainingSchemaErrors, myTrainings, myAPITrainings) => {
  const lineValidator = new CsvTrainingValidator(thisLine, currentLineNumber); // +2 because the first row is CSV headers, and forEach counter is zero index

  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  lineValidator.validate();
  lineValidator.transform();

  const thisTrainingAsAPI = lineValidator.toAPI();
  const thisApiTraining = new TrainingEntity();
  try {
    const isValid = await thisApiTraining.load(thisTrainingAsAPI);
    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      // console.log("WA DEBUG - this training entity: ", JSON.stringify(thisApiTraining.toJSON(), null, 2));
      myAPITrainings[currentLineNumber] = thisApiTraining;
    } else {
      const errors = thisApiTraining.errors;
      const warnings = thisApiTraining.warnings;

      lineValidator.addAPIValidations(errors, warnings);

      if (errors.length === 0) {
        // console.log("WA DEBUG - this training entity: ", JSON.stringify(thisApiTraining.toJSON(), null, 2));
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

  // console.log("WA DEBUG - this training csv record: ", lineValidator.toJSON());
  // console.log("WA DEBUG - this training API record: ", JSON.stringify(lineValidator.toAPI(), null, 4));
  myTrainings.push(lineValidator);
};

// if commit is false, then the results of validation are not uploaded to S3
const validateBulkUploadFiles = async (commit, username, establishmentId, isParent, establishments, workers, training) => {
  let status = true;
  const csvEstablishmentSchemaErrors = []; const csvWorkerSchemaErrors = []; const csvTrainingSchemaErrors = [];
  const myEstablishments = []; const myWorkers = []; const myTrainings = [];
  const workersKeyed = [];

  const validateStartTime = new Date();

  // restore the current known state this primary establishment (including all subs)
  const RESTORE_ASSOCIATION_LEVEL = 1;
  const myCurrentEstablishments = await restoreExistingEntities(username, establishmentId, isParent, RESTORE_ASSOCIATION_LEVEL, false);

  const validateRestoredStateTime = new Date();

  timerLog('WA DEBUG - have restored existing state as reference', validateStartTime, validateRestoredStateTime);

  // rather than an array of entities, entities will be known by their line number within the source, e.g:
  // establishments: {
  //    1: { },
  //    2: { },
  //    ...
  // }
  const myAPIEstablishments = {}; const myAPIWorkers = {}; const myAPITrainings = {}; const myAPIQualifications = {};

  // for unique/cross-reference validations
  const allEstablishmentsByKey = {}; const allWorkersByKey = {};

  // parse and process Establishments CSV
  if (Array.isArray(establishments.imported) && establishments.imported.length > 0 && establishments.establishmentMetadata.fileType === 'Establishment') {
    await Promise.all(
      establishments.imported.map((thisLine, currentLineNumber) => {
        return _validateEstablishmentCsv(thisLine, currentLineNumber + 2, csvEstablishmentSchemaErrors, myEstablishments, myAPIEstablishments, myCurrentEstablishments);
      })
    );

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
    status = false;
  }

  const validateEstablishmentsTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have validated establishments', validateRestoredStateTime, validateEstablishmentsTime);

  establishments.establishmentMetadata.records = myEstablishments.length;

  // parse and process Workers CSV
  if (Array.isArray(workers.imported) && workers.imported.length > 0 && workers.workerMetadata.fileType === 'Worker') {
    await Promise.all(
      workers.imported.map((thisLine, currentLineNumber) => {
        return _validateWorkerCsv(thisLine, currentLineNumber + 2, csvWorkerSchemaErrors, myWorkers, myAPIWorkers, myAPIQualifications, myCurrentEstablishments);
      })
    );

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
          if ((thatWorker.weeklyContractedHours || thatWorker.weeklyAverageHours) && thisWorker.nationalInsuranceNumber === thatWorker.nationalInsuranceNumber) {
            sum += (thatWorker.weeklyContractedHours ? thatWorker.weeklyContractedHours : (thatWorker.weeklyAverageHours ? thatWorker.weeklyAverageHours : 0));
          }
          return sum;
        }, 0);

        if (myWorkersTotalHours > 65) csvWorkerSchemaErrors.push(thisWorker.exceedsNationalInsuranceMaximum());

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
    status = false;
  }
  workers.workerMetadata.records = myWorkers.length;

  const validateWorkersTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have validated workers', validateEstablishmentsTime, validateWorkersTime);

  // parse and process Training CSV
  if (Array.isArray(training.imported) && training.imported.length > 0 && training.trainingMetadata.fileType === 'Training') {
    await Promise.all(
      training.imported.map((thisLine, currentLineNumber) => {
        return _validateTrainingCsv(thisLine, currentLineNumber + 2, csvTrainingSchemaErrors, myTrainings, myAPITrainings);
      })
    );

    // note - there is no uniqueness test for a training record

    // having parsed all establishments, workers and training, need to cross-check all training records' establishment reference (LOCALESTID) against all parsed establishments
    // having parsed all establishments, workers and training, need to cross-check all training records' worker reference (UNIQUEWORKERID) against all parsed workers
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
    status = false;
  }
  training.trainingMetadata.records = myTrainings.length;

  const validateTrainingTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have validated training', validateWorkersTime, validateTrainingTime);

  // prepare entities ready for upload/return
  const establishmentsAsArray = Object.values(myAPIEstablishments);
  const workersAsArray = Object.values(myAPIWorkers);
  const trainingAsArray = Object.values(myAPITrainings);
  const qualificationsAsArray = Object.values(myAPIQualifications);

  // **** Cross Entity Validations ****

  // firstly, if the logged in account performing this validation is not a parent, then
  //  there should be just one establishment, and that establishment should the primary establishment
  if (!isParent) {
    const MAX_ESTABLISHMENTS = 1;

    if (establishments.imported.length !== MAX_ESTABLISHMENTS) {
      csvEstablishmentSchemaErrors.unshift(CsvEstablishmentValidator.justOneEstablishmentError());
    }
  }

  // the primary establishment should alway be present
  // TODO - should use LOCAL_IDENTIFIER when available.
  const primaryEstablishment = myCurrentEstablishments.find(thisCurrentEstablishment => {
    if (thisCurrentEstablishment.id === establishmentId) {
      return thisCurrentEstablishment;
    }
  });

  if (primaryEstablishment) {
    const onloadedPrimaryEstablishment = myAPIEstablishments[primaryEstablishment.key];
    if (!onloadedPrimaryEstablishment) {
      csvEstablishmentSchemaErrors.unshift(CsvEstablishmentValidator.missingPrimaryEstablishmentError(primaryEstablishment.name));
    } else {
      // primary establishment does exist in given CSV; check STATUS is not DELETE - cannot delete the primary establishment
      if (onloadedPrimaryEstablishment.status === 'DELETE') {
        csvEstablishmentSchemaErrors.unshift(CsvEstablishmentValidator.cannotDeletePrimaryEstablishmentError(primaryEstablishment.name));
      }
    }
  } else {
    console.error(('Seriously, if seeing this then something has truely gone wrong - the primary establishment should always be in the set of current establishments!'));
  }

  if (isParent) {
    // must be a parent
    // check for trying to upload against subsidaries for which this parent does not own (if a parent) - ignore the primary (self) establishment of course
    const allLoadedEstablishments = Object.values(myAPIEstablishments);
    allLoadedEstablishments.forEach(thisOnloadEstablishment => {
      if (thisOnloadEstablishment.key !== primaryEstablishment.key) {
        // we're not the primary
        const foundCurrentEstablishment = myCurrentEstablishments.find(thisCurrentEstablishment => {
          if (thisCurrentEstablishment.key === thisOnloadEstablishment.key) {
            return thisCurrentEstablishment;
          }
        });

        if (foundCurrentEstablishment && foundCurrentEstablishment.dataOwner !== 'Parent') {
          const lineValidator = myEstablishments.find(thisLineValidator => thisLineValidator.key === foundCurrentEstablishment.key);
          csvEstablishmentSchemaErrors.unshift(lineValidator.addNotOwner());
        }
      }
    });
  }

  // update CSV metadata error/warning counts
  establishments.establishmentMetadata.errors = csvEstablishmentSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  establishments.establishmentMetadata.warnings = csvEstablishmentSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  workers.workerMetadata.errors = csvWorkerSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  workers.workerMetadata.warnings = csvWorkerSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  training.trainingMetadata.errors = csvTrainingSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  training.trainingMetadata.warnings = csvTrainingSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

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

    // upload the metadata as JSON to S3 - these are requited for uploaded list endpoint
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
    const allentitiesreadyforjson = establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON(false, false, false, false, true, null, true));
    if (establishmentsAsArray.length > 0) {
      s3UploadPromises.push(uploadAsJSON(
        username,
        establishmentId,
        allentitiesreadyforjson,
        `${establishmentId}/intermediary/all.entities.json`
      ));
    }

    // for the purpose of the establishment validation report, need a list of all unique local authorities against all establishments
    const establishmentsOnlyForJson = establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON());
    const unqiueLAs = establishmentsOnlyForJson ? establishmentsOnlyForJson.map(en => en.localAuthorities !== undefined ? en.localAuthorities : [])
      .reduce((acc, val) => acc.concat(val), [])
      .map(la => la.name)
      .sort((a, b) => a > b)
      .filter((value, index, self) => self.indexOf(value) === index) : [];

    s3UploadPromises.push(uploadAsJSON(
      username,
      establishmentId,
      unqiueLAs,
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
      const workersOnlyForJson = workersAsArray.map(thisWorker => thisWorker.toJSON());
      const trainingOnlyForJson = trainingAsArray.map(thisTraining => thisTraining.toJSON());
      const qualificationsOnlyForJson = qualificationsAsArray.map(thisQualification => thisQualification.toJSON());

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
          workersOnlyForJson,
          `${establishmentId}/intermediary/worker.entities.json`
        ));
      }

      if (trainingAsArray.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          trainingOnlyForJson,
          `${establishmentId}/intermediary/training.entities.json`
        ));
      }

      if (qualificationsAsArray.length > 0) {
        s3UploadPromises.push(uploadAsJSON(
          username,
          establishmentId,
          qualificationsOnlyForJson,
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

  status = !(csvEstablishmentSchemaErrors.length > 0 || csvWorkerSchemaErrors.length > 0 || csvTrainingSchemaErrors.length > 0);

  const response = {
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

  return response;
};

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
// the "onlyMine" parameter is used to remove those subsidiary establishments where the parent is not the owner
const restoreExistingEntities = async (loggedInUsername, primaryEstablishmentId, isParent, assocationLevel = 1, onlyMine = false) => {
  try {
    const thisUser = new UserEntity(primaryEstablishmentId);
    await thisUser.restore(null, loggedInUsername, false);

    // gets a list of "my establishments", which if a parent, includes all known subsidaries too, and this "parent's" access permissions to those subsidaries
    const myEstablishments = await thisUser.myEstablishments(isParent, null);

    // having got this list of establishments, now need to fully restore each establishment as entities.
    //  using an object adding entities by a known key to make lookup comparisions easier.
    const currentEntities = [];
    const restoreEntityPromises = [];

    // first add the primary establishment entity
    const primaryEstablishment = new EstablishmentEntity(loggedInUsername);
    currentEntities.push(primaryEstablishment);
    restoreEntityPromises.push(primaryEstablishment.restore(myEstablishments.primary.uid, false, true, assocationLevel));

    if (myEstablishments.subsidaries && myEstablishments.subsidaries.establishments && Array.isArray(myEstablishments.subsidaries.establishments)) {
      myEstablishments.subsidaries.establishments.forEach(thisSubsidairy => {
        if (!onlyMine || (onlyMine && thisSubsidairy.dataOwner === 'Parent')) {
          const newSub = new EstablishmentEntity(loggedInUsername);
          currentEntities.push(newSub);
          restoreEntityPromises.push(newSub.restore(thisSubsidairy.uid, false, true, assocationLevel));
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
const validationDifferenceReport = (primaryEstablishmentId, onloadEntities, currentEntities) => {
  const newEntities = []; const updatedEntities = []; const deletedEntities = [];

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
      const newWorkers = []; const updatedWorkers = []; const deletedWorkers = [];

      // find new/updated/deleted workers
      onloadWorkers.forEach(thisOnloadWorker => {
        const foundWorker = currentWorkers.find(thisCurrentWorker => {
          return thisCurrentWorker === thisOnloadWorker;
        });

        if (foundWorker) {
          const theWorker = foundCurrentEstablishment.theWorker(foundWorker);
          const theOnloadWorker = thisOnloadEstablishment.theWorker(thisOnloadWorker);

          // note - even though a worker has been found - and therefore it is obvious to update it
          //        it may be marked for deletion
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
              status: 'DELETED' // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight this has been automatically detected
            });
          });

          deletedEntities.push({
            key: thisCurrentEstablishment.key,
            name: thisCurrentEstablishment.name,
            localId: thisCurrentEstablishment.localIdentifier,
            status: 'DELETED', // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight this has been automatically detected
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

// deprecated
router.route('/report').get(async (req, res) => {
  return res.status(410).send('Deprecated');
});

router.route('/report/:reportType').get(async (req, res) => {
  const userAgent = UserAgentParser(req.headers['user-agent']);
  const windowsTest = /windows/i;
  const NEWLINE = windowsTest.test(userAgent.os.name) ? '\r\n' : '\n';
  const reportTypes = ['training', 'establishments', 'workers'];
  const reportType = req.params.reportType;
  const readable = new Stream.Readable();

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
      .reduce((result, item) => ({ ...result, [item.error]: [...(result[item.error] || []), item] }), {});

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
                    console.log();
                    readable.push(`"${thisDeletedEstablishment.name}" (LOCALSTID - ${thisDeletedEstablishment.localId}) - "${thisWorker.name}" (UNIQUEWORKERID - ${thisWorker.localId})${NEWLINE}`);
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
                    readable.push(`"${thisUpdatedEstablishment.name}" (LOCALSTID - ${thisUpdatedEstablishment.localId})- "${thisWorker.name}" (UNIQUEWORKERID - ${thisWorker.localId})${NEWLINE}`);
                  });
              }
            });
        }
      }
    }

    readable.push(null);

    res.setHeader('Content-disposition', 'attachment; filename=' + getFileName(reportType));
    res.set('Content-Type', 'text/plain');
    return readable.pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

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

const getFileName = (reportType) => {
  if (reportType === 'training') {
    return 'TrainingResults.txt';
  } else if (reportType === 'establishments') {
    return 'WorkplaceResults.txt';
  } else if (reportType === 'workers') {
    return 'StaffrecordsResults.txt';
  }
};

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
const restoreOnloadEntities = async (loggedInUsername, primaryEstablishmentId) => {
  try {
    // the result of validation is to make available an S3 object outlining ALL entities ready to be uploaded
    const allEntitiesKey = `${primaryEstablishmentId}/intermediary/all.entities.json`;

    const onLoadEntitiesJSON = await downloadContent(allEntitiesKey);
    const onLoadEntities = JSON.parse(onLoadEntitiesJSON.data);

    // now create/load establishment entities from each of the establishments, including all associated entities (full depth including training/quals)
    const onLoadEstablishments = [];
    const onloadPromises = [];
    if (onLoadEntities && Array.isArray(onLoadEntities)) {
      onLoadEntities.forEach(thisEntity => {
        const newOnloadEstablishment = new EstablishmentEntity(loggedInUsername);
        onLoadEstablishments.push(newOnloadEstablishment);

        newOnloadEstablishment.initialise(thisEntity.address1,
          thisEntity.address2,
          thisEntity.address3,
          thisEntity.town,
          thisEntity.county,
          thisEntity.locationId,
          thisEntity.provId,
          thisEntity.postcode,
          thisEntity.isRegulated);
        onloadPromises.push(newOnloadEstablishment.load(thisEntity, true));
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

const completeNewEstablishment = async (thisNewEstablishment, theLoggedInUser, transaction, onloadEstablishments, primaryEstablishmentId, primaryEstablishmentUid) => {
  try {
    const startTime = new Date();

    // find the onload establishment by key
    const foundOnloadEstablishment = onloadEstablishments.find(thisOnload => thisOnload.key === thisNewEstablishment.key);

    // the entity is already loaded, so simply prep it ready for saving
    if (foundOnloadEstablishment) {
      // as this new establishment is created from a parent, it automatically becomes a sub
      foundOnloadEstablishment.initialiseSub(primaryEstablishmentId, primaryEstablishmentUid);
      await foundOnloadEstablishment.save(theLoggedInUser, true, 0, transaction, true);
      await foundOnloadEstablishment.bulkUploadWdf(theLoggedInUser, transaction);
    }

    const endTime = new Date();
    const numberOfWorkers = foundOnloadEstablishment.workers.length;
    timerLog('CHECKPOINT - BU COMPLETE - new establishment', startTime, endTime, numberOfWorkers);
  } catch (err) {
    console.error('completeNewEstablishment: failed to complete upon new establishment: ', thisNewEstablishment.key);
    throw err;
  }
};

const completeUpdateEstablishment = async (thisUpdatedEstablishment, theLoggedInUser, transaction, onloadEstablishments, myCurrentEstablishments) => {
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

      await foundCurrentEstablishment.load(thisEstablishmentJSON, true, true);
      await foundCurrentEstablishment.save(theLoggedInUser, true, 0, transaction, true);
      await foundCurrentEstablishment.bulkUploadWdf(theLoggedInUser, transaction);

      const endTime = new Date();
      const numberOfWorkers = foundCurrentEstablishment.workers.length;
      timerLog('CHECKPOINT - BU COMPLETE - update establishment', startTime, endTime, numberOfWorkers);
    }
  } catch (err) {
    console.error('completeUpdateEstablishment: failed to complete upon existing establishment: ', thisUpdatedEstablishment.key);
    throw err;
  }
};

const completeDeleteEstablishment = async (thisDeletedEstablishment, theLoggedInUser, transaction, myCurrentEstablishments) => {
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

router.route('/complete').post(async (req, res) => {
  // manage the request timeout
  req.setTimeout(config.get('bulkupload.completion.timeout') * 1000);

  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const primaryEstablishmentUid = req.establishment.uid;
  const isParent = req.isParent;

  try {
    // completing bulk upload must always work on the current set of known entities and not rely
    //  on any aspect of the current entities at the time of validation; there may be minutes/hours
    //  validating a bulk upload and completing it.
    const completeStartTime = new Date();
    const myCurrentEstablishments = await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent, 1); // association level is just 1 (we need Establishment's workers for completion, but not the Worker's associated training and qualification)

    const restoredExistingStateTime = new Date();
    timerLog('CHECKPOINT - BU COMPLETE - have restored current state of establishments/workers', completeStartTime, restoredExistingStateTime);

    try {
      const onloadEstablishments = await restoreOnloadEntities(theLoggedInUser, primaryEstablishmentId);
      const validationDiferenceReportDownloaded = await downloadContent(`${primaryEstablishmentId}/validation/difference.report.json`, null, null);
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
        await dbmodels.sequelize.transaction(async t => {
          // first create the new establishments - in sequence
          const starterNewPromise = Promise.resolve(null);
          await validationDiferenceReport.new.reduce((p, thisNewEstablishment) => p.then(() => completeNewEstablishment(thisNewEstablishment, theLoggedInUser, t, onloadEstablishments, primaryEstablishmentId, primaryEstablishmentUid).then(log)), starterNewPromise);

          // now update the updated
          const starterUpdatedPromise = Promise.resolve(null);
          await validationDiferenceReport.updated.reduce((p, thisUpdatedEstablishment) => p.then(() => completeUpdateEstablishment(thisUpdatedEstablishment, theLoggedInUser, t, onloadEstablishments, myCurrentEstablishments).then(log)), starterUpdatedPromise);

          // and finally, delete the deleted
          const starterDeletedPromise = Promise.resolve(null);
          await validationDiferenceReport.deleted.reduce((p, thisDeletedEstablishment) => p.then(() => completeDeleteEstablishment(thisDeletedEstablishment, theLoggedInUser, t, myCurrentEstablishments).then(log)), starterDeletedPromise);

          completeCommitTransactionTime = new Date();
        });

        const completeSaveTime = new Date();

        if (completeCommitTransactionTime) {
          timerLog('CHECKPOINT - BU COMPLETE - commit transaction', completeCommitTransactionTime, completeSaveTime);
        }

        timerLog('CHECKPOINT - BU COMPLETE - have completed all establishments', restoredOnLoadStateTime, completeSaveTime);

        // gets here having successfully completed upon the bulk upload
        //  clean up the S3 objects
        await purgeBulkUploadS3Obbejcts(primaryEstablishmentId);

        // confirm success against the primary establishment
        await EstablishmentEntity.bulkUploadSuccess(primaryEstablishmentId);

        const completeEndTime = new Date();
        timerLog('CHECKPOINT - BU COMPLETE - clean up', completeSaveTime, completeEndTime);
        timerLog('CHECKPOINT - BU COMPLETE - overall', completeStartTime, completeEndTime);

        return res.status(200).send({});
      } catch (err) {
        console.error("route('/complete') err: ", err);
        return res.status(503).send({
          message: 'Failed to save'
        });
      }
    } catch (err) {
      console.error('router.route(\'/complete\').post: failed to download entities intermediary - atypical that the object does not exist because not yet validated: ', err);
      return res.status(400).send({
        message: 'Validation has not ran'
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

// takes the given set of establishments, and returns the string equivalent of each of the establishments, workers and training CSV
const exportToCsv = async (NEWLINE, allMyEstablishemnts, primaryEstablishmentId) => {
  const establishmentsCsvArray = [];
  const workersCsvArray = [];
  const trainingCsvArray = [];

  // before being able to write the worker header, we need to know the maximum number of qualifications
  //  columns across all workers
  try {
    const determineMaxQuals = await dbmodels.sequelize.query(
      'select cqc.maxQualifications(:givenPrimaryEstablishment);',
      {
        replacements: {
          givenPrimaryEstablishment: primaryEstablishmentId
        },
        type: dbmodels.sequelize.QueryTypes.SELECT
      }
    );

    if (determineMaxQuals && determineMaxQuals[0].maxqualifications && Number.isInteger(parseInt(determineMaxQuals[0].maxqualifications, 10))) {
      const MAX_QUALS = parseInt(determineMaxQuals[0].maxqualifications, 10);

      // first the header rows
      establishmentsCsvArray.push(new CsvEstablishmentValidator().headers);
      workersCsvArray.push(new CsvWorkerValidator().headers(MAX_QUALS));
      trainingCsvArray.push(new CsvTrainingValidator().headers);

      allMyEstablishemnts.forEach(thisEstablishment => {
        const establishmentCsvValidator = new CsvEstablishmentValidator();

        establishmentsCsvArray.push(establishmentCsvValidator.toCSV(thisEstablishment));

        // for each worker on this establishment
        const thisEstablishmentWorkers = thisEstablishment.workers;
        thisEstablishmentWorkers.forEach(thisWorker => {
          const workerCsvValidator = new CsvWorkerValidator();

          // note - thisEstablishment.name will need to be local identifier once available
          workersCsvArray.push(workerCsvValidator.toCSV(thisEstablishment.localIdentifier, thisWorker, MAX_QUALS));

          // and for this Worker's training records
          if (thisWorker.training) {
            thisWorker.training.forEach(thisTrainingRecord => {
              const trainingCsvValidator = new CsvTrainingValidator();

              trainingCsvArray.push(trainingCsvValidator.toCSV(thisEstablishment.key, thisWorker.key, thisTrainingRecord));
            });
          }
        });
      });
    } else {
      console.error('bulk upload exportToCsv - max quals error: ', determineMaxQuals);
    }
  } catch (err) {
    console.error('bulk upload exportToCsv error: ', err);
  }

  return [establishmentsCsvArray.join(NEWLINE), workersCsvArray.join(NEWLINE), trainingCsvArray.join(NEWLINE)];
};

// TODO - note, regardless of which download type is requested, the way establishments, workers and training entities are restored, it is easy enough to create all three exports every time
//  Ideally, the CSV content should be prepared and uploaded to S3, and then signed URLs returned for the browsers to download directly, thus not imposing the streaming of large data files through node.js API
router.route('/download/:downloadType').get(async (req, res) => {
  req.setTimeout(config.get('bulkupload.download.timeout') * 1000);

  // this report returns as plain text. The report line endings are dependent on not the
  //  runtime platform, but on the requesting platform (99.9999% of the users will be on Windows)
  const userAgent = UserAgentParser(req.headers['user-agent']);
  const windowsTest = /windows/i;
  const NEWLINE = windowsTest.test(userAgent.os.name) ? '\r\n' : '\n';

  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;

  const isParent = req.isParent;

  const ALLOWED_DOWNLOAD_TYPES = ['establishments', 'workers', 'training'];
  const downloadType = req.params.downloadType;

  try {
    let establishments = []; let workers = []; let training = [];
    if (ALLOWED_DOWNLOAD_TYPES.includes(downloadType)) {
      try {
        const ENTITY_RESTORE_LEVEL = 2;
        // only restore those subs that this primary establishment owns
        const myCurrentEstablishments = await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent, ENTITY_RESTORE_LEVEL, true);
        [establishments, workers, training] = await exportToCsv(NEWLINE, myCurrentEstablishments, primaryEstablishmentId);
      } catch (err) {
        console.error('router.get(\'/bulkupload/download\').get: failed to restore my establishments and all associated entities (workers, qualifications and training: ', err);
        return res.status(503).send({});
      }

      // before returning the response - upload to S3
      if (config.get('bulkupload.validation.storeIntermediaries')) {
        const s3UploadPromises = [];
        // upload the converted CSV as JSON to S3 - these are temporary objects as we build confidence in bulk upload they can be removed
        s3UploadPromises.push(uploadAsCSV(theLoggedInUser, primaryEstablishmentId, establishments, `${primaryEstablishmentId}/download/establishments.csv`));
        s3UploadPromises.push(uploadAsCSV(theLoggedInUser, primaryEstablishmentId, workers, `${primaryEstablishmentId}/download/workers.csv`));
        s3UploadPromises.push(uploadAsCSV(theLoggedInUser, primaryEstablishmentId, training, `${primaryEstablishmentId}/download/training.csv`));

        await Promise.all(s3UploadPromises);
      }

      const date = new Date().toISOString().split('T')[0];
      res.setHeader('Content-disposition', 'attachment; filename=' + `${date}-sfc-bulk-upload-${downloadType}.csv`);
      res.set('Content-Type', 'text/csv').status(200);

      let response = null;
      switch (downloadType) {
        case 'establishments':
          response = establishments;
          break;
        case 'workers':
          response = workers;
          break;
        case 'training':
          response = training;
          break;
      }

      return res.send(response);
    } else {
      console.error(`router.get('/bulkupload/download').get: unexpected download type: ${downloadType}`, downloadType);
      return res.status(400).send({
        message: 'Unexpected download type'
      });
    }
  } catch (err) {
    console.error('router.get(\'/bulkupload/download\').get: error: ', err);
    return res.status(503).send({});
  }
});

// demo API to showcase how trickle feed responses would work for the client
//  no parameter validation and no error handling and no security
router.route('/trickle').post(async (req, res) => {
  const retries = parseInt(req.query.retries, 10);
  const withError = !(!req.query.error || req.query.error !== 'true');
  const withTrickle = !!(!req.query.trickle || req.query.trickle !== 'false');

  const RETRY_TIMEOUT_SECS = 15;
  const RETRY_TIMEOUT = RETRY_TIMEOUT_SECS * 1000; // milliseconds
  let currentRetries = 0;
  let firstStatusFlush = true;

  const response = {
    status: []
  };

  const statusMsg = () => {
    currentRetries++;
    const timestamp = new Date().toISOString();

    response.status.push({
      message: `${currentRetries}`,
      duration: `${RETRY_TIMEOUT} seconds`,
      timestamp
    });

    if (withTrickle) {
      if (firstStatusFlush) {
        console.log(`WA DEBUG - timed out: ${currentRetries} - ${timestamp}`);
        res.write(`{ "message": "${currentRetries}", "duration":"${RETRY_TIMEOUT} seconds", "timestamp":"${timestamp}" }`);
        firstStatusFlush = false;
      } else {
        console.log(`WA DEBUG - comma timed out: ${currentRetries} - ${timestamp}`);
        res.write(`,{ "message": "${currentRetries}", "duration":"${RETRY_TIMEOUT} seconds", "timestamp":"${timestamp}" }`);
      }
      res.flush();
    }

    if (currentRetries < retries) {
      setTimeout(statusMsg, RETRY_TIMEOUT);
    } else {
      if (withTrickle) {
        if (withError) {
          res.end('],"error": "Forced Failure"}');
        } else {
          return res.end(']}');
        }
      } else {
        // if (withError) {
        //  E;
        // }

        return res.status(200).send(response);
      }
    }
  };

  if (withTrickle) {
    res.status(200);
    res.header('Content-Type', 'application/json');
    res.write('{"status": [');
    res.flush();
  }

  setTimeout(statusMsg, RETRY_TIMEOUT);
});

module.exports = router;
