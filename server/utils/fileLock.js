const AWS = require('aws-sdk');
const config = require('../config/config');
const models = require('../models/');
const uuid = require('uuid');
const s3 = new AWS.S3({
  region: String(config.get('bulkupload.region'))
});
const Bucket = String(config.get('bulkupload.bucketname'));
// Prevent multiple report requests from being ongoing simultaneously so we can store what was previously the http responses in the S3 bucket
// This function can't be an express middleware as it needs to run both before and after the regular logic
const reportsAvailable = ['la', 'training'];
const Sentry = require("@sentry/node");

const fileLock = {

  acquireLock: async function(reportType, logic, onUser, req, res) {
    let errorMessage = null;
    let successMessage = null;
    if (!reportsAvailable.includes(reportType)) {
      console.error('Lock *NOT* acquired.');
      if (res !== null) {
        res.status(500).send({
          message: `reportType not correct`
        });
      }
      return;
    }

    const LockHeldTitle = reportType + 'ReportLockHeld';
    let currentLockState = null;
    req.startTime = new Date().toISOString();
    // attempt to acquire the lock
    if (onUser) {
      const { userUid } = req;
      currentLockState = await models.user.closeLock(LockHeldTitle, userUid);
      errorMessage = `The lock for User ${userUid} was not acquired as it's already being held by another ongoing process.`;
      successMessage = `Lock for User ${userUid} acquired.`;
    } else {
      const { establishmentId } = req;
      currentLockState = await models.establishment.closeLock(LockHeldTitle, establishmentId);
      errorMessage = `The lock for establishment ${establishmentId} was not acquired as it's already being held by another ongoing process.`;
      successMessage = `Lock for establishment ${establishmentId} acquired.`;
    }
    // if no records were updated the lock could not be acquired
    // Just respond with a 409 http code and don't call the regular logic
    // close the response either way and continue processing in the background
    if (currentLockState[1] === 0) {
      console.error('Lock *NOT* acquired.');
      res.status(409).send({
        message: errorMessage
      });
      return;
    }

    req.buRequestId = String(uuid()).toLowerCase();
    res.status(200).send({
      message: successMessage,
      requestId: req.buRequestId
    });

    // run whatever the original logic was
    try {
      await logic(req, res);
    } catch (e) {
    }

    // release the lock
    await fileLock.releaseLock(reportType, onUser, req, null);
  },

  releaseLock: async (reportType, onUser, req, res) => {
    let IDLockOn = null;
    if (!reportsAvailable.includes(reportType)) {
      console.error('Lock *NOT* acquired.');
      if (res !== null) {
        res.status(500).send({
          message: `reportType not correct`
        });
      }
      return;
    }
    const LockHeldTitle = reportType + 'ReportLockHeld';
    if (onUser) {
      IDLockOn = req.userUid;
      currentLockState = await models.user.openLock(LockHeldTitle, IDLockOn);
    } else {
      IDLockOn = req.query.subEstId || req.establishmentId;
      if (Number.isInteger(IDLockOn)) {
        currentLockState = await models.establishment.openLock(LockHeldTitle, IDLockOn);
      }
    }
    if (res !== null) {
      res.status(200).send({
        IDLockOn
      });
    }
  },

  saveResponse: async (req, res, statusCode, body, headers) => {
    if (!Number.isInteger(statusCode) || statusCode < 100) {
      statusCode = 500;
    }
    return s3.putObject({
      Bucket,
      Key: `${req.userUid}/intermediary/${req.buRequestId}.json`,
      Body: JSON.stringify({
        url: req.url,
        startTime: req.startTime,
        endTime: new Date().toISOString(),
        responseCode: statusCode,
        responseBody: body,
        responseHeaders: typeof headers === 'object' ? headers : undefined
      })
    }).promise();
  },

  responseGet: async (req, res) => {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    const buRequestId = String(req.params.buRequestId).toLowerCase();
    if (!uuidRegex.test(buRequestId)) {
      res.status(400).send({
        message: 'request id must be a uuid'
      });
      return;
    }
    try {
      const key = `${req.userUid}/intermediary/${buRequestId}.json`;
      var jsonData = await fileLock.getS3(key);
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
        throw new Error('Response code was not numeric');
      }
    } catch (err) {
      console.error('Report::responseGet: getting data returned an error:', err);
      res.status(404).send({
        message: 'Not Found'
      });
      Sentry.captureException(err);
    }
  },

  getS3: async (key) => {
    const data = await s3.getObject({
      Bucket,
      Key: key
    }).promise();
    return JSON.parse(data.Body.toString());
  },

  lockStatusGet: async (reportType, onUser, req, res) => {
    let IDLockOn = null;
    let currentLockState = null;
    if (!reportsAvailable.includes(reportType)) {
      console.error('Lock *NOT* acquired.');
      res.status(500).send({
        message: `reportType not correct`
      });
      return;
    }
    const LockHeldTitle = reportType.charAt(0).toUpperCase() + reportType.slice(1) + 'ReportLockHeld';

    if (onUser) {
      IDLockOn = req.userUid;
      currentLockState = await models.user.findAll({
        attributes: [['UserUID', 'idLockOn'], [LockHeldTitle, 'reportLockHeld']],
        where: {
          uid: IDLockOn
        }
      }).then(res => {
        return res.map(row => {
          return row.dataValues;
        });
      });

    } else {
      IDLockOn = req.query.subEstId || req.establishmentId;
      currentLockState = await models.establishment.findAll({
        attributes: [['EstablishmentID', 'idLockOn'], [LockHeldTitle, 'reportLockHeld']],
        where: {
          id: IDLockOn
        }
      }).then(res => {
        return res.map(row => {
          return row.dataValues;
        });
      });

    }
    if (currentLockState.length > 0) {
      return res.status(200).send(currentLockState[0]);
    }
    return res.status(200).send({ IDLockOn, reportLockHeld: true });
  }
};
module.exports.acquireLock = fileLock.acquireLock;
module.exports.releaseLock = fileLock.releaseLock;
module.exports.saveResponse = fileLock.saveResponse;
module.exports.responseGet = fileLock.responseGet;
module.exports.lockStatusGet = fileLock.lockStatusGet;
module.exports = fileLock;
