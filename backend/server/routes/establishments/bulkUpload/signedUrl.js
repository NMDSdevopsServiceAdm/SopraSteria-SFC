'use strict';
const config = require('../../../config/config');
const { buStates } = require('./states');
const { s3, Bucket, saveResponse } = require('./s3');

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
    await saveResponse(req, res, 500, {});
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/').get(acquireLock.bind(null, signedUrlGet, buStates.DOWNLOADING, true));

module.exports = router;
