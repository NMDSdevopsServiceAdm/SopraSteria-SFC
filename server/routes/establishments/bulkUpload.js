const express = require('express');
const appConfig = require('../../config/config');
const AWS = require('aws-sdk');
const fs = require('fs');
const csv = require('csvtojson');
const Stream = require('stream');
const moment = require('moment');
const dbmodels = require('../../models');

const UserAgentParser = require('ua-parser-js');

const router = express.Router();
const s3 = new AWS.S3({
  region: appConfig.get('bulkupload.region').toString(),
});

const CsvEstablishmentValidator = require('../../models/BulkImport/csv/establishments').Establishment;
const CsvWorkerValidator = require('../../models/BulkImport/csv/workers').Worker;
const CsvTrainingValidator = require('../../models/BulkImport/csv/training').Training;
const MetaData = require('../../models/BulkImport/csv/metaData').MetaData;

var FileStatusEnum = { "Latest": "latest", "Validated": "validated", "Imported": "imported" };


const EstablishmentEntity = require('../../models/classes/establishment').Establishment;
const WorkerEntity = require('../../models/classes/worker').Worker;
const QualificationEntity = require('../../models/classes/qualification').Qualification;
const TrainingEntity = require('../../models/classes/training').Training;
const UserEntity = require('../../models/classes/user').User;

const FileValidationStatusEnum = { "Pending": "pending", "Validating": "validating", "Pass": "pass", "PassWithWarnings": "pass with warnings", "Fail": "fail" };

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
        .map(async(file) => {
          const elements = file.Key.split("/");
          const objData = await s3.headObject({ Bucket: params.Bucket, Key: file.Key}).promise();
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

          const fileMetaData = data.Contents.filter(myFile => myFile.Key == file.Key+".metadata.json");
          if(fileMetaData.length == 1){
            const metaData = await downloadContent(fileMetaData[0].Key);
            const metadataJSON = JSON.parse(metaData.data);
            returnData.records = metadataJSON.records ? metadataJSON.records : 0;
            returnData.errors = metadataJSON.errors ? metadataJSON.errors : 0;
            returnData.warnings = metadataJSON.warnings ? metadataJSON.warnings : 0;
            returnData.fileType = metadataJSON.fileType ? metadataJSON.fileType : null;
          }

          return returnData;
        }));
    return res.status(200).send({establishment: {uid: req.establishmentId},files: returnData});
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

    const objHeadData = await s3.headObject({ Bucket: params.Bucket, Key: requestedKey}).promise();

    const elements = requestedKey.split("/");

    const returnData = {
      filename: elements[elements.length - 1],
      uploaded: objHeadData.LastModified,
      username: objHeadData.Metadata.username,
      size: objHeadData.ContentLength,
      key: requestedKey,
      signedUrl : s3.getSignedUrl('getObject', {
        Bucket: appConfig.get('bulkupload.bucketname').toString(),
        Key: requestedKey,
        Expires: appConfig.get('bulkupload.uploadSignedUrlExpire')
      })
    };

    return res.status(200).send({file: returnData});

  } catch (err) {
    if(err.code && err.code == "NotFound") return res.status(404).send({});
    console.log(err);
    return res.status(503).send({});
  }
});

const purgeBulkUploadS3Obbejcts = async (establishmentId) => {
    // drop all in latest
    let listParams = {
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
          Quiet: true,
        },
      };
      await s3.deleteObjects(deleteParams).promise();
    }
}

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
            validationstatus: FileValidationStatusEnum.Pending,
          },
          Expires: appConfig.get('bulkupload.uploadSignedUrlExpire'),
        });
        signedUrls.push(thisFile);
      }
    });

    return res.status(200).send(signedUrls);

  } catch (err) {
    console.error("API POST bulkupload/uploaded: ", err);
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
        validationstatus: FileValidationStatusEnum.Pending,
      },
      Expires: appConfig.get('bulkupload.uploadSignedUrlExpire'),
    });
    res.json({ urls: uploadPreSignedUrl });
    res.end();
  }
  catch (err) {
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

  let status = true;    // assume good

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
        createModelPromises.push(  downloadContent(myFile.Key, myFile.Size, myFile.LastModified) );
      }
    });

    const allContent = await Promise.all(createModelPromises);

    allContent.forEach(myfile=>{
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
      } else {

      }
    });

    // as a minimum, expect upon at least establishment and worker
    if (!(workerMetadata.fileType && establishmentMetadata.fileType)) {
      status = false;
    }

    let workerHeaders, establishmentHeaders, trainingHeaders;
    let importedWorkers = null, importedEstablishments = null, importedTraining = null;

    let headerPromises = [];

    if(myDownloads.establishments){
      headerPromises.push(new Promise( async (resolve, reject) => {
        importedEstablishments = await csv().fromString(myDownloads.establishments).on('header', (header) => {
          establishmentHeaders = header;
          resolve();
        });
      }));
    }

    if(myDownloads.workers){
      headerPromises.push(new Promise( async (resolve, reject) => {
        importedWorkers = await csv().fromString(myDownloads.workers).on('header', (header) => {
          workerHeaders = header;
          resolve();
        });
      }));
    }

    if(myDownloads.training){
      trainingHeaders.push(new Promise( async (resolve, reject) => {
        importedTraining = await csv().fromString(myDownloads.training).on('header', (header) => {
          trainingHeaders = header;
          resolve();
        });
      }));
    }

    await Promise.all(headerPromises);

    //////////////////////////////
    const firstRow = 0;
    const firstLineNumber = 1;
    const metadataS3Promises = [];

    if(importedEstablishments){
      const establishmentsCsvValidator = new CsvEstablishmentValidator(importedEstablishments[firstRow], firstLineNumber);
      if (establishmentsCsvValidator.preValidate(establishmentHeaders)) {
        // count records and update metadata
        establishmentMetadata.records = importedEstablishments.length;
        metadataS3Promises.push(uploadAsJSON(username, establishmentId, establishmentMetadata, `${establishmentId}/latest/${establishmentMetadata.filename}.metadata.json`));
      } else {
        // reset metadata filetype because this is not an expected establishment
        establishmentMetadata.fileType = null;
        status = false;
      }
    }

    if(importedWorkers){
      console.log("WA DEBUG - imported workers: ", importedWorkers)
      const workerCsvValidator = new CsvWorkerValidator(importedWorkers[firstRow], firstLineNumber);
      if(workerCsvValidator.preValidate(workerHeaders)){
        // count records and update metadata
        workerMetadata.records = importedWorkers.length;
        metadataS3Promises.push(uploadAsJSON(username, establishmentId, workerMetadata, `${establishmentId}/latest/${workerMetadata.filename}.metadata.json`));
      } else {
        // reset metadata filetype because this is not an expected establishment
        workerMetadata.fileType = null;
        status = false;
      }
    }

    if(importedTraining){
      const trainingCsvValidator = new CsvTrainingValidator(importedTraining[firstRow], firstLineNumber);
      if(trainingCsvValidator.preValidate(trainingHeaders)){
        // count records and update metadata
        trainingMetadata.records = importedTraining.length;
        metadataS3Promises.push(uploadAsJSON(username, establishmentId, trainingMetadata, `${establishmentId}/latest/${trainingMetadata.filename}.metadata.json`));
      } else {
        // reset metadata filetype because this is not an expected establishment
        trainingMetadata.fileType = null;
        status = false;
      }
    }

    //////////////////////////////////////
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
      }
    }

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
          let fileNameElements = myFile.Key.split("/");
          let fileName = fileNameElements[fileNameElements.length - 1];
          returnData.push(
            generateReturnData(
              {
                filename: fileName,
                uploaded: myFile.LastModified,
                username : myFile.username,
                records: 0,
                errors: 0,
                warnings: 0,
                fileType: null,
                size: myFile.size,
                key: myFile.Key,
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
    //  const establishmentsCSV = null;

    const createModelPromises = [];

    data.Contents.forEach(myFile => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;
      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        createModelPromises.push(  downloadContent(myFile.Key) );
      }
    });

    await Promise.all(createModelPromises).then(function(values){
       values.forEach(myfile=>{
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
        })
    }).catch(err => {
        console.error("NM: validate.put", err);
    }) ;

    const importedEstablishments = myDownloads.establishments ? await csv().fromString(myDownloads.establishments) : null;
    const importedWorkers = myDownloads.workers ? await csv().fromString(myDownloads.workers) :  null;
    const importedTraining = myDownloads.trainings ? await csv().fromString(myDownloads.trainings) : null;

    const validationResponse = await validateBulkUploadFiles(
      true,
      username,
      establishmentId,
      isParent,
      { imported: importedEstablishments, establishmentMetadata: establishmentMetadata  },
      { imported: importedWorkers, workerMetadata: workerMetadata },
      { imported: importedTraining, trainingMetadata: trainingMetadata });

      // handle parsing errors
      if (!validationResponse.status) {
        return res.status(400).send({
          establishment: validationResponse.metaData.establishments.toJSON(),
          workers: validationResponse.metaData.workers.toJSON(),
          training: validationResponse.metaData.training.toJSON(),
        });

      } else {
        return res.status(200).send({
          establishment: validationResponse.metaData.establishments.toJSON(),
          workers: validationResponse.metaData.workers.toJSON(),
          training: validationResponse.metaData.training.toJSON(),
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
  const workerRegex = /LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DI/;
  const trainingRegex = /LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DAT/;
  const filenameRegex=/^(.+\/)*(.+)\.(.+)$/;

  try {
    const importedEstablishments = await csv().fromString(req.body.establishments.csv);
    const importedWorkers = await csv().fromString(req.body.workers.csv);
    const importedTraining = await csv().fromString(req.body.training.csv);

    if (establishmentRegex.test(req.body.establishments.csv.substring(0,50))) {
      let key = req.body.establishments.filename;
      establishmentMetadata.filename = key.match(filenameRegex)[2]+ '.' + key.match(filenameRegex)[3];
      establishmentMetadata.fileType = 'Establishment';

    }
    if (workerRegex.test(req.body.workers.csv.substring(0,50))) {
      let key = req.body.workers.filename;
      workerMetadata.filename = key.match(filenameRegex)[2]+ '.' + key.match(filenameRegex)[3];
      workerMetadata.fileType = 'Worker';

    }

    if (trainingRegex.test(req.body.training.csv.substring(0,50))) {
      let key = req.body.training.filename;
      trainingMetadata.filename = key.match(filenameRegex)[2]+ '.' + key.match(filenameRegex)[3];
      trainingMetadata.fileType = 'Training';
    }

    const validationResponse = await validateBulkUploadFiles(
      false,
      username,
      establishmentId,
      isParent,
      { imported: importedEstablishments, establishmentMetadata: establishmentMetadata  },
      { imported: importedWorkers, workerMetadata: workerMetadata },
      { imported: importedTraining, trainingMetadata: trainingMetadata })

    // handle parsing errors
    if (!validationResponse.status) {
      return res.status(400).send({
        report: validationResponse.report,
        establishments: {
          filename: null,
          records: importedEstablishments.length,
          deleted: validationResponse.metaData.establishments.deleted,
          errors: validationResponse.validation.establishments
            .filter(thisVal => thisVal.hasOwnProperty('errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.establishments
            .filter(thisVal => thisVal.hasOwnProperty('warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          data: {
            csv: validationResponse.data.csv.establishments,
            entities: validationResponse.data.entities.establishments,
          },
        },
        workers: {
          filename: null,
          records: importedWorkers.length,
          deleted: validationResponse.metaData.workers.deleted,
          errors: validationResponse.validation.workers
            .filter(thisVal => thisVal.hasOwnProperty('errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.workers
            .filter(thisVal => thisVal.hasOwnProperty('warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          data: {
            csv: validationResponse.data.csv.workers,
            entities: {
              workers: validationResponse.data.entities.workers,
              qualifications: validationResponse.data.entities.qualifications,
            }
          },
        },
        training: {
          filename: null,
          records: importedTraining.length,
          errors: validationResponse.validation.training
            .filter(thisVal => thisVal.hasOwnProperty('errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.training
            .filter(thisVal => thisVal.hasOwnProperty('warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          data: {
            csv: validationResponse.data.csv.training,
            entities: validationResponse.data.entities.training,
          },
        },
        all: validationResponse.data.resulting,
      });

    } else {
      return res.status(200).send(validationResponse.data.resulting);
    }

  } catch (err) {
      console.error(err);
      return res.status(503).send({});
  }
});

async function downloadContent(key, objectSize, lastModified) {
    var params = {
      Bucket: appConfig.get('bulkupload.bucketname').toString(),
      Key: key,
    };

    const filenameRegex=/^(.+\/)*(.+)\.(.+)$/;

    try {
      const objData = await s3.getObject(params).promise();
      return {
        key: key,
        data: objData.Body.toString(),
        filename: key.match(filenameRegex)[2]+ '.' + key.match(filenameRegex)[3],
        username: objData.Metadata.username,
        size: objectSize,
        lastModified: lastModified,
     };

    } catch (err) {
      console.error(`api/establishment/bulkupload/downloadFile: ${key})\n`, err);
      throw new Error(`Failed to download S3 object: ${key}`);
    }
}

async function uploadAsJSON(username, establishmentId, content, key) {
  const myEstablishmentId = Number.isInteger(establishmentId) ? establishmentId.toString() : establishmentId;

  var params = {
    Bucket: appConfig.get('bulkupload.bucketname').toString(),
    Key: key,
    Body: JSON.stringify(content, null, 2),
    ContentType: 'application/json',
    Metadata: {
      username,
      establishmentId : myEstablishmentId,
    },
  };

  try {
    const objData = await s3.putObject(params).promise();
    //console.log(`${key} has been uploaded!`);

  } catch (err) {
    console.error('uploadAsJSON: ', err);
    throw new Error(`Failed to upload S3 object: ${key}`);
  }
}

async function uploadAsCSV(username, establishmentId, content, key) {
  const myEstablishmentId = Number.isInteger(establishmentId) ? establishmentId.toString() : establishmentId;

  var params = {
    Bucket: appConfig.get('bulkupload.bucketname').toString(),
    Key: key,
    Body: content,
    ContentType: 'text/csv',
    Metadata: {
      username,
      establishmentId : myEstablishmentId,
    },
  };

  try {
    const objData = await s3.putObject(params).promise();
    //console.log(`${key} has been uploaded!`);

  } catch (err) {
    console.error('uploadAsCSV: ', err);
    throw new Error(`Failed to upload S3 object: ${key}`);
  }
}


const _validateEstablishmentCsv = async (thisLine, currentLineNumber, csvEstablishmentSchemaErrors, myEstablishments, myAPIEstablishments) => {
  const lineValidator = new CsvEstablishmentValidator(thisLine, currentLineNumber);   // +2 because the first row is CSV headers, and forEach counter is zero index

  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  lineValidator.validate();
  lineValidator.transform();

  const thisEstablishmentAsAPI = lineValidator.toAPI();
  const thisApiEstablishment = new EstablishmentEntity();

  try {
    thisApiEstablishment.initialise(
      thisEstablishmentAsAPI.Address,
      thisEstablishmentAsAPI.LocationId,
      thisEstablishmentAsAPI.Postcode,
      thisEstablishmentAsAPI.IsCQCRegulated
    );

    await thisApiEstablishment.load(thisEstablishmentAsAPI);

    const isValid = thisApiEstablishment.validate();

    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      //console.log("WA DEBUG - this establishment entity: ", JSON.stringify(thisApiEstablishment.toJSON(), null, 2));
      myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
    } else {
      const errors = thisApiEstablishment.errors;
      const warnings = thisApiEstablishment.warnings;

      lineValidator.addAPIValidations(errors, warnings);

      if (errors.length === 0) {
        //console.log("WA DEBUG - this establishment entity: ", JSON.stringify(thisApiEstablishment.toJSON(), null, 2));
        myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
      } else {
        // TODO - remove this when capacities and services are fixed; temporarily adding establishments even though they're in error (because service/capacity validations put all in error)
        myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
      }
    }

  } catch (err) {
    console.error("WA - localised validate establishment error until validation card", err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach(thisError => csvEstablishmentSchemaErrors.push(thisError));
  }

  //console.log("WA DEBUG - this establishment: ", lineValidator.toJSON());
  //console.log("WA DEBUG - this establishment: ", JSON.stringify(lineValidator.toAPI(), null, 4));
  myEstablishments.push(lineValidator);
};

const _loadWorkerQualifications = async (lineValidator, thisQual, thisApiWorker, myAPIQualifications) => {
  const thisApiQualification = new QualificationEntity();
  const isValid = await thisApiQualification.load(thisQual);      // ignores "column" attribute (being the CSV column index, e.g "03" from which the qualification is mapped)
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

const _validateWorkerCsv = async (thisLine, currentLineNumber, csvWorkerSchemaErrors, myWorkers, myAPIWorkers, myAPIQualifications) => {
  const lineValidator = new CsvWorkerValidator(thisLine, currentLineNumber);   // +2 because the first row is CSV headers, and forEach counter is zero index

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
      //console.log("WA DEBUG - this worker entity: ", JSON.stringify(thisApiWorker.toJSON(), null, 2));
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
        //console.log("WA DEBUG - this worker entity: ", JSON.stringify(thisApiWorker.toJSON(), null, 2));
        myAPIWorkers[currentLineNumber] = thisApiWorker;
      }
    }
  } catch (err) {
    console.error("WA - localised validate workers error until validation card", err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach(thisError => csvWorkerSchemaErrors.push(thisError));
  }

  //console.log("WA DEBUG - this establishment: ", lineValidator.toJSON());
  //console.log("WA DEBUG - this establishment: ", JSON.stringify(lineValidator.toAPI(), null, 4));
  myWorkers.push(lineValidator);
};

const _validateTrainingCsv = async (thisLine, currentLineNumber, csvTrainingSchemaErrors, myTrainings, myAPITrainings) => {
  const lineValidator = new CsvTrainingValidator(thisLine, currentLineNumber);   // +2 because the first row is CSV headers, and forEach counter is zero index

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
    console.error("WA - localised validate training error until validation card", err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach(thisError => csvTrainingSchemaErrors.push(thisError));
  }

  //console.log("WA DEBUG - this training csv record: ", lineValidator.toJSON());
  // console.log("WA DEBUG - this training API record: ", JSON.stringify(lineValidator.toAPI(), null, 4));
  myTrainings.push(lineValidator);
};

// if commit is false, then the results of validation are not uploaded to S3
const validateBulkUploadFiles = async (commit, username , establishmentId, isParent, establishments, workers, training) => {
  let status = true;
  const csvEstablishmentSchemaErrors = [], csvWorkerSchemaErrors = [], csvTrainingSchemaErrors = [];
  const myEstablishments = [], myWorkers = [], myTrainings = [];
  const workersKeyed = []

  // rather than an array of entities, entities will be known by their line number within the source, e.g:
  // establishments: {
  //    1: { },
  //    2: { },
  //    ...
  // }
  const myAPIEstablishments = {}, myAPIWorkers = {}, myAPITrainings = {}, myAPIQualifications = {};

  // for unique/cross-reference validations
  const allEstablishmentsByKey = {}; const allWorkersByKey = {};

  // parse and process Establishments CSV
  if (Array.isArray(establishments.imported) && establishments.imported.length > 0 && establishments.establishmentMetadata.fileType == "Establishment") {
    await Promise.all(
      establishments.imported.map((thisLine, currentLineNumber) => {
        return _validateEstablishmentCsv(thisLine, currentLineNumber+2, csvEstablishmentSchemaErrors, myEstablishments, myAPIEstablishments);
      })
    );

    // having parsed all establishments, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'LOCALESTID` as property name
    myEstablishments.forEach(thisEstablishment => {
      const keyNoWhitespace = thisEstablishment.localId;
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
    console.info("API bulkupload - validateBulkUploadFiles: no establishment records");
    status = false;
  }

  establishments.establishmentMetadata.records = myEstablishments.length;

  // parse and process Workers CSV
  if (Array.isArray(workers.imported) && workers.imported.length > 0 && workers.workerMetadata.fileType == "Worker") {
    await Promise.all(
      workers.imported.map((thisLine, currentLineNumber) => {
        return _validateWorkerCsv(thisLine, currentLineNumber+2, csvWorkerSchemaErrors, myWorkers, myAPIWorkers, myAPIQualifications);
      })
    );

    // having parsed all workers, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'UNIQUEWORKERID`as property name
    myWorkers.forEach(thisWorker => {
      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = (thisWorker.local + thisWorker.uniqueWorker).replace(/\s/g, "");
      if (allWorkersByKey[keyNoWhitespace]) {
        // this worker is a duplicate
        csvWorkerSchemaErrors.push(thisWorker.addDuplicate(allWorkersByKey[keyNoWhitespace]));

        // remove the entity
        delete myAPIWorkers[thisWorker.lineNumber];
      } else {
        // does not yet exist - check this worker can be associated with a known establishment
        const establishmentKeyNoWhitespace = thisWorker.local ? thisWorker.local.replace(/\s/g, "") : '';
        if (!allEstablishmentsByKey[establishmentKeyNoWhitespace]) {
          // not found the associated establishment
          csvWorkerSchemaErrors.push(thisWorker.uncheckedEstablishment());

          // remove the entity
          delete myAPIWorkers[thisWorker.lineNumber];
        } else {
          // this worker is unique and can be associated to establishment
          allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;

          // associate this worker to the known establishment
          const workerKey = thisWorker.uniqueWorker ? thisWorker.uniqueWorker.replace(/\s/g, "") : null;
          const foundEstablishmentByLineNumber = allEstablishmentsByKey[establishmentKeyNoWhitespace];

          const knownEstablishment = myAPIEstablishments[establishmentKeyNoWhitespace] ? myAPIEstablishments[establishmentKeyNoWhitespace] : null;

          //key workers, to be used in training
          const workerKeyNoWhitespace = (thisWorker._currentLine.LOCALESTID + thisWorker._currentLine.UNIQUEWORKERID).replace(/\s/g, "");
          workersKeyed[workerKeyNoWhitespace] = thisWorker._currentLine;

          if (knownEstablishment) {
            knownEstablishment.associateWorker(myAPIWorkers[thisWorker.lineNumber].key, myAPIWorkers[thisWorker.lineNumber]);
          } else {
            // this should never happen
            console.error(`FATAL: failed to associate worker (line number: ${thisWorker.lineNumber}/unique id (${thisWorker.uniqueWorker})) with a known establishment.`);
          }
        }
      }
    });

  } else {
    console.info("API bulkupload - validateBulkUploadFiles: no workers records");
    status = false;
  }
  workers.workerMetadata.records = myWorkers.length;

  // parse and process Training CSV
  if (Array.isArray(training.imported) && training.imported.length > 0 && training.trainingMetadata.fileType == "Training") {
    await Promise.all(
      training.imported.map((thisLine, currentLineNumber) => {
        return _validateTrainingCsv(thisLine, currentLineNumber+2, csvTrainingSchemaErrors, myTrainings, myAPITrainings);
      })
    );

    // note - there is no uniqueness test for a training record

    // having parsed all establishments, workers and training, need to cross-check all training records' establishment reference (LOCALESTID) against all parsed establishments
    // having parsed all establishments, workers and training, need to cross-check all training records' worker reference (UNIQUEWORKERID) against all parsed workers
    myTrainings.forEach(thisTraingRecord => {

      const establishmentKeyNoWhitespace = (thisTraingRecord.localeStId || '').replace(/\s/g, "");
      const workerKeyNoWhitespace = (thisTraingRecord.localeStId + thisTraingRecord.uniqueWorkerId).replace(/\s/g, "");

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

        const trainingCompletedDate = moment.utc(thisTraingRecord._currentLine.DATECOMPLETED, "DD-MM-YYYY")
        const workerDob = moment.utc(workersKeyed[workerKeyNoWhitespace].DOB, "DD-MM-YYYY")

        if (trainingCompletedDate.diff(workerDob, 'years') < 14 ) {
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
      console.info("API bulkupload - validateBulkUploadFiles: no training records");
      status = false;
  }
  training.trainingMetadata.records = myTrainings.length;

  // prepare entities ready for upload/return
  const establishmentsAsArray = Object.values(myAPIEstablishments);
  const workersAsArray = Object.values(myAPIWorkers);
  const trainingAsArray = Object.values(myAPITrainings);
  const qualificationsAsArray = Object.values(myAPIQualifications);

  // prepare the validation difference report which highlights all new, updated and deleted establishments and workers
  const myCurrentEstablishments = await restoreExistingEntities(username, establishmentId, isParent);
  // bulk upload specific validations - knowing the to load and current set of entities

  // firstly, if the logged in account performing this validation is not a parent, then
  //  there should be just one establishment, and that establishment should the primary establishment
  if (!isParent) {
    const numberOfEstablishments = establishments.imported.length;
    const MAX_ESTABLISHMENTS = 1;

    if (establishments.imported.length !== MAX_ESTABLISHMENTS) {
      csvEstablishmentSchemaErrors.push(CsvEstablishmentValidator.justOneEstablishmentError());
    }
  }

  // the primary establishment should alway be present
  // TODO - should use LOCAL_IDENTIFIER when available.
  const primaryEstablishment = myCurrentEstablishments.find(thisCurrentEstablishment => {
    if (thisCurrentEstablishment.id === establishmentId) {
      return thisCurrentEstablishment;
    }
  });


  let notPrimary = true;
  if (primaryEstablishment) {
    const onloadedPrimaryEstablishment = myAPIEstablishments[primaryEstablishment.key];
    if (!onloadedPrimaryEstablishment) {
      csvEstablishmentSchemaErrors.push(CsvEstablishmentValidator.missingPrimaryEstablishmentError(primaryEstablishment.name));
    }
  } else {
    console.error(("Seriously, if seeing this then something has truely gone wrong - the primary establishment should always be in the set of current establishments!"));
  }

  // update CSV metadata error/warning counts
  establishments.establishmentMetadata.errors = csvEstablishmentSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  establishments.establishmentMetadata.warnings = csvEstablishmentSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  workers.workerMetadata.errors = csvWorkerSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  workers.workerMetadata.warnings = csvWorkerSchemaErrors.filter(thisError => 'warnCode' in thisError).length;


  training.trainingMetadata.errors = csvTrainingSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  training.trainingMetadata.warnings = csvTrainingSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  // create the difference report, which includes trapping for deleting of primary establishment
  const report = validationDifferenceReport(establishmentId, establishmentsAsArray, myCurrentEstablishments);


  // from the validation report, get a summary of deleted establishments and workers
  // the report will always have new, udpated, deleted array values, even if empty
  // Note - Array.reduce but it doesn't work with empty arrays, except when you provide an initial value (0 in this case)
  establishments.establishmentMetadata.deleted = report.deleted.length;
  const numberOfDeletedWorkersFromUpdatedEstablishments = report.updated.reduce((total, current) => total += current.workers.deleted.length, 0);
  const numberOfDeletedWorkersFromDeletedEstablishments = report.deleted.reduce((total, current) => total += current.workers.deleted.length, 0);
  workers.workerMetadata.deleted = numberOfDeletedWorkersFromUpdatedEstablishments + numberOfDeletedWorkersFromDeletedEstablishments;

  // upload intermediary/validation S3 objects
  if (commit) {
    const s3UploadPromises = [];

    // upload the metadata as JSON to S3 - these are requited for uploaded list endpoint
    establishments.imported  ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, establishments.establishmentMetadata, `${establishmentId}/latest/${establishments.establishmentMetadata.filename}.metadata.json`)) : true;
    workers.imported  ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, workers.workerMetadata, `${establishmentId}/latest/${workers.workerMetadata.filename}.metadata.json`)) : true;
    training.imported ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, training.trainingMetadata, `${establishmentId}/latest/${training.trainingMetadata.filename}.metadata.json`)) : true;

    // upload the validation data to S3 - these are reuquired for validation report - although one object is likely to be quicker to upload - and only one object is required then to download
    s3UploadPromises.push(uploadAsJSON(username, establishmentId, csvEstablishmentSchemaErrors, `${establishmentId}/validation/establishments.validation.json`));
    s3UploadPromises.push(uploadAsJSON(username, establishmentId, csvWorkerSchemaErrors, `${establishmentId}/validation/workers.validation.json`));
    s3UploadPromises.push(uploadAsJSON(username, establishmentId, csvTrainingSchemaErrors, `${establishmentId}/validation/training.validation.json`));
    s3UploadPromises.push(uploadAsJSON(username, establishmentId, report, `${establishmentId}/validation/difference.report.json`));

    // to false to disable the upload of intermediary objects
    const traceData = true;
    if (traceData) {
      // upload the converted CSV as JSON to S3 - these are temporary objects as we build confidence in bulk upload they can be removed
      myEstablishments.length > 0  ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, myEstablishments.map(thisEstablishment => thisEstablishment.toJSON()), `${establishmentId}/intermediary/${establishments.establishmentMetadata.filename}.csv.json`)) : true;
      myWorkers.length > 0  ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, myWorkers.map(thisEstablishment => thisEstablishment.toJSON()), `${establishmentId}/intermediary/${workers.workerMetadata.filename}.csv.json`)) : true;
      myTrainings.length > 0  ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, myTrainings.map(thisEstablishment => thisEstablishment.toJSON()), `${establishmentId}/intermediary/${training.trainingMetadata.filename}.csv.json`)) : true;

      // upload the intermediary entities as JSON to S3
      //console.log("WA DEBUG - establishment entities as JSON:\n", JSON.stringify(myAPIEstablishments.map(thisEstablishment => thisEstablishment.toJSON(false,false,false,false,true,false,true)), null, 4));

      // debug
      const allentitiesreadyforjson = establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON(false,false,false,false,true,null,true));
      const establishmentsOnlyForJson = establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON());
      const workersOnlyForJson = workersAsArray.map(thisWorker => thisWorker.toJSON());
      const trainingOnlyForJson = trainingAsArray.map(thisTraining => thisTraining.toJSON());
      const qualificationsOnlyForJson = qualificationsAsArray.map(thisQualification => thisQualification.toJSON());

      establishmentsAsArray.length > 0 ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, allentitiesreadyforjson, `${establishmentId}/intermediary/all.entities.json`)) : true;
      establishmentsAsArray.length > 0 ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, establishmentsOnlyForJson, `${establishmentId}/intermediary/establishment.entities.json`)) : true;
      workersAsArray.length > 0 ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, workersOnlyForJson, `${establishmentId}/intermediary/worker.entities.json`)) : true;
      trainingAsArray.length > 0 ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, trainingOnlyForJson, `${establishmentId}/intermediary/training.entities.json`)) : true;
      qualificationsAsArray.length > 0 ? s3UploadPromises.push(uploadAsJSON(username, establishmentId, qualificationsOnlyForJson, `${establishmentId}/intermediary/qualification.entities.json`)) : true;
    }

    // before returning, wait for all uploads to complete
    await Promise.all(s3UploadPromises);
  }

  status = csvEstablishmentSchemaErrors.length > 0 || csvWorkerSchemaErrors.length > 0 || csvTrainingSchemaErrors.length > 0 ? false : true;

  const response = {
    status,
    report,
    validation: {
      establishments: csvEstablishmentSchemaErrors,
      workers: csvWorkerSchemaErrors,
      training: csvTrainingSchemaErrors,
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
        training: myTrainings.map(thisTraining => thisTraining.toJSON()),
      },
      entities: {
        establishments: establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON()),
        workers: workersAsArray.map(thisWorker => thisWorker.toJSON()),
        training: trainingAsArray.map(thisTraining => thisTraining.toJSON()),
        qualifications: qualificationsAsArray.map(thisQualification => thisQualification.toJSON()),
      },
      resulting:  establishmentsAsArray.map(thisEstablishment => thisEstablishment.toJSON(false,false,false,false,true,null,true)),
    }
  };

  return response;
};

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
const restoreExistingEntities = async (loggedInUsername, primaryEstablishmentId, isParent, assocationLevel) => {
  try {
    const thisUser = new UserEntity(primaryEstablishmentId);;
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
        const newSub = new EstablishmentEntity(loggedInUsername);
        currentEntities.push(newSub);
        restoreEntityPromises.push(newSub.restore(thisSubsidairy.uid, false, true, assocationLevel));
      });
    }

    await Promise.all(restoreEntityPromises);

    return currentEntities;

  } catch (err) {
      console.error("/restoreExistingEntities: ERR: ", err.message);
      throw err;
  }
};

// having validated bulk upload files - and generated any number of validation errors and warnings
//  if there are no error, then the user will be able to complete the upload. But to be
//  able to complete on the upload though, they will need a report highlighting which, if any, of the
//  the establishments and workers will be deleted.
// Only generate this validation difference report, if there are no errors.
const validationDifferenceReport = (primaryEstablishmentId, onloadEntities, currentEntities) => {
  const status = true;
  const newEntities = [], updatedEntities = [], deletedEntities = [];

  if (!onloadEntities || !Array.isArray(onloadEntities)) {
    console.error('validationDifferenceReport: onload entities unexpected');
    status = false;
  }
  if (!currentEntities || !Array.isArray(currentEntities)) {
    console.error('validationDifferenceReport: current entities unexpected');
    status = false;
  }

  // determine new and updated establishments, by referencing the onload set against the current set
  onloadEntities.forEach(thisOnloadEstablishment => {
    // find a match for this establishment
    // TODO - without LOCAL_IDENTIFIER, matches are performed using the name of the establishment
    const foundCurrentEstablishment = currentEntities.find(thisCurrentEstablishment => thisCurrentEstablishment.key === thisOnloadEstablishment.key);

    if (foundCurrentEstablishment) {

      // for updated establishments, need to cross check the set of onload and current workers to identify the new, updated and deleted workers
      const currentWorkers = foundCurrentEstablishment.associatedWorkers;
      const onloadWorkers = thisOnloadEstablishment.associatedWorkers;
      const newWorkers = [], updatedWorkers = [], deletedWorkers = [];

      // find new/updated/deleted workers
      onloadWorkers.forEach(thisOnloadWorker => {
        const foundWorker= currentWorkers.find(thisCurrentWorker => thisCurrentWorker === thisOnloadWorker);

        if (foundWorker) {
          updatedWorkers.push({
            nameOrId: thisOnloadWorker
          });
        } else {
          newWorkers.push({
            nameOrId: thisOnloadWorker
          });
        }
      });

      // find deleted workers
      currentWorkers.forEach(thisCurrentWorker => {
        const foundWorker= onloadWorkers.find(thisOnloadWorker => thisCurrentWorker === thisOnloadWorker);

        if (!foundWorker) {
          deletedWorkers.push({
            nameOrId: thisCurrentWorker
          });
        }
      });

      // TODO - without LOCAL_IDENTIFIER, matches are performed using the name of the establishment
      updatedEntities.push({
        key: thisOnloadEstablishment.key,
        workers: {
          new: newWorkers,
          updated: updatedWorkers,
          deleted: deletedWorkers
        }
      });
    } else {
      // TODO - without LOCAL_IDENTIFIER, matches are performed using the name of the establishment
      newEntities.push({
        key: thisOnloadEstablishment.key,
      });
    }
  });

  // determine the delete establishments, by reference the current set against the onload set
  currentEntities.forEach(thisCurrentEstablishment => {
    if (thisCurrentEstablishment.id !== primaryEstablishmentId) {
      // find a match for this establishment
      // TODO - without LOCAL_IDENTIFIER, matches are performed using the name of the establishment
      const foundOnloadEstablishment = onloadEntities.find(thisOnloadEstablishment => thisCurrentEstablishment.key === thisOnloadEstablishment.key);

      // cannot delete self
      if (!foundOnloadEstablishment) {
        // when delete an establishment, we're deleting all workers too
        const currentWorkers = thisCurrentEstablishment.associatedWorkers;
        const deletedWorkers = [];

        currentWorkers.forEach(thisCurrentWorker => deletedWorkers.push(thisCurrentWorker));

        deletedEntities.push({
          name: thisCurrentEstablishment.name,
          workers: {
            deleted: deletedWorkers,
          }
        });
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
    deleted: deletedEntities,
  };

};

router.route('/report').get(async (req, res) => {
  // this report returns as plain text. The report line endings are dependent on not the
  //  runtime platform, but on the requesting platform (99.9999% of the users will be on Windows)
  const userAgent = UserAgentParser(req.headers['user-agent']);
  const windowsTest = /windows/i;
  const NEWLINE = windowsTest.test(userAgent.os.name) ? "\r\n" : "\n";

  try {
    const params = {
      Bucket: appConfig.get('bulkupload.bucketname').toString(),
      Prefix: `${req.establishmentId}/validation/`
    };

    const validation = await s3.listObjects(params).promise();
    const validationMsgs = await Promise.all(validation.Contents);

    const validationMsgContent = validationMsgs.map(async(file) => {
      const content = await downloadContent(file.Key);
      return JSON.parse(content.data);
    });

    const errorsAndWarnings = await Promise.all(validationMsgContent);

    const key = `${req.establishmentId}/intermediary/establishment.entities.json`;
    let establishment =  null;
    try {
      establishment = await downloadContent(key);
    } catch (err) {
      console.log(`router.route('/report').get - failed to download: `, key);
    }
    const entities = establishment ? JSON.parse(establishment.data) : null;
    const readable = new Stream.Readable();

    const errorTitle = '* Errors (will cause file(s) to be rejected) *';
    const errorPadding = '*'.padStart(errorTitle.length, '*');
    readable.push(`${errorPadding}${NEWLINE}${errorTitle}${NEWLINE}${errorPadding}${NEWLINE}${NEWLINE}`);

    errorsAndWarnings
      .reduce((acc, val) => acc.concat(val), [])
      .filter(msg => msg.errCode && msg.errType)
      .sort((a,b) => a.errCode - b.errCode)
      .map(item => readable.push(`${item.origin} - ${item.error}, ${item.errCode} on line ${item.lineNumber}${NEWLINE}`));

    const warningTitle = '* Warnings (files will be accepted but data is incomplete or internally inconsistent) *';
    const warningPadding = '*'.padStart(warningTitle.length, '*');
    readable.push(`${NEWLINE}${warningPadding}${NEWLINE}${warningTitle}${NEWLINE}${warningPadding}${NEWLINE}${NEWLINE}`);

    errorsAndWarnings
      .reduce((acc, val) => acc.concat(val), [])
      .filter(msg => msg.warnCode && msg.warnType)
      .sort((a,b) => a.warnCode - b.warnCode)
      .map(item => readable.push(`${item.origin} - ${item.warning}, ${item.warnCode} on line ${item.lineNumber}${NEWLINE}`));

    const laTitle = '* You are sharing data with the following Local Authorities *';
    const laPadding = '*'.padStart(laTitle.length, '*');
    readable.push(`${NEWLINE}${laPadding}${NEWLINE}${laTitle}${NEWLINE}${laPadding}${NEWLINE}${NEWLINE}`);

    entities ? entities
      .map(en => en.localAuthorities !== undefined ? en.localAuthorities : [])
      .reduce((acc, val) => acc.concat(val), [])
      .sort((a,b) => a.name > b.name)
      .map(item => readable.push(`${item.name}${NEWLINE}`)) : true;

    readable.push(null);

    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-disposition', 'attachment; filename=' + `${date}-sfc-bulk-upload-report.txt`);
    res.set('Content-Type', 'text/plain');
    return readable.pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

router.route('/report/:reportType').get(async (req, res) => {
  const userAgent = UserAgentParser(req.headers['user-agent']);
  const windowsTest = /windows/i;
  const NEWLINE = windowsTest.test(userAgent.os.name) ? "\r\n" : "\n";
  const reportTypes = ['training', 'establishments', 'workers'];
  const reportType = req.params.reportType;
  const readable = new Stream.Readable();

  try {
    if (!reportTypes.includes(reportType)) {
      throw new Error(`router.route('/report').get - Invalid report type, valid types include - ${reportTypes.join(', ')}`);
    }

    let entities =  null;
    let messages =  null;

    const entityKey = `${req.establishmentId}/intermediary/establishment.entities.json`;

    try {
      const establishment = await downloadContent(entityKey);
      entities = establishment ? JSON.parse(establishment.data) : null;
    } catch (err) {
      throw new Error(`router.route('/report').get - failed to download: `, entityKey);
    }

    const reportKey = `${req.establishmentId}/validation/${reportType}.validation.json`;

    try {
      const content = await downloadContent(reportKey);
      messages = content ? JSON.parse(content.data) : null;
    } catch (err) {
      throw new Error(`router.route('/report').get - failed to download: `, reportKey);
    }

    const errorTitle = '* Errors (will cause file(s) to be rejected) *';
    const errorPadding = '*'.padStart(errorTitle.length, '*');
    readable.push(`${errorPadding}${NEWLINE}${errorTitle}${NEWLINE}${errorPadding}${NEWLINE}`);

    const errors = messages
      .reduce((acc, val) => acc.concat(val), [])
      .filter(msg => msg.errCode && msg.errType)
      .sort((a,b) => a.lineNumber - b.lineNumber)
      .reduce((result, item) => ({ ...result, [item['error']]: [...(result[item['error']] || []), item]}), {});

    printLine(readable, reportType, errors, NEWLINE)

    const warningTitle = '* Warnings (files will be accepted but data is incomplete or internally inconsistent) *';
    const warningPadding = '*'.padStart(warningTitle.length, '*');
    readable.push(`${NEWLINE}${warningPadding}${NEWLINE}${warningTitle}${NEWLINE}${warningPadding}${NEWLINE}`);

    const warnings =  messages
      .reduce((acc, val) => acc.concat(val), [])
      .filter(msg => msg.warnCode && msg.warnType)
      .sort((a,b) => a.lineNumber - b.lineNumber)
      .reduce((result, item) => ({ ...result, [item['warning']]: [...(result[item['warning']] || []), item]}), {});

    printLine(readable, reportType, warnings, NEWLINE)

    if (reportType === 'establishments') {
      const laTitle = '* You are sharing data with the following Local Authorities *';
      const laPadding = '*'.padStart(laTitle.length, '*');
      readable.push(`${NEWLINE}${laPadding}${NEWLINE}${laTitle}${NEWLINE}${laPadding}${NEWLINE}`);

      entities ? entities
      .map(en => en.localAuthorities !== undefined ? en.localAuthorities : [])
      .reduce((acc, val) => acc.concat(val), [])
      .sort((a,b) => a.name > b.name)
      .map(item => readable.push(`${item.name}${NEWLINE}`)) : true;
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
        if (reportType === 'training')
          return readable.push(`For worker with ${item.name} Subsidiary 3 and UNIQUEWORKERID ${item.worker} on line ${item.lineNumber}${sep}`)
        else if (reportType === 'establishments')
          return readable.push(`For establishment called ${item.name} on line ${item.lineNumber}${sep}`)
        else if (reportType === 'workers')
          return readable.push(`For worker with LOCALESTID ${item.name} and UNIQUEWORKERID ${item.worker} on line ${item.lineNumber}${sep}`)
      });
  });
}

const getFileName = (reportType) => {
  if (reportType === 'training')
    return 'TrainingResults.txt';
  else if (reportType === 'establishments')
    return 'WorkplaceResults.txt';
  else if (reportType === 'workers')
    return 'StaffrecordsResults.txt';
}

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


        newOnloadEstablishment.initialise(thisEntity.address,
                                          thisEntity.locationRef,
                                          thisEntity.postcode,
                                          thisEntity.isRegulated,
                                          null);
        onloadPromises.push(newOnloadEstablishment.load(thisEntity, true));
      });
    }
    // wait here for the loading of all establishments from entities to complete
    await Promise.all(onloadPromises);

    return onLoadEstablishments;

  } catch (err) {
      console.error("/restoreExistingEntities: ERR: ", err.message);
      throw err;
  }
};


router.route('/complete').post(async (req, res) => {
  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const primaryEstablishmentUid = req.establishment.uid;
  const isParent = req.isParent;

  // TODO: add traps to prevent completing without having ensure validation and just warnings not errors
  const fetchPromises = [];

  try {
    // completing bulk upload must always work on the current set of known entities and not rely
    //  on any aspect of the current entities at the time of validation; there may be minutes/hours
    //  validating a bulk upload and completing it.
    const myCurrentEstablishments = await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent, 1);    // association level is just 1 (we need Establishment's workers for completion, but not the Worker's associated training and qualification)

    try {
      const onloadEstablishments = await restoreOnloadEntities(theLoggedInUser, primaryEstablishmentId);
      const validationDiferenceReportDownloaded = await downloadContent(`${primaryEstablishmentId}/validation/difference.report.json`, null, null);
      const validationDiferenceReport = JSON.parse(validationDiferenceReportDownloaded.data);

      // could look to parallel the three above tasks as each is relatively intensive - but happy path first
      // process the set of new, updated and deleted entities for bulk upload completion, within a single transaction
      try {
        // all creates, updates and deletes (archive) are done in one transaction to ensure database integrity
        await dbmodels.sequelize.transaction(async t => {
          const updatedEstablishments = [];

          // first create the new establishments
          validationDiferenceReport.new.forEach(thisNewEstablishment => {
            // find the onload establishment by key
            // TODO - use the LOCAL_IDENTIFIER when its available
            const foundOnloadEstablishment = onloadEstablishments.find(thisOnload => thisOnload.key === thisNewEstablishment.key);

            // the entity is already loaded, so simply prep it ready for saving
            if (foundOnloadEstablishment) {
              // as this new establishment is created from a parent, it automatically becomes a sub
              foundOnloadEstablishment.initialiseSub(primaryEstablishmentId, primaryEstablishmentUid);
              updatedEstablishments.push(foundOnloadEstablishment);
            }
          });
          // now update the updated
          const updateEstablishmentPromises = [];
          validationDiferenceReport.updated.forEach(thisUpdatedEstablishment => {
            // find the current establishment and onload establishment by key
            // TODO - use the LOCAL_IDENTIFIER when its available
            const foundOnloadEstablishment = onloadEstablishments.find(thisOnload => thisOnload.key === thisUpdatedEstablishment.key);
            const foundCurrentEstablishment = myCurrentEstablishments.find(thisCurrent => thisCurrent.key === thisUpdatedEstablishment.key);

            if(foundOnloadEstablishment){
              delete foundOnloadEstablishment.localIdentifier;
              foundOnloadEstablishment.workers.forEach((worker) => {
                delete worker.localIdentifier;
                if(worker.changeLocalIdentifer){
                  worker._properties.get('LocalIdentifier').property = worker.changeLocalIdentifer;
                }
              });
            }

            // current is already restored, so simply need to load the onboard into the current, and load the associated work entities
            if (foundCurrentEstablishment) {
              updatedEstablishments.push(foundCurrentEstablishment);
              updateEstablishmentPromises.push(foundCurrentEstablishment.load(foundOnloadEstablishment.toJSON(false,false,false,false,true,null,true), true));
            }
          });

          // and finally, delete the deleted
          validationDiferenceReport.deleted.forEach(thisDeletedEstablishment => {

            // find the current establishment by key
            // TODO - use the LOCAL_IDENTIFIER when its available
            const foundCurrentEstablishment = myCurrentEstablishments.find(thisCurrent => thisCurrent.key === thisDeletedEstablishment.key);

            // current is already restored, so simply need to delete it
            if (foundCurrentEstablishment) {
              updateEstablishmentPromises.push(foundCurrentEstablishment.delete(theLoggedInUser, t, true));
            }
          });
          // wait for all updated::loads and deleted::deletes to complete
          await Promise.all(updateEstablishmentPromises);

          // and now all saves for new, updated and deleted establishments, including their associated entities
          await Promise.all(updatedEstablishments.map(toSave => toSave.save(theLoggedInUser, true, 0, t, true)));
        });

        // gets here having successfully completed upon the bulk upload
        //  clean up the S3 objects
        await purgeBulkUploadS3Obbejcts(primaryEstablishmentId);

        // confirm success against the primary establishment
        await EstablishmentEntity.bulkUploadSuccess(primaryEstablishmentId);

        return res.status(200).send({
          // current: myCurrentEstablishments.map(thisEstablishment => thisEstablishment.toJSON(false,false,false,false,true,null,true)),
          // validated: onloadEstablishments.map(thisEstablishment => thisEstablishment.toJSON(false,false,false,false,true,null,true)),
        });

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
const exportToCsv = async (NEWLINE, allMyEstablishemnts) => {
  const establishmentsCsvArray = [];
  const workersCsvArray = [];
  const trainingCsvArray = [];

  // first the header rows
  establishmentsCsvArray.push(new CsvEstablishmentValidator().headers);
  workersCsvArray.push(new CsvWorkerValidator().headers);
  trainingCsvArray.push(new CsvTrainingValidator().headers);

  allMyEstablishemnts.forEach(thisEstablishment => {
    const establishmentCsvValidator = new CsvEstablishmentValidator();

    establishmentsCsvArray.push(establishmentCsvValidator.toCSV(thisEstablishment));

    // for each worker on this establishment
    const thisEstablishmentWorkers = thisEstablishment.workers;
    thisEstablishmentWorkers.forEach(thisWorker => {
      const workerCsvValidator = new CsvWorkerValidator();

      // note - thisEstablishment.name will need to be local identifier once available
      workersCsvArray.push(workerCsvValidator.toCSV(thisEstablishment.localIdentifier, thisWorker));

      // and for this Worker's training records
      thisWorker.training ? thisWorker.training.forEach(thisTrainingRecord => {
        const trainingCsvValidator = new CsvTrainingValidator();

        trainingCsvArray.push(trainingCsvValidator.toCSV(thisEstablishment.key, thisWorker.key, thisTrainingRecord));
      }) : true;
    });

  });

  return [establishmentsCsvArray.join(NEWLINE), workersCsvArray.join(NEWLINE), trainingCsvArray.join(NEWLINE)]
};


// TODO - note, regardless of which download type is requested, the way establishments, workers and training entities are restored, it is easy enough to create all three exports every time
//  Ideally, the CSV content should be prepared and uploaded to S3, and then signed URLs returned for the browsers to download directly, thus not imposing the streaming of large data files through node.js API
router.route('/download/:downloadType').get(async (req, res) => {
    // this report returns as plain text. The report line endings are dependent on not the
  //  runtime platform, but on the requesting platform (99.9999% of the users will be on Windows)
  const userAgent = UserAgentParser(req.headers['user-agent']);
  const windowsTest = /windows/i;
  const NEWLINE = windowsTest.test(userAgent.os.name) ? "\r\n" : "\n";

  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const primaryEstablishmentUid = req.establishment.uid;
  const isParent = req.isParent;

  const ALLOWED_DOWNLOAD_TYPES = ['establishments', 'workers', 'training'];
  const downloadType = req.params.downloadType;

  try {

    let establishments= [], workers = [], training = [];
    if (ALLOWED_DOWNLOAD_TYPES.includes(downloadType)) {

      try {
        const ENTITY_RESTORE_LEVEL=2;
        const myCurrentEstablishments = await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent, ENTITY_RESTORE_LEVEL);
        [establishments, workers, training] = await exportToCsv(NEWLINE, myCurrentEstablishments);

      } catch(err) {
        console.error('router.get(\'/bulkupload/download\').get: failed to restore my establishments and all associated entities (workers, qualifications and training: ', err);
        return res.status(503).send({});
      }


      // before returning the response - upload to S3
      const traceData = true;
      if (traceData) {
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
      console.error(`router.get(\'/bulkupload/download\').get: unexpected download type: ${downloadType}`, downloadType);
      return res.status(400).send({
        message: 'Unexpected download type'
      });
    }

  } catch (err) {
    console.error('router.get(\'/bulkupload/download\').get: error: ', err);
    return res.status(503).send({});
  }

});

module.exports = router;
