const config = require('../../config/config');

const pdfLib = require('pdf-lib');
const Establishment = require('../../models/classes/establishment');
const Authorization = require('../../utils/security/isAuthenticated');

const express = require('express');
const { S3ClientV3 } = require('../../aws/s3Client');
const router = express.Router({ mergeParams: true });

const region = String(config.get('certificate.region'));
const Bucket = String(config.get('certificate.bucketname'));

const S3Client = new S3ClientV3(region);

const filePathBase = 'public/download/certificates';
const fileNameBase = 'ASC-WDS certificate';

const getCertificate = async (req, res) => {
  const fileName = `${fileNameBase} ${req.params.years}.pdf`;
  const establishmentFileName = `${req.params.id} ${fileName}`;
  const Key = `${filePathBase}/${establishmentFileName}`;
  try {
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

    const url = await getSignedUrl(Key);
    res.status(200).send({ data: url });
  } catch (err) {
    return res.status(500).send({ err });
  }
};

const getSignedUrl = async (Key) => {
  const parameters = {
    Bucket,
    Key,
  };
  const signedUrl = await S3Client.getSignedUrlForGetObject(parameters);
  return signedUrl;
};

const modifyPdf = async (establishmentName, fileName) => {
  const params = {
    Key: `${filePathBase}/template/${fileName}`,
    Bucket,
  };

  const response = await S3Client.getObject(params);
  const responseBodyAsBuffer = await response.Body.transformToByteArray();

  const pdfDoc = await pdfLib.PDFDocument.load(responseBodyAsBuffer);

  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const textField = form.getTextField(fields[0].getName());
  textField.setText(establishmentName);

  return pdfDoc.save();
};

const uploadToS3 = async (uploadParams) => {
  try {
    await S3Client.putObject(uploadParams);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

router.route('/:years').get(Authorization.isAuthorised, getCertificate);

module.exports = router;
module.exports.getCertificate = getCertificate;
