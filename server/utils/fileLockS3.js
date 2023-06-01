const AWS = require('aws-sdk');
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');
uuidv4();

const s3 = new AWS.S3({
  region: String(config.get('locks.region')),
});
const Bucket = String(config.get('locks.bucketname'));

const lockExists = async (establishmentId, lockName) => {
  let lockExists = true;
  try {
    await s3
      .headObject({
        Bucket,
        Key: `establishments/${establishmentId}/${lockName}.json`,
      })
      .promise();
  } catch (err) {
    if (err.statusCode === 403) {
      lockExists = false;
    }
  }
  return lockExists;
};

const lockAquired = async (establishmentId, lockName) => {
  let lockAquired = false;
  try {
    await s3
      .putObject({
        Body: JSON.stringify({}),
        Bucket,
        Key: `establishments/${establishmentId}/${lockName}.json`,
      })
      .promise();
    lockAquired = true;
  } catch (err) {
    console.log(err);
  }
  return lockAquired;
};

const lockDeleted = async (establishmentId, lockName) => {
  let lockDeleted = true;
  try {
    await s3
      .deleteObject({
        Bucket,
        Key: `establishments/${establishmentId}/${lockName}.json`,
      })
      .promise();
  } catch (err) {
    lockDeleted = false;
  }
  return lockDeleted;
};

const fileLockS3 = {
  async acquireLock(lockName, logic, req, res) {
    const { establishmentId } = req;

    const exists = await lockExists(establishmentId, lockName);

    if (!exists) {
      if (await lockAquired(establishmentId, lockName)) {
        req.buRequestId = String(uuidv4()).toLowerCase();
        res.status(200).send({
          message: `Lock for establishment ${establishmentId} acquired.`,
          requestId: req.buRequestId,
        });
      }
    } else {
      res.status(409).send({
        message: `The lock for establishment ${establishmentId} was not acquired as it's already being held by another ongoing process.`,
      });
    }

    try {
      await logic(req, res);
    } catch (e) {
      console.log(e);
    }

    await lockDeleted(establishmentId, lockName);
  },

  async lockStatus(lockName, req, res) {
    const { establishmentId } = req;

    const reportLockHeld = await lockExists(establishmentId, lockName);

    res.status(200).send({ idLockOn: establishmentId, reportLockHeld });
  },

  async releaseLock(lockName, req, res) {
    const { establishmentId } = req;

    if (await lockDeleted(establishmentId, lockName)) {
      res.status(200).send({
        iDLockOn: establishmentId,
      });
    } else {
      res.status(404).send();
    }
  },
};

module.exports = fileLockS3;
