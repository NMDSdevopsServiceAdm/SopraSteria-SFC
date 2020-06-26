const AWS = require('aws-sdk');
const config = require('../config/config');
const models = require('../models/');
const uuid = require('uuid');
const s3 = new AWS.S3({
  region: String(config.get('bulkupload.region')),
});
const Bucket = String(config.get('bulkupload.bucketname'));

// Prevent multiple report requests from being ongoing simultaneously so we can store what was previously the http responses in the S3 bucket
// This function can't be an express middleware as it needs to run both before and after the regular logic

const reportsAvailable = ['LA','Training'];

const acquireLock = async function(report,logic, req, res) {
  const { establishmentId } = req;
  console.log(`running acquireLock`);
  console.log(report);
  if (!reportsAvailable.includes(report)){
    // console.log('Lock *NOT* acquired.');
    // res.status(500).send({
    //   message: `reportType not correct`,
    // });
    return;
  }
  LockHeldTitle = report + "ReportLockHeld";
  ReportState = report + "ReportState";
  req.startTime = new Date().toISOString();

  console.log(`Acquiring lock for establishment ${establishmentId}.`);

  // attempt to acquire the lock
  const currentLockState =  await models.establishment.update(
    {
      [LockHeldTitle]: true
    },{
    where: {
      EstablishmentID: establishmentId,
      [LockHeldTitle]: false
    }
  });
  // if no records were updated the lock could not be acquired
  // Just respond with a 409 http code and don't call the regular logic
  // close the response either way and continue processing in the background
  if (currentLockState[1] === 0) {
    console.log('Lock *NOT* acquired.');
    res.status(409).send({
      message: `The lock for establishment ${establishmentId} was not acquired as it's already being held by another ongoing process.`,
    });

    return;
  }

  console.log('Lock acquired.');

  req.buRequestId = String(uuid()).toLowerCase();

  res.status(200).send({
    message: `Lock for establishment ${establishmentId} acquired.`,
    requestId: req.buRequestId,
  });

  // run whatever the original logic was
  try {
    await logic(req, res);
  } catch (e) {}

  // release the lock
  await releaseLock(report,req, null, null);
};

const releaseLock = async (report,req, res, next) => {
  const establishmentId = req.query.subEstId || req.establishmentId;
  if (!reportsAvailable.includes(report)){
    console.log('Lock *NOT* acquired.');
    res.status(500).send({
      message: `reportType not correct`,
    });
    return;
  }
  LockHeldTitle = report + "ReportLockHeld";
  ReportState = report + "ReportState";

  if (Number.isInteger(establishmentId)) {
        await models.establishment.update(
          {
            [LockHeldTitle]: false,
          },{
            where: {
              EstablishmentID: establishmentId,
            }
          });
    console.log(`Lock released for establishment ${establishmentId}`);
  }
  if (res !== null) {
    res.status(200).send({
      establishmentId,
    });
  }
};

const signedUrlGet = async (report,req, res) => {
  try {
    console.log('running signedUrlGet');
    console.log(req);
    const establishmentId = req.establishmentId;
    if (!reportsAvailable.includes(report)){
      console.log('Lock *NOT* acquired.');
      res.status(500).send({
        message: `reportType not correct`,
      });
      return;
    }
    reportName = {
      'LA': 'Local-Authority-Report',
      'Training': 'Training-Report'
    };

    await saveResponse(req, res, 200, {
      urls: s3.getSignedUrl('putObject', {
        Bucket,
        Key: `${establishmentId}/latest/${moment(date).format('YYYY-MM-DD')}-SFC-${reportName[report]}.xlsx`,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        Metadata: {
          username: String(req.username),
          establishmentId: String(establishmentId),
        },
        Expires: config.get('bulkupload.uploadSignedUrlExpire'),
      }),
    });
  } catch (err) {
    console.error(`report/${report}:PreSigned - failed`, err.message);
    await saveResponse(req, res, 503, {});
  }
};

const saveResponse = async (req, res, statusCode, body, headers) => {
  if (!Number.isInteger(statusCode) || statusCode < 100) {
    statusCode = 500;
  }
  console.log('running saveResponse');
  console.log(req);
  return s3
    .putObject({
      Bucket,
      Key: `${req.establishmentId}/intermediary/${req.buRequestId}.json`,
      Body: JSON.stringify({
        url: req.url,
        startTime: req.startTime,
        endTime: new Date().toISOString(),
        responseCode: statusCode,
        responseBody: body,
        responseHeaders: typeof headers === 'object' ? headers : undefined,
      }),
    })
    .promise();
};

const responseGet = (req, res) => {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const buRequestId = String(req.params.buRequestId).toLowerCase();

  if (!uuidRegex.test(buRequestId)) {
    res.status(400).send({
      message: 'request id must be a uuid',
    });

    return;
  }
  console.log('running responseGet');

  s3.getObject({
    Bucket,
    Key: `${req.establishmentId}/intermediary/${buRequestId}.json`,
  })
    .promise()
    .then(data => {
      const jsonData = JSON.parse(data.Body.toString());

      if (Number.isInteger(jsonData.responseCode) && jsonData.responseCode > 99) {
        if (jsonData.responseHeaders) {
          res.set(jsonData.responseHeaders);
        }

        if (jsonData.responseBody && jsonData.responseBody.type && jsonData.responseBody.type === 'Buffer') {
          res.status(jsonData.responseCode).send(Buffer.from(jsonData.responseBody));
        } else {
          res.status(jsonData.responseCode).send(jsonData.responseBody);
        }
      } else {
        console.log('Report::responseGet: Response code was not numeric', jsonData);

        throw new Error('Response code was not numeric');
      }
    })
    .catch(err => {
      console.log('Report::responseGet: getting data returned an error:', err);

      res.status(404).send({
        message: 'Not Found',
      });
    });
};

const lockStatusGet = async (report,req, res) => {
  const { establishmentId } = req;
  if (!reportsAvailable.includes(report)){
    console.log('Lock *NOT* acquired.');
    res.status(500).send({
      message: `reportType not correct`,
    });
    return;
  }
  LockHeldTitle = report + "ReportLockHeld";

  const currentLockState =  await models.establishment.findAll({
    attributes: [['EstablishmentID', 'establishmentId'],LockHeldTitle],
    where: {
      EstablishmentID: establishmentId,
    }
  });
  res
    .status(200) // don't allow this to be able to test if an establishment exists so always return a 200 response
    .send(
      currentLockState.length === 0
        ? {
          establishmentId,
          [LockHeldTitle]: true,
        }
        : currentLockState[0]
    );

  return currentLockState[0];
};
module.exports.acquireLock = acquireLock;
module.exports.releaseLock = releaseLock;
module.exports.signedUrlGet = signedUrlGet;
module.exports.saveResponse = saveResponse;
module.exports.responseGet = responseGet;
module.exports.lockStatusGet = lockStatusGet;
