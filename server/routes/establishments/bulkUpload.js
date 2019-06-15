const express = require('express');
const appConfig = require('../../config/config');
const AWS = require('aws-sdk');
const fs = require('fs');
const csv = require('csvtojson');

const router = express.Router();
const s3 = new AWS.S3({
  accessKeyId: appConfig.get('bulkuploaduser.accessKeyId').toString(),
  secretAccessKey: appConfig.get('bulkuploaduser.secretAccessKey').toString(),
  region: appConfig.get('bulkuploaduser.region').toString(),
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
  
const FileValidationStatusEnum = { "Pending": "pending", "Validating": "validating", "Pass": "pass", "PassWithWarnings": "pass with warnings", "Fail": "fail" };

const ignoreMetaDataObjects = /.*metadata.json$/;
const ignoreRoot = /.*\/$/;

router.route('/uploaded').get(async (req, res) => {
  try {
    const params = {
      Bucket: appConfig.get('bulkuploaduser.bucketname').toString(), 
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
    Bucket: appConfig.get('bulkuploaduser.bucketname').toString(), 
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
        Bucket: appConfig.get('bulkuploaduser.bucketname').toString(),
        Key: requestedKey,
        Expires: appConfig.get('bulkuploaduser.uploadSignedUrlExpire')
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
  if (!uploadedFiles || !Array.isArray(uploadedFiles) || uploadedFiles.length != EXPECTED_NUMBHER_OF_FILES) {
    return res.status(400).send({});
  }

  const signedUrls = [];
  try {
    // drop all in latest
    let listParams = {
      Bucket: appConfig.get('bulkuploaduser.bucketname').toString(), 
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
        Bucket: appConfig.get('bulkuploaduser.bucketname').toString(), 
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
          Bucket: appConfig.get('bulkuploaduser.bucketname').toString(),
          Key: myEstablishmentId + '/' + FileStatusEnum.Latest + '/' + thisFile.filename,
          // ACL: 'public-read',
          ContentType: req.query.type,
          Metadata: {
            username,
            establishmentId: myEstablishmentId,
            validationstatus: FileValidationStatusEnum.Pending,
          },
          Expires: appConfig.get('bulkuploaduser.uploadSignedUrlExpire'),
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
      Bucket: appConfig.get('bulkuploaduser.bucketname').toString(),
      Key: establishmentId + '/' + FileStatusEnum.Latest + '/' + req.query.filename,
      // ACL: 'public-read',
      ContentType: req.query.type,
      Metadata: {
        username,
        establishmentId: myEstablishmentId,
        validationstatus: FileValidationStatusEnum.Pending,
      },
      Expires: appConfig.get('bulkuploaduser.uploadSignedUrlExpire'),
    });
    res.json({ urls: uploadPreSignedUrl });
    res.end();
  }
  catch (err) {
    console.error('establishment::bulkupload GET/:PreSigned - failed', err.message);
    return res.status(503).send();
  }
});

// Happy path
//Concern in download files to local folder; if many user download, or we stream 
//User case0; create 3 files with known sample data for establishment, worker
//Use case 1: Accept three filenames and make a key default to New
//Use case 2: First validation, must be three filename, unless do revalidation
//User case3: in case of fail or re validation, always run full on 3 files.
//Use case4: search new in s3 and retrieve file
//Use case 5: run validation on schema or pattern to make sure they are indeed establishment, worker and trainning csv
//Use case 6: field mapping
//Use case7: BUDI mapping
//user case7: LI mapping
//Use case8 : make an api call
//user case9: return list of error


// FOR NASIR:
//  2. If using a POST or PATCH, can pass data as JSON BODY
//  7. This current approach to validation is "very synchronous"; there is lots we can do yet to optimise this - but we optimise later once we have the process working.
router.route('/validate').put(async (req, res) => {
  const establishmentId = req.establishmentId;
  const username = req.username;
  const myDownloads = {};
  const establishmentMetadata = new MetaData();
  const workerMetadata = new MetaData();
  const trainingMetadata = new MetaData();
  
  try {
    // awaits must be within a try/catch block - checking if file exists - saves having to repeatedly download from S3 bucket
    const params = {
      Bucket: appConfig.get('bulkuploaduser.bucketname').toString(), 
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
  
    const importedEstablishments = myDownloads.establishments ? await csv().fromString(myDownloads.establishments) : null;
    const importedWorkers = myDownloads.workers ? await csv().fromString(myDownloads.workers) :  null;
    const importedTraining = myDownloads.trainings ? await csv().fromString(myDownloads.trainings) : null;

    const validationResponse = await validateBulkUploadFiles(
      true,
      username,
      establishmentId,
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
      { imported: importedEstablishments, establishmentMetadata: establishmentMetadata  },
      { imported: importedWorkers, workerMetadata: workerMetadata },
      { imported: importedTraining, trainingMetadata: trainingMetadata })

    // handle parsing errors
    if (!validationResponse.status) {
      return res.status(400).send({
        establishments: {
          filename: null,
          errors: validationResponse.validation.establishments
            .filter(thisVal => thisVal.hasOwnProperty('errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.establishments
            .filter(thisVal => thisVal.hasOwnProperty('warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          records: 0,
          data: {
            csv: validationResponse.data.csv.establishments,
            entities: validationResponse.data.entities.establishments,
          },
        },
        workers: {
          filename: null,
          errors: validationResponse.validation.workers
            .filter(thisVal => thisVal.hasOwnProperty('errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.workers
            .filter(thisVal => thisVal.hasOwnProperty('warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          records: 0,
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
          errors: validationResponse.validation.training
            .filter(thisVal => thisVal.hasOwnProperty('errCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          warnings: validationResponse.validation.training
            .filter(thisVal => thisVal.hasOwnProperty('warnCode'))
            .sort((thisVal, thatVal) => thisVal.lineNumber > thatVal.lineNumber),
          records: 0,
          data: {
            csv: validationResponse.data.csv.training,
            entities: validationResponse.data.entities.training,
          },
        },
      });

    } else {
      return res.status(200).send({
        establishment: validationResponse.data.establishments,
        workers: validationResponse.data.workers,
        training: validationResponse.data.training,
      });
    }

  } catch (err) {
      console.error(err);
      return res.status(503).send({});
  }
});

async function downloadContent(key) {
    var params = {
      Bucket: appConfig.get('bulkuploaduser.bucketname').toString(),
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
      console.error('api/establishment/bulkupload/downloadFile: ', err);
      throw new Error(`Failed to download S3 object: ${key}`);
    }
}

async function uploadAsJSON(username, establishmentId, content, key) {
  const myEstablishmentId = Number.isInteger(establishmentId) ? establishmentId.toString() : establishmentId;

  var params = {
    Bucket: appConfig.get('bulkuploaduser.bucketname').toString(),
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
    console.log(`${key} has been uploaded!`, objData);

  } catch (err) {
    console.error('api/establishment/bulkupload/uploadFile: ', err);
    throw new Error(`Failed to upload S3 object: ${key}`);
  }
}


const _appendApiErrorsAndWarnings = (lineValidator, errors, warnings) => {

  errors.forEach(thisError => {
    thisError.properties ? thisError.properties.forEach(thisProp => {
      lineValidator.validationErrors.push({
        lineNumber: lineValidator.lineNumber,
        errCode: thisError.code,
        errType: "TBC",
        error: thisError.message,
        source: thisProp
      });  
    }) : true;
  });

  warnings.forEach(thisWarning => {
    thisWarning.properties ? thisWarning.properties.forEach(thisProp => {
      lineValidator.validationErrors.push({
        lineNumber: lineValidator.lineNumber,
        warnCode: thisWarning.code,
        warnType: "TBC",
        warning: thisWarning.message,
        source: thisProp
      });
    }) : true;
  });

};

const _validateEstablishmentCsv = async (thisLine, currentLineNumber, csvEstablishmentSchemaErrors, myEstablishments, myAPIEstablishments) => {
  const lineValidator = new CsvEstablishmentValidator(thisLine, currentLineNumber+2);   // +2 because the first row is CSV headers, and forEach counter is zero index

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
      thisEstablishmentAsAPI.IsCQCRegulated,
      'A0000000000'       // TODO: remove this once Establishment::initialise is resolving NDMS ID based on given postcode
      );
  
    await thisApiEstablishment.load(thisEstablishmentAsAPI);

    const isValid = thisApiEstablishment.validate();

    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      //console.log("WA DEBUG - this establishment entity: ", JSON.stringify(thisApiEstablishment.toJSON(), null, 2));
      myAPIEstablishments.push(thisApiEstablishment);
    } else {
      const errors = thisApiEstablishment.errors;
      const warnings = thisApiEstablishment.warnings;

      //_appendApiErrorsAndWarnings(lineValidator, errors, warnings);
      lineValidator.addAPIValidations(errors, warnings);

      if (errors.length === 0) {
        //console.log("WA DEBUG - this establishment entity: ", JSON.stringify(thisApiEstablishment.toJSON(), null, 2));
        myAPIEstablishments.push(thisApiEstablishment);
      } else {
        // TODO - remove this when capacities and services are fixed; temporarily adding establishments even though they're in error (because service/capacity validations put all in error)
        myAPIEstablishments.push(thisApiEstablishment);
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

const _loadWorkerQualifications = async (lineValidator, thisQual, myAPIQualifications) => {
  const thisApiQualification = new QualificationEntity();
  await thisApiQualification.load(thisQual);
  // console.log("WA DEBUG - this qualification entity: ", JSON.stringify(thisApiQualification.toJSON(), null, 2));

  const isValid = thisApiQualification.validate();

  if (isValid) {
    // no validation errors in the entity itself, so add it ready for completion
    // console.log("WA DEBUG - this qualification entity: ", JSON.stringify(thisApiQualification.toJSON(), null, 2));
    myAPIQualifications.push(thisApiQualification);
  } else {
    const errors = thisApiQualification.errors;
    const warnings = thisApiQualification.warnings;

    _appendApiErrorsAndWarnings(lineValidator, errors, warnings);

    if (errors.length === 0) {
      // console.log("WA DEBUG - this qualification entity: ", JSON.stringify(thisApiQualification.toJSON(), null, 2));
      myAPIQualifications.push(thisApiQualification);
    }
  }
};

const _validateWorkerCsv = async (thisLine, currentLineNumber, csvWorkerSchemaErrors, myWorkers, myAPIWorkers, myAPIQualifications) => {
  const lineValidator = new CsvWorkerValidator(thisLine, currentLineNumber+2);   // +2 because the first row is CSV headers, and forEach counter is zero index

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
      myAPIWorkers.push(thisApiWorker);
    } else {
      const errors = thisApiWorker.errors;
      const warnings = thisApiWorker.warnings;

      _appendApiErrorsAndWarnings(lineValidator, errors, warnings);
  
      if (errors.length === 0) {
        //console.log("WA DEBUG - this worker entity: ", JSON.stringify(thisApiWorker.toJSON(), null, 2));
        myAPIWorkers.push(thisApiWorker);
      }
    }

    // construct Qualification entities (can be multiple of a single Worker record) - regardless of whether the
    //  Worker is valid or not; we need to return as many errors/warnings in one go as possible
    const thisQualificationAsAPI = lineValidator.toQualificationAPI();
    await Promise.all(
      thisQualificationAsAPI.map((thisQual) => {
        return _loadWorkerQualifications(lineValidator, thisQual, myAPIQualifications);
      }) 
    );  
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
  const lineValidator = new CsvTrainingValidator(thisLine, currentLineNumber+2);   // +2 because the first row is CSV headers, and forEach counter is zero index

  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  lineValidator.validate();
  lineValidator.transform();

  const thisTrainingAsAPI = lineValidator.toAPI();
  const thisApiTraining = new TrainingEntity();
  try {
    await thisApiTraining.load(thisTrainingAsAPI);

    const isValid = thisApiTraining.validate();
    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      // console.log("WA DEBUG - this training entity: ", JSON.stringify(thisApiTraining.toJSON(), null, 2));
      myAPITrainings.push(thisApiTraining);
    } else {
      const errors = thisApiTraining.errors;
      const warnings = thisApiTraining.warnings;

      _appendApiErrorsAndWarnings(lineValidator, errors, warnings);
  
      if (errors.length === 0) {
        // console.log("WA DEBUG - this training entity: ", JSON.stringify(thisApiTraining.toJSON(), null, 2));
        myAPITrainings.push(thisApiTraining);
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
const validateBulkUploadFiles = async (commit, username , establishmentId, establishments, workers, training) => {
  let status = true;
  const csvEstablishmentSchemaErrors = [], csvWorkerSchemaErrors = [], csvTrainingSchemaErrors = [];
  const myEstablishments = [], myWorkers = [], myTrainings = [];
  const myAPIEstablishments = [], myAPIWorkers = [], myAPITrainings = [], myAPIQualifications = [];
  
  let establishmentRecords=0; let workerRecords=0; let trainingRecords=0;

  // for unique/cross-reference validations
  const allEstablishmentsByKey = {}; const allWorkersByKey = {};

  // parse and process Establishments CSV
  if (Array.isArray(establishments.imported) && establishments.imported.length > 0 && establishments.establishmentMetadata.fileType == "Establishment") {
    await Promise.all(
      establishments.imported.map((thisLine, currentLineNumber) => {
        return _validateEstablishmentCsv(thisLine, currentLineNumber, csvEstablishmentSchemaErrors, myEstablishments, myAPIEstablishments);
      }) 
    );

    // having parsed all establishments, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'LOCALESTID`as property name
    myEstablishments.forEach(thisEstablishment => {
      const keyNoWhitespace = thisEstablishment.localId.replace(/\s/g, "");
      if (allEstablishmentsByKey[keyNoWhitespace]) {
        // this establishment is a duplicate
        console.log("WA| DEBUG - duplicate establishment: ", thisEstablishment.lineNumber)
        csvEstablishmentSchemaErrors.push(thisEstablishment.addDuplicate(allEstablishmentsByKey[keyNoWhitespace]));
      } else {
        // does not yet exist
        allEstablishmentsByKey[keyNoWhitespace] = thisEstablishment.lineNumber;
      }
    });
    console.log("WA DEBUG - all known establishments: ", allEstablishmentsByKey)

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
        return _validateWorkerCsv(thisLine, currentLineNumber, csvWorkerSchemaErrors, myWorkers, myAPIWorkers, myAPIQualifications);
      }) 
    );

    // having parsed all workers, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'UNIQUEWORKERID`as property name
    myWorkers.forEach(thisWorker => {
      const keyNoWhitespace = thisWorker.uniqueWorker.replace(/\s/g, "");
      if (allWorkersByKey[keyNoWhitespace]) {
        // this worker is a duplicate
        csvWorkerSchemaErrors.push(thisWorker.addDuplicate(allWorkersByKey[keyNoWhitespace]));
      } else {
        // does not yet exist
        allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;
      }
    });

    // having parsed all establishments and workers, need to cross-check all workers' establishment reference (LOCALESTID) against all parsed establishments
    myWorkers.forEach(thisWorker => {
      const keyNoWhitespace = thisWorker.local.replace(/\s/g, "");
      if (!allEstablishmentsByKey[keyNoWhitespace]) {
        // not found the associated establishment
        csvWorkerSchemaErrors.push(thisWorker.uncheckedEstablishment());
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
        return _validateTrainingCsv(thisLine, currentLineNumber, csvTrainingSchemaErrors, myTrainings, myAPITrainings);
      }) 
    );

    // note - there is no uniqueness test for a training record

    // having parsed all establishments, workers and training, need to cross-check all training records' establishment reference (LOCALESTID) against all parsed establishments
    // having parsed all establishments, workers and training, need to cross-check all training records' worker reference (UNIQUEWORKERID) against all parsed workers
    myTrainings.forEach(thisTraingRecord => {
      const establishmentKeyNoWhitespace = thisTraingRecord.localeStId.replace(/\s/g, "");
      const workerKeyNoWhitespace = thisTraingRecord.uniqueWorkerId.replace(/\s/g, "");

      if (!allEstablishmentsByKey[establishmentKeyNoWhitespace]) {
        // not found the associated establishment
        csvTrainingSchemaErrors.push(thisTraingRecord.uncheckedEstablishment());
      }
      if (!allWorkersByKey[workerKeyNoWhitespace]) {
        // not found the associated worker
        csvTrainingSchemaErrors.push(thisTraingRecord.uncheckedWorker());
      }
    });
    
  } else {
      console.info("API bulkupload - validateBulkUploadFiles: no training records");
      status = false;
  }
  training.trainingMetadata.records = myTrainings.length;
  training.trainingMetadata.errors = csvTrainingSchemaErrors.filter(thisError => 'errCode' in thisError).length;
  training.trainingMetadata.warnings = csvTrainingSchemaErrors.filter(thisError => 'warnCode' in thisError).length;


  // upload the validated metadata as JSON to S3
  establishments.imported && commit ? await uploadAsJSON(username, establishmentId, establishments.establishmentMetadata, `${establishmentId}/latest/${establishments.establishmentMetadata.filename}.metadata.json`) : true;
  workers.imported && commit ? await uploadAsJSON(username, establishmentId, workers.workerMetadata, `${establishmentId}/latest/${workers.workerMetadata.filename}.metadata.json`) : true;
  training.imported && commit ? await uploadAsJSON(username, establishmentId, training.trainingMetadata, `${establishmentId}/latest/${training.trainingMetadata.filename}.metadata.json`) : true;

  // upload the converted CSV as JSON to S3
  myEstablishments.length > 0 && commit ? await uploadAsJSON(username, establishmentId, myEstablishments.map(thisEstablishment => thisEstablishment.toJSON()), `${establishmentId}/intermediary/${establishments.establishmentMetadata.filename}.csv.json`) : true;
  myWorkers.length > 0 && commit ? await uploadAsJSON(username, establishmentId, myWorkers.map(thisEstablishment => thisEstablishment.toJSON()), `${establishmentId}/intermediary/${workers.workerMetadata.filename}.csv.json`) : true;
  myTrainings.length > 0 && commit ? await uploadAsJSON(username, establishmentId, myTrainings.map(thisEstablishment => thisEstablishment.toJSON()), `${establishmentId}/intermediary/${training.trainingMetadata.filename}.csv.json`) : true;

  // upload the intermediary entities as JSON to S3
  myAPIEstablishments.length > 0 && commit ? await uploadAsJSON(username, establishmentId, myAPIEstablishments.map(thisEstablishment => thisEstablishment.toJSON()), `${establishmentId}/intermediary/establishment.entities.json`) : true;
  myAPIWorkers.length > 0 && commit ? await uploadAsJSON(username, establishmentId, myAPIWorkers.map(thisWorker => thisWorker.toJSON()), `${establishmentId}/intermediary/worker.entities.json`) : true;
  myAPITrainings.length > 0 && commit ? await uploadAsJSON(username, establishmentId, myAPITrainings.map(thisTraining => thisTraining.toJSON()), `${establishmentId}/intermediary/training.entities.json`) : true;
  myAPIQualifications.length > 0 && commit ? await uploadAsJSON(username, establishmentId, myAPIQualifications.map(thisQualification => thisQualification.toJSON()), `${establishmentId}/intermediary/qualification.entities.json`) : true;
  
  // handle parsing errors
  if (csvEstablishmentSchemaErrors.length > 0 || csvWorkerSchemaErrors.length > 0 || csvTrainingSchemaErrors.length > 0) {
    //console.error('WA DEBUG Establishment validation errors: ', csvEstablishmentSchemaErrors)
    //console.error('NM DEBUG Worker validation errors: ', csvWorkerSchemaErrors)
    //console.error('NM DEBUG Training validation errors: ', csvTrainingSchemaErrors)

    // upload the validation to S3
    commit ? await uploadAsJSON(username, establishmentId, csvEstablishmentSchemaErrors, `${establishmentId}/validation/${establishments.establishmentMetadata.filename}.validation.json`) : true;
    commit ? await uploadAsJSON(username, establishmentId, csvWorkerSchemaErrors, `${establishmentId}/validation/${workers.workerMetadata.filename}.validation.json`) : true;
    commit ? await uploadAsJSON(username, establishmentId, csvTrainingSchemaErrors, `${establishmentId}/validation/${training.trainingMetadata.filename}.validation.json`) : true;

    status = false;
  }

   //upload metadata as json, by filename+metadata.json

  return {
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
        establishments: myAPIEstablishments.map(thisEstablishment => thisEstablishment.toJSON()),
        workers: myAPIWorkers.map(thisWorker => thisWorker.toJSON()),
        training: myAPITrainings.map(thisTraining => thisTraining.toJSON()),
        qualifications: myAPIQualifications.map(thisQualification => thisQualification.toJSON()),
      }
    }
  }
};


router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  console.log('ok - bulk', establishmentId);
  return res.status(501).send({});
});

module.exports = router;
