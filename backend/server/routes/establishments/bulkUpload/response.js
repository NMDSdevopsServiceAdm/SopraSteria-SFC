'use strict';

const { s3, Bucket } = require('./s3');

const responseGet = (req, res) => {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const buRequestId = String(req.params.buRequestId).toLowerCase();

  if (!uuidRegex.test(buRequestId)) {
    res.status(400).send({
      message: 'request id must be a uuid',
    });

    return;
  }

  s3.getObject({
    Bucket,
    Key: `${req.establishmentId}/intermediary/${buRequestId}.json`,
  })
    .promise()
    .then((data) => {
      const jsonData = JSON.parse(data.Body.toString());

      if (Number.isInteger(jsonData.responseCode) && jsonData.responseCode > 99) {
        if (jsonData.responseHeaders) {
          res.set(jsonData.responseHeaders);
        }

        res.status(jsonData.responseCode).send(jsonData.responseBody);
      } else {
        console.log('bulkUpload::responseGet: Response code was not numeric', jsonData);

        throw new Error('Response code was not numeric');
      }
    })
    .catch((err) => {
      console.error('bulkUpload::responseGet: getting data returned an error:', err);

      res.status(404).send({
        message: 'Not Found',
      });
    });
};

const router = require('express').Router();

router.route('/:buRequestId').get(responseGet);

module.exports = router;
