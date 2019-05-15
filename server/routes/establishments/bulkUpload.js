const express = require('express');
const appConfig = require('../../config/config');
const router = express.Router();
const AWS = require('aws-sdk');
const urlTimeOut = 300;

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

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  console.log('ok - bulk', establishmentId);
  return res.status(200).send();
});

module.exports = router;
