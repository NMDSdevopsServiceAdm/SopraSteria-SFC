const config = require('../../config/config');
const s3 = new (require('aws-sdk').S3)({
  region: String(config.get('certificate.region')),
});
// const s3Client = require('./libs/s3Client.js');
// const path = require('path');
const Bucket = String(config.get('certificate.bucketname'));
const pdfLib = require('pdf-lib');
// const fetch = require('node-fetch');
const Establishment = require('../../models/classes/establishment');
// const Authorization = require('../../utils/security/isAuthenticated');
const express = require('express');
const router = express.Router();
// const { s3, Bucket } = require('./s3');

const filePathBase = 'public/download/Certificates';
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
  const fileName = getFileNameYears();
  const establishmentFileName = `${req.establishment.uid} ${fileName}`;
  Key = `${filePathBase}/${establishmentFileName}`;

  // Check file exists
  const exists = await fileExists();
  if (!exists) {
    const thisEstablishment = new Establishment.Establishment(req.username);
    await thisEstablishment.restore(req.establishment.uid);

    console.log('About to Modify');
    const newFile = await modifyPdf(thisEstablishment.name, fileName);

    console.log('newFile');
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

const getFileNameYears = () => {
  const years = getYears();
  return `${fileNameBase} ${years}.pdf`;
};

const getYears = () => {
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear() - 2000;

  if (currentMonth >= 4) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

const modifyPdf = async (establishmentName, fileName) => {
  const params = {
    Key: `${filePathBase}/Templates/${fileName}`,
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
  // try {
  //     const data = await s3Client.send(new AWS.(uploadParams));
  //     console.log("Success", data);
  //     return data; // For unit tests.
  //   } catch (err) {
  //     console.log("Error", err);
  //   }
};

router.route('/').get(getCertificate);

module.exports = router;
module.exports.getCertificate = getCertificate;
