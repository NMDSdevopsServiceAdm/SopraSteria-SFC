
const config = require('../../config/config');
const s3 = new (require('aws-sdk').S3)({
  region: String(config.get('certificate.region')),
});
// const s3Client = require('./libs/s3Client.js');
// const path = require('path');
const Bucket = String(config.get('certificate.bucketname'));
const PDFDocument = require('pdf-lib');
// const fetch = require('node-fetch');
// const Establishment = require('../../models/classes/establishment');
// const Authorization = require('../../utils/security/isAuthenticated');
const express = require('express');
const router = express.Router();
// const { s3, Bucket } = require('./s3');

const filePathBase = 'public/download/Certificates/';
const fileNameBase = 'ASC-WDS+certificate';

const params = (fileName) => {
  let key = fileName.replace('+', ' ');
  console.log(key);
  return {
    Bucket,
    Key: key,
  };
};

const getCertificate = async (req, res) => {
    // Determine file name
    const fileName = getFileName(req.params.Id);
    console.log(fileName);
    // Check file exists
    if(!fileExists(fileName)) {
      // const thisEstablishment = new Establishment.Establishment(req.username);
      // await thisEstablishment.restore();

      // let newFile;
      // modifyPdf(fileName, thisEstablishment.name).subscribe(x => newFile = x);

      // const uploadParams = {
      //     Bucket: 'sfc_public_staging',
      //     Key: path.basename(fileName),
      //     Body: newFile,
      // };
      // uploadToS3(uploadParams);
    }

    // TODO: Return download link

}

const fileExists = (fileName) => {
  const objectParams = params(fileName);
  // const bucketContents = await s3.getObject(objectParams).promise();

    // s3.getObject({
    //     Bucket,
    //     Key: fileName,
    //   })
    //     .promise()
    //     .then((data) => {
    //       const jsonData = JSON.parse(data.Body.toString());

    //       return jsonData;
    //     //   if (Number.isInteger(jsonData.responseCode) && jsonData.responseCode > 99) {
    //     //     if (jsonData.responseHeaders) {
    //     //       res.set(jsonData.responseHeaders);
    //     //     }

    //     //     res.status(jsonData.responseCode).send(jsonData.responseBody);
    //     //   } else {
    //     //     console.log('bulkUpload::responseGet: Response code was not numeric', jsonData);

    //     //     throw new Error('Response code was not numeric');
    //     //   }
    //     })
    //     .catch((err) => {
    //       console.error('getting data returned an error:', err);

    //     //   res.status(404).send({
    //     //     message: 'Not Found',
    //     //   });
    //     });
}

const getFileName = (establishmentId) => {
    const years = getYears();
    fileNameBase = `${fileNameBase}+${years}.pdf`
    return `${filePathBase}/${establishmentId}+${fileNameBase}`;
}

const getYears = () => {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear() - 2000;

    if(currentMonth >= 4) {
      return `${currentYear}-${currentYear+1}`
    } else {
      return `${currentYear-1}-${currentYear}`
    }
}

const modifyPdf = async (establishmentName) => {
    const url = `https://sfc-public-staging.s3.eu-west-2.amazonaws.com/${filePathBase}/Templates/${fileNameBase}`
    const existingPdfBytes = null //await fetch(url).then(res => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const textField = form.getTextField(fields[0].getName());
    textField.setText(establishmentName);

    return await pdfDoc.save();
    // writeFile('output.pdf', pdfBytes, (err) => {
    //   if(err) throw err;
    // });
  }

const uploadToS3 = async (uploadParams) => {
    // try {
    //     const data = await s3Client.send(new AWS.(uploadParams));
    //     console.log("Success", data);
    //     return data; // For unit tests.
    //   } catch (err) {
    //     console.log("Error", err);
    //   }
}

router.route('/').get(getCertificate);

module.exports = router;
module.exports.getCertificate = getCertificate;