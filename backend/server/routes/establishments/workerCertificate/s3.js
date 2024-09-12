const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const config = require('../../../config/config');
const region = String(config.get('workerCertificate.region'));
const iamRoleArn = String(config.get('workerCertificate.roleArn'));

const getS3Client = () => {
  const clientConfigs = {
    region,
    signatureVersion: 'v4',
  };
  if (iamRoleArn) {
    // assume role and add credentials to clientConfigs
  }
  return new S3Client(clientConfigs);
};

function getSignedUrlForUpload({ bucket, key, options }) {
  const s3client = getS3Client();
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3client, putCommand, options);
}

module.exports = { getS3Client, getSignedUrlForUpload };
