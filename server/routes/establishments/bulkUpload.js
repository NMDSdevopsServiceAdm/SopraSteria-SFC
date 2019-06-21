const express = require('express');
const appConfig = require('../../config/config');
const AWS = require('aws-sdk');
const fs = require('fs');
const csv = require('csvtojson');
const Stream = require('stream');

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
            uploadedBy: objData.Metadata.username,
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
      uploadedBy: objHeadData.Metadata.username,
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

  const EXPECTED_NUMBHER_OF_FILES = 3;
  if (!uploadedFiles || !Array.isArray(uploadedFiles) || uploadedFiles.length > EXPECTED_NUMBHER_OF_FILES) {
    return res.status(400).send({});
  }

  const signedUrls = [];
  try {
    // drop all in latest
    let listParams = {
      Bucket: appConfig.get('bulkupload.bucketname').toString(), 
      Prefix: `${myEstablishmentId}/latest/`
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

    listParams.Prefix = `${myEstablishmentId}/intermediary/`;
    const intermediaryObjects = await s3.listObjects(listParams).promise();
    intermediaryObjects.Contents.forEach(myFile => {
      deleteKeys.push({
        Key: myFile.Key
      });
    });

    listParams.Prefix = `${myEstablishmentId}/validation/`;
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

    const establishmentRegex = /LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRES/;
    const workerRegex = /LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DI/;
    const trainingRegex = /LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DAT/;
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

console.log("WA DEBUG - why is establishments metadata null: ", myfile.data.substring(0,50))

          if (establishmentRegex.test(myfile.data.substring(0,50))) {
            myDownloads.establishments = myfile.data;
            establishmentMetadata.filename = myfile.filename;
            establishmentMetadata.fileType = 'Establishment';
            establishmentMetadata.userName = myfile.username;
          } else if (workerRegex.test(myfile.data.substring(0,50))) {
            myDownloads.workers = myfile.data;
            workerMetadata.filename = myfile.filename;
            workerMetadata.fileType = 'Worker';
            workerMetadata.userName = myfile.username;
          } else if (trainingRegex.test(myfile.data.substring(0,50))) {
            myDownloads.trainings = myfile.data;
            trainingMetadata.filename = myfile.filename;
            trainingMetadata.fileType = 'Training';
            trainingMetadata.userName = myfile.username;
          }
        })
    }).catch(err => {
        console.error("NM: validate.put", err);
    }) ;

    console.log("WA DEBUG - why is establishments metadata null: ", establishmentMetadata)
    
  
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
      { imported: importedTraining, trainingMetadata: trainingMetadata })

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

async function downloadContent(key) {
    var params = {
      Bucket: appConfig.get('bulkupload.bucketname').toString(),
      Key: key,
    };

    const filenameRegex=/^(.+\/)*(.+)\.(.+)$/; 
    
    try {
      const objData = await s3.getObject(params).promise();
      return {
        data: objData.Body.toString(), 
        filename: key.match(filenameRegex)[2]+ '.' + key.match(filenameRegex)[3],
        username: objData.Metadata.username,
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
    console.log(`${key} has been uploaded!`);

  } catch (err) {
    console.error('api/establishment/bulkupload/uploadFile: ', err);
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
      myAPIEstablishments[currentLineNumber] = thisApiEstablishment;
    } else {
      const errors = thisApiEstablishment.errors;
      const warnings = thisApiEstablishment.warnings;

      lineValidator.addAPIValidations(errors, warnings);

      if (errors.length === 0) {
        //console.log("WA DEBUG - this establishment entity: ", JSON.stringify(thisApiEstablishment.toJSON(), null, 2));
        myAPIEstablishments[currentLineNumber] = thisApiEstablishment;
      } else {
        // TODO - remove this when capacities and services are fixed; temporarily adding establishments even though they're in error (because service/capacity validations put all in error)
        myAPIEstablishments[currentLineNumber] = thisApiEstablishment;
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
console.log("WA DEBUG - validateBulkUploadFiles - estabishment metadata: ", establishments.establishmentMetadata)


  if (Array.isArray(establishments.imported) && establishments.imported.length > 0 && establishments.establishmentMetadata.fileType == "Establishment") {
    await Promise.all(
      establishments.imported.map((thisLine, currentLineNumber) => {
        return _validateEstablishmentCsv(thisLine, currentLineNumber+2, csvEstablishmentSchemaErrors, myEstablishments, myAPIEstablishments);
      }) 
    );

    // having parsed all establishments, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'LOCALESTID` as property name
    myEstablishments.forEach(thisEstablishment => {
      const keyNoWhitespace = thisEstablishment.localId.replace(/\s/g, "");
      if (allEstablishmentsByKey[keyNoWhitespace]) {
        // this establishment is a duplicate
        csvEstablishmentSchemaErrors.push(thisEstablishment.addDuplicate(allEstablishmentsByKey[keyNoWhitespace]));

        // remove the entity
        delete myAPIEstablishments[thisEstablishment.lineNumber];
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
  establishments.establishmentMetadata.errors = csvEstablishmentSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  establishments.establishmentMetadata.warnings = csvEstablishmentSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

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
        const establishmentKeyNoWhitespace = thisWorker.local.replace(/\s/g, "");
        if (!allEstablishmentsByKey[establishmentKeyNoWhitespace]) {
          // not found the associated establishment
          csvWorkerSchemaErrors.push(thisWorker.uncheckedEstablishment());
  
          // remove the entity
          delete myAPIWorkers[thisWorker.lineNumber];
        } else {
          // this worker is unique and can be associated to establishment
          allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;

          // associate this worker to the known establishment
          const workerKey = thisWorker.uniqueWorker.replace(/\s/g, "");
          const foundEstablishmentByLineNumber = allEstablishmentsByKey[establishmentKeyNoWhitespace];
          const knownEstablishment = foundEstablishmentByLineNumber ? myAPIEstablishments[foundEstablishmentByLineNumber] : null;
          if (knownEstablishment) {
            knownEstablishment.associateWorker(workerKey, myAPIWorkers[thisWorker.lineNumber]);
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
  workers.workerMetadata.errors = csvWorkerSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  workers.workerMetadata.warnings = csvWorkerSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  // parse and process Training CSV
  if (Array.isArray(training.imported) && training.imported.length > 0 && training.trainingMetadata.fileType == "Training") {
    await Promise.all(
      training.imported.map((thisLine, currentLineNumber) => {
        return _validateTrainingCsv(thisLine, currentLineNumber=2, csvTrainingSchemaErrors, myTrainings, myAPITrainings);
      }) 
    );

    // note - there is no uniqueness test for a training record

    // having parsed all establishments, workers and training, need to cross-check all training records' establishment reference (LOCALESTID) against all parsed establishments
    // having parsed all establishments, workers and training, need to cross-check all training records' worker reference (UNIQUEWORKERID) against all parsed workers
    myTrainings.forEach(thisTraingRecord => {
      const establishmentKeyNoWhitespace = thisTraingRecord.localeStId.replace(/\s/g, "");
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
        if (knownWorker) {
          knownWorker.associateTraining(myAPITrainings[thisTraingRecord.lineNumber]);
        } else {
          // this should never happen
          console.error(`FATAL: failed to associate worker (line number: ${thisWorker.lineNumber}/unique id (${thisWorker.uniqueWorker})) with a known establishment.`);
        }

      }
    });
    
  } else {
      console.info("API bulkupload - validateBulkUploadFiles: no training records");
      status = false;
  }
  training.trainingMetadata.records = myTrainings.length;
  training.trainingMetadata.errors = csvTrainingSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  training.trainingMetadata.warnings = csvTrainingSchemaErrors.filter(thisError => 'warnCode' in thisError).length;

  // prepare entities ready for upload/return
  const establishmentsAsArray = Object.values(myAPIEstablishments);
  const workersAsArray = Object.values(myAPIWorkers);
  const trainingAsArray = Object.values(myAPITrainings);
  const qualificationsAsArray = Object.values(myAPIQualifications);

  // prepare the validation difference report which highlights all new, updated and deleted establishments and workers
  const myCurrentEstablishments = await restoreExistingEntities(username, establishmentId, isParent);
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
    s3UploadPromises.push(uploadAsJSON(username, establishmentId, csvEstablishmentSchemaErrors, `${establishmentId}/validation/${establishments.establishmentMetadata.filename}.validation.json`));
    s3UploadPromises.push(uploadAsJSON(username, establishmentId, csvWorkerSchemaErrors, `${establishmentId}/validation/${workers.workerMetadata.filename}.validation.json`));
    s3UploadPromises.push(uploadAsJSON(username, establishmentId, csvTrainingSchemaErrors, `${establishmentId}/validation/${training.trainingMetadata.filename}.validation.json`));
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
const restoreExistingEntities = async (loggedInUsername, primaryEstablishmentId, isParent) => {
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
    restoreEntityPromises.push(primaryEstablishment.restore(myEstablishments.primary.uid, false, true));

    if (myEstablishments.subsidaries && myEstablishments.subsidaries.establishments && Array.isArray(myEstablishments.subsidaries.establishments)) {
      myEstablishments.subsidaries.establishments.forEach(thisSubsidairy => {
        const newSub = new EstablishmentEntity(loggedInUsername);
        currentEntities.push(newSub);
        restoreEntityPromises.push(newSub.restore(thisSubsidairy.uid, false, true));
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
    const foundCurrentEstablishment = currentEntities.find(thisCurrentEstablishment => thisCurrentEstablishment.name === thisOnloadEstablishment.name);
    if (foundCurrentEstablishment) {
      // for updated establishments, need to cross check the set of onload and current workers to identify the new, updated and deleted workers
      const currentWorkers = foundCurrentEstablishment.associatedWorkers;
      const onloadWorkers = thisOnloadEstablishment.associatedWorkers;
      const newWorkers = [], updatedWorkers = [], deletedWorkers = [];

      console.log("WA DEBUG - onload workers: ". onloadWorkers)

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

        if (foundWorker) {
          deletedWorkers.push({
            nameOrId: thisCurrentWorker
          });
        }
      });

      // TODO - without LOCAL_IDENTIFIER, matches are performed using the name of the establishment
      updatedEntities.push({
        name: thisOnloadEstablishment.name,
        workers: {
          new: newWorkers,
          updated: updatedWorkers,
          deleted: deletedWorkers
        }
      });
    } else {
      // TODO - without LOCAL_IDENTIFIER, matches are performed using the name of the establishment
      newEntities.push({
        name: thisOnloadEstablishment.name,
      });
    }
  });

  // determine the delete establishments, by reference the current set against the onload set
  currentEntities.forEach(thisCurrentEstablishment => {
    if (thisCurrentEstablishment.id !== primaryEstablishmentId) {
      // find a match for this establishment
      // TODO - without LOCAL_IDENTIFIER, matches are performed using the name of the establishment
      const foundOnloadEstablishment = onloadEntities.find(thisOnloadEstablishment => thisCurrentEstablishment.name === thisOnloadEstablishment.name);

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
    readable.push(`${errorPadding}\n${errorTitle}\n${errorPadding}\n\n`);

    errorsAndWarnings
      .reduce((acc, val) => acc.concat(val), [])
      .filter(msg => msg.errCode && msg.errType)
      .sort((a,b) => a.errCode - b.errCode)
      .map(item => readable.push(`${item.origin} - ${item.error}, ${item.errCode} on line ${item.lineNumber}\n`));
    
    const warningTitle = '* Warnings (files will be accepted but data is incomplete or internally inconsistent) *';
    const warningPadding = '*'.padStart(warningTitle.length, '*');
    readable.push(`\n${warningPadding}\n${warningTitle}\n${warningPadding}\n\n`);
    
    errorsAndWarnings
      .reduce((acc, val) => acc.concat(val), [])
      .filter(msg => msg.warnCode && msg.warnType)
      .sort((a,b) => a.warnCode - b.warnCode)
      .map(item => readable.push(`${item.origin} - ${item.warning}, ${item.warnCode} on line ${item.lineNumber}\n`));

    const laTitle = '* You are sharing data with the following Local Authorities *';
    const laPadding = '*'.padStart(laTitle.length, '*');
    readable.push(`\n${laPadding}\n${laTitle}\n${laPadding}\n\n`);

    entities ? entities
      .map(en => en.localAuthorities !== undefined ? en.localAuthorities : [])
      .reduce((acc, val) => acc.concat(val), [])
      .sort((a,b) => a.name > b.name)
      .map(item => readable.push(`${item.name}\n`)) : true;
    
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
  const isParent = req.isParent;

  // TODO: add traps to prevent completing without having ensure validation and just warnings not errors

  try {
    // completing bulk upload must always work on the current set of known entities and not rely
    //  on any aspect of the current entities at the time of validation; there may be minutes/hours
    //  validating a bulk upload and completing it.
    const myCurrentEstablishments = await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent);

    try {
      const onloadEstablishments = await restoreOnloadEntities(theLoggedInUser, primaryEstablishmentId);

      // having the set of onload and current entities, work through the onload entities creating the validation difference report
      const report = validationDifferenceReport(primaryEstablishmentId, onloadEstablishments, myCurrentEstablishments);

      return res.status(200).send({
        report,
        current: myCurrentEstablishments.map(thisEstablishment => thisEstablishment.toJSON(false,false,false,false,true,null,true)),
        validated: onloadEstablishments.map(thisEstablishment => thisEstablishment.toJSON(false,false,false,false,true,null,true)),
      });
  
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


module.exports = router;
