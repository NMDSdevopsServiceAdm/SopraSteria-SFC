'use strict';
const { buStates } = require('./states');
const { saveResponse, getSignedUrlForUpload } = require('./s3');

const signedUrlGet = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;

    const params = {
      Key: `${establishmentId}/latest/${req.query.filename}`,
      ContentType: req.query.type,
      Metadata: {
        username: String(req.username),
        establishmentId: String(establishmentId),
        validationstatus: 'pending',
      },
    };
    const urls = await getSignedUrlForUpload(params);
    const responseBody = {
      urls,
    };
    await saveResponse(req, res, 200, responseBody);
  } catch (err) {
    console.error('establishment::bulkupload GET/:PreSigned - failed', err.message);
    await saveResponse(req, res, 500, {});
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/').get(acquireLock.bind(null, signedUrlGet, buStates.DOWNLOADING, true));

module.exports = router;
