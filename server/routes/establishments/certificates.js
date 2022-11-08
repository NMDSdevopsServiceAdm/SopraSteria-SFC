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
  // Determine file name
  console.log(req.params);
  const fileName = `${fileNameBase} ${req.params.years}.pdf`;
  const establishmentFileName = `${req.params.id} ${fileName}`;
  Key = `${filePathBase}/${establishmentFileName}`;

  const exists = await fileExists();
  try {
  if (!exists) {
    const thisEstablishment = new Establishment.Establishment(req.username);
    await thisEstablishment.restore(req.establishment.uid);

    const newFile = await modifyPdf(thisEstablishment.name, fileName);

    const uploadParams = {
      Bucket,
      Key,
      Body: newFile,
      ContentDisposition: `attachment; filename="${fileName}"`,
      ACL: 'public-read',
    };
    uploadToS3(uploadParams);
  }
  res.status(200).send({ data: Key });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

const fileExists = async () => {
  let result;
  const objectParams = params();
  await s3
    .getObject(objectParams)
    .promise()
    .then((data) => {
      console.log(data);
      result = true;
    })
    .catch(() => (result = false));
  return result;
};

const modifyPdf = async (establishmentName, fileName) => {
  const params = {
    Key: `${filePathBase}/template/${fileName}`,
    Bucket,
  };

  let existingPdfBytes;
  console.log(params);
  await s3
    .getObject(params)
    .promise()
    .then((data) => {
      existingPdfBytes = data.Body.buffer;
    })
    .catch((err) => console.log(err));

  console.log(existingPdfBytes);
  const pdfDoc = await pdfLib.PDFDocument.load(existingPdfBytes);

  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const textField = form.getTextField(fields[0].getName());
  textField.setText(establishmentName);

  return pdfDoc.save();
};

const uploadToS3 = async (uploadParams) => {
  s3.putObject(uploadParams)
    .promise()
    .then((x) => console.log(x))
    .catch((err) => console.log(err));
};

router.route('/:years').get(Authorization.isAuthorised, getCertificate);

module.exports = router;
module.exports.getCertificate = getCertificate;
