const express = require('express');
const appConfig = require('../../config/config');
const router = express.Router();
const AWS = require('aws-sdk');
const urlTimeOut = 300;
const fs = require('fs');
const csv = require('csvtojson');

var s3 = new AWS.S3({
  accessKeyId: appConfig.get('bulkuploaduser.accessKeyId').toString(),
  secretAccessKey: appConfig.get('bulkuploaduser.secretAccessKey').toString(),
  region: 'eu-west-2',
  useAccelerateEndpoint: true,
});

const CsvEstablishmentValidator = require('../../models/BulkImport/csv/establishments').Establishment;
const CsvWorkerValidator = require('../../models/BulkImport/csv/workers').Worker;
const CsvTrainingValidator = require('../../models/BulkImport/csv/training').Training;
  
var FileStatusEnum = { "New": "new", "Validated": "validated", "Imported": "imported" };
var FileValidationStatusEnum = { "Pending": "pending", "Validating": "validating", "Pass": "pass", "PassWithWarnings": "pass with warnings", "Fail": "fail" };

router.route('/signedUrl').get(async function (req, res) {
  const establishmentId = req.establishmentId;

  var s3 = new AWS.S3({
    accessKeyId: appConfig.get('bulkuploaduser.accessKeyId').toString(),
    secretAccessKey: appConfig.get('bulkuploaduser.secretAccessKey').toString(),
    region: 'eu-west-2',
    useAccelerateEndpoint: true,
  });

  try {
    var uploadPreSignedUrl = s3.getSignedUrl('putObject', {
      Bucket: appConfig.get('bulkuploaduser.bucketname').toString(),
      Key: establishmentId + '/' + FileStatusEnum.New + '/' + req.query.filename,
      // ACL: 'public-read',
      ContentType: req.query.type,
      Metadata: {
        username: '',
        establishmentid: establishmentId.toString(),
        validationstatus: FileValidationStatusEnum.Pending
      },
      Expires: urlTimeOut, // 5 minutes
    });
    res.json({ urls: uploadPreSignedUrl });
    res.end();
  }
  catch (err) {
    console.error('establishment::bulkupload GET/:PreSigned - failed', err.message);
    return res.status(503).send();
  }
});

//Key 214/new/Workbook1.csv
//buc sfcbulkuploadfiles

//TODO: from front end it has to be 3 file names, i have to build the path

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
//  1. Why a get?
//  2. If using a POST or PATCH, can pass data as JSON BODY
//  3. Bucker name should be config parameter. region should be config parameter
//  4. Why is use accelerated endpoint true when creating S3 object?
//  5. Downloading to file and then CSV from file is not efficient; should look to sharing a buffer/stream - but then again, these files are not going to be big (20MB is not a big file so load into memory!)
//  6. As downloading to file, need to tidy up the local files.
//  7. This current approach to validation is "very synchronous"; there is lots we can do yet to optimise this - but we optimise later once we have the process working.
router.route('/validate').get(async (req, res) => {

  const bucketName = 'sfcbulkuploadfiles';
  const establishmentId = req.establishmentId;

  const establishmentCsvFilePath = './' + req.query.establishment;
  const workerCsvFilePath = './' + req.query.worker;
  const trainingCsvFilePath = './' + req.query.training;

  const establishmentFileKey = establishmentId + '/' + FileStatusEnum.New + '/' + req.query.establishment;
  const workerFileKey = establishmentId + '/' + FileStatusEnum.New + '/' + req.query.worker;
  const trainingFileKey = establishmentId + '/' + FileStatusEnum.New + '/' + req.query.training;

  const csvEstablishmentSchemaErrors = [], csvWorkerSchemaErrors = [], csvTrainingSchemaErrors = [];;
  const myEstablishments = [];
  const myWorkers = [];
  const myTrainings = [];

  try {
    // awaits must be within a try/catch block - checking if file exists - saves having to repeatedly download from S3 bucket
    !fs.existsSync(establishmentCsvFilePath) ? await downloadFile(s3, establishmentCsvFilePath, bucketName, establishmentFileKey) : true;
    !fs.existsSync(workerCsvFilePath) ? await downloadFile(s3, workerCsvFilePath, bucketName, workerFileKey) : true;
    !fs.existsSync(trainingCsvFilePath) ? await downloadFile(s3, trainingCsvFilePath, bucketName, trainingFileKey) : true;
  
    const importedEstablishments = await csv().fromFile(establishmentCsvFilePath);
    const importedWorkers = await csv().fromFile(workerCsvFilePath);
    const importedTraining = await csv().fromFile(trainingCsvFilePath);

    // parse and process Establishments CSV
    if (Array.isArray(importedEstablishments)) {
      importedEstablishments.forEach((thisLine, currentLineNumber) => {
        const lineValidator = new CsvEstablishmentValidator(thisLine, currentLineNumber);

        // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
        lineValidator.validate();
        lineValidator.transform();

        // TODO - not sure this is necessary yet - we can just iterate the collection of Establishments at the end to create the validation JSON document
        if (lineValidator.validationErrors.length > 0) {
          csvEstablishmentSchemaErrors.push(lineValidator.validationErrors);
        }

        myEstablishments.push(lineValidator);
      });
    }

    // parse and process Workers CSV
    if (Array.isArray(importedWorkers)) {
      importedWorkers.forEach((thisLine, currentLineNumber) => {
        const lineValidator = new CsvWorkerValidator(thisLine, currentLineNumber);

        // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
        lineValidator.validate();
        lineValidator.transform();

        if (lineValidator.validationErrors.length > 0) {
          csvWorkerSchemaErrors.push(lineValidator.validationErrors);
        }

        myWorkers.push(lineValidator);
      });
    }

    // parse and process Training CSV
    if (Array.isArray(importedTraining)) {
      importedTraining.forEach((thisLine, currentLineNumber) => {
        const lineValidator = new CsvTrainingValidator(thisLine, currentLineNumber);

        // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
        lineValidator.validate();
        lineValidator.transform();

        if (lineValidator.validationErrors.length > 0) {
          csvTrainingSchemaErrors.push(lineValidator.validationErrors);
        }

        myTrainings.push(lineValidator);
      });
    }

    // TODO: we have still got to transform/load the establishments, workers/qualifications and training records through the API (model classes yet)
    //       which may yet incur more validation errors - but that is a separate ticket.

    // handle parsing errors
    if (csvEstablishmentSchemaErrors.length > 0 || csvWorkerSchemaErrors.length > 0) {
      // upload to `establishmentFileKey`.validation.json in S3 bucket
      console.error('WA DEBUG Establishment validation errors: ', csvEstablishmentSchemaErrors)
      console.error('NM DEBUG Worker validation errors: ', csvWorkerSchemaErrors)

      return res.status(400).send({});

    } else {
      return res.status(200).send({});
    }

  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

async function downloadFile(s3, filePath, bucketName, key) {
    var params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      const objData = await s3.getObject(params).promise();
      fs.writeFileSync(filePath, objData.Body.toString());
      console.log(`${filePath} has been created!`);

    } catch (err) {
      console.error('api/establishment/bulkupload/downloadFile: ', err);
      throw new Error(`Failed to download S3 object: ${key}`);
    }
}

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  console.log('ok - bulk', establishmentId);
  return res.status(501).send({});
});

module.exports = router;
