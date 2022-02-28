'use strict';
const config = require('../../../config/config');
const moment = require('moment');

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: String(config.get('disbursement.region')),
});

const Bucket = String(config.get('disbursement.bucketname'));

const uploadFileToS3 = async (buffer) => {
  try {
    await s3
      .putObject({
        Bucket,
        Key: moment().format('DD-MM-YYYY') + '-fundingClaimForm.xlsx',
        Body: buffer,
      })
      .promise();
  } catch (err) {
    console.error('uploadDataToS3: ', err);
    throw new Error('Failed to upload To S3 ');
  }
};

module.exports = uploadFileToS3;
