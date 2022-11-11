const config = require('../../config/config');
const s3 = new (require('aws-sdk').S3)({
  region: String(config.get('certificate.region')),
});

const Bucket = String(config.get('certificate.bucketname'));
const pdfLib = require('pdf-lib');
const Establishment = require('../../models/classes/establishment');
const Authorization = require('../../utils/security/isAuthenticated');

const express = require('express');
const router = express.Router({ mergeParams: true });

const filePathBase = 'public/download/certificates';
let fileNameBase = 'ASC-WDS certificate';
let Key;

const params = () => {
  return {
    Bucket,
    Key,
  };
};

const getCertificate = async (req, res) => {
  const fileName = `${fileNameBase} ${req.params.years}.pdf`;
  const establishmentFileName = `${req.params.id} ${fileName}`;
  Key = `${filePathBase}/${establishmentFileName}`;
  const exists = await fileExists();

  try {
    if (!exists) {
      const thisEstablishment = new Establishment.Establishment(req.username);
      await thisEstablishment.restore(req.params.id);

      const newFile = await modifyPdf(thisEstablishment.name, fileName);

      const uploadParams = {
        Bucket,
        Key,
        Body: newFile,
        ContentDisposition: `attachment; filename="${fileName}"`,
        ACL: 'public-read',
      };
      await uploadToS3(uploadParams);
    }

    const url = await s3.getSignedUrl('getObject', params());
    console.log({ url });
    res.status(200).send({ data: url });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

const fileExists = async () => {
  let result;
  const objectParams = params();
  // S3 sdk doesn't have a function for checking if file exists so attempt a get and return false if it fails
  await s3
    .getObject(objectParams)
    .promise()
    .then(() => {
      result = true;
    })
    .catch((err) => {
      if (err.code === 'NoSuchKey') {
        result = false;
      } else {
        throw err;
      }
    });
  return result;
};

const modifyPdf = async (establishmentName, fileName) => {
  const params = {
    Key: `${filePathBase}/template/${fileName}`,
    Bucket,
  };

  let existingPdfBytes;

  console.log('GET TEMPLATE:');
  console.log(params);
  await s3
    .getObject(params)
    .promise()
    .then((data) => {
      existingPdfBytes = data.Body.buffer;
      console.log('GOT TEMPLATE SUCCESFULLY');
    })
    .catch((err) => console.log(err));

  const pdfDoc = await pdfLib.PDFDocument.load(existingPdfBytes);

  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const textField = form.getTextField(fields[0].getName());
  textField.setText(establishmentName);

  return pdfDoc.save();
};

const uploadToS3 = async (uploadParams) => {
  console.log('UPLOAD TO S3');
  console.log(uploadParams);
  try {
    await s3.putObject(uploadParams).promise();
  } catch (err) {
    console.log('UPLOAD FAILED');
    console.log(err);
  }
  console.log('UPLOAD COMPLETE');
};

router.route('/:years').get(Authorization.isAuthorised, getCertificate);

module.exports = router;
module.exports.getCertificate = getCertificate;
