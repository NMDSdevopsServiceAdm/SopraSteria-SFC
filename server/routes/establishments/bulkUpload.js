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

router.route('/validate').get(async (req, res) => {

  const bucketName = 'sfcbulkuploadfiles';
  const establishmentId = req.establishmentId;

  const establishmentFileKey = establishmentId + '/' + FileStatusEnum.New + '/' + req.query.establishment;
  const workerFileKey = establishmentId + '/' + FileStatusEnum.New + '/' + req.query.worker;
  const trainingFileKey = establishmentId + '/' + FileStatusEnum.New + '/' + req.query.training;

  await downloadFile(s3, req.query.establishment, bucketName, establishmentFileKey);

  const establishmentCsvFilePath = './' + req.query.establishment;
  const workerCsvFilePath = './' + req.query.establishment;
  const trainingCsvFilePath = './' + req.query.establishment;

  const csvEstablishmentSchemaErrors = [], csvWorkerSchemaErrors = [];
  const myEstablishments = [];
  const myWorkers = [];
  const myTrainings = [];

  try {
    const importedEstablishments = await csv().fromFile(establishmentCsvFilePath);
    const importedWorkers = await csv().fromFile(workerCsvFilePath);
    const importedTraining = await csv().fromFile(trainingCsvFilePath);


    if (Array.isArray(importedEstablishments)) {
      importedEstablishments.forEach((thisLine, currentLineNumber) => {
        console.log(`MN DEBUG - current establishment (${currentLineNumber}: ${thisLine}`);
        const lineValidator = new CsvEstablishmentValidator(thisLine, currentLineNumber);
        if (!lineValidator.validate()) {
          csvEstablishmentSchemaErrors.push(lineValidator.validationErrors);
        } else {
          lineValidator.transform();
        }

        myEstablishments.push(lineValidator);

      });
    }





    //Worker
    if (Array.isArray(importedWorkers)) {
      importedWorkers.forEach((thisLine, currentLineNumber) => {
        console.log(`MN DEBUG - current worker (${currentLineNumber}: ${thisLine}`);
        const lineValidator = new CsvWorkerValidator(thisLine, currentLineNumber);
        if (!lineValidator.validate()) {
          csvWorkerSchemaErrors.push(lineValidator.validationErrors);
        } else {
          lineValidator.transform();
        }

        myWorkers.push(lineValidator);

      });
    }

    if (csvEstablishmentSchemaErrors.length > 0 || csvWorkerSchemaErrors.length > 0) {
      // upload to `establishmentFileKey`.validation.json in S3 bucket
    }


    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(503).send({});
  }
});

async function downloadFile(s3, filePath, bucketName, key) {
    var params = {
      Bucket: bucketName,
      Key: key
    };

    await s3.getObject(params, (err, data) => {
      if (err) { console.error(err); return res.status(503).send(err); }

      fs.writeFileSync(filePath, data.Body.toString());

      console.log(`${filePath} has been created!`);
    });
}


router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  console.log('ok - bulk', establishmentId);
  return res.status(200).send();
});

module.exports = router;
