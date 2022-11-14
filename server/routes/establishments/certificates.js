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
  console.log({ Key, exists, params: params() });
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
      };

      await uploadToS3(uploadParams);
    }

    const url = await getSignedUrl();
    res.status(200).send({ data: url });
  } catch (err) {
    return res.status(500).send({ err });
  }
};

const getSignedUrl = async () => {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params(), (err, url) => {
      if (err) reject(err);
      resolve(url);
    });
  });
};

const fileExists = async () => {
  try {
    await s3.getObject(params()).promise();
    return true;
  } catch (error) {
    console.log({ error });
    return false;
  }
};

const modifyPdf = async (establishmentName, fileName) => {
  const params = {
    Key: `${filePathBase}/template/${fileName}`,
    Bucket,
  };

  console.log('GET TEMPLATE:');
  console.log({ params });
  var response = await s3.getObject(params).promise();
  console.log('GOT from Template s3');

  const pdfDoc = await pdfLib.PDFDocument.load(response.Body.buffer);

  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const textField = form.getTextField(fields[0].getName());
  textField.setText(establishmentName);

  return pdfDoc.save();
};

const uploadToS3 = async (uploadParams) => {
  try {
    await s3.putObject(uploadParams).promise();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

router.route('/:years').get(Authorization.isAuthorised, getCertificate);

module.exports = router;
module.exports.getCertificate = getCertificate;
