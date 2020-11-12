'use strict';
const config = require('../../../config/config');
const s3 = new (require('aws-sdk').S3)({
  region: String(config.get('bulkupload.region')),
});
const Bucket = String(config.get('bulkupload.bucketname'));

const buStates = [
  'READY',
  'DOWNLOADING',
  'UPLOADING',
  'UPLOADED',
  'VALIDATING',
  'FAILED',
  'WARNINGS',
  'PASSED',
  'COMPLETING',
  'UNKNOWN',
].reduce((acc, item) => {
  acc[item] = item;

  return acc;
}, Object.create(null));

const { saveResponse } = require('./s3');

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
          validationstatus: 'pending',
        },
        Expires: config.get('bulkupload.uploadSignedUrlExpire'),
      }),
    });
  } catch (err) {
    console.error('establishment::bulkupload GET/:PreSigned - failed', err.message);
    await saveResponse(req, res, 503, {});
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/').get(acquireLock.bind(null, signedUrlGet, buStates.DOWNLOADING));

module.exports = router;
