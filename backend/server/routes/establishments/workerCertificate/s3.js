const {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
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

const s3Client = getS3Client();

function getSignedUrlForUpload({ bucket, key, options }) {
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, putCommand, options);
}

const getSignedUrlForDownload = ({ bucket, key, options }) => {
  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, getCommand, options);
};

async function deleteCertificatesFromS3({ bucket, objects }) {
  const s3client = getS3Client();
  const deleteCommand = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: { Objects: objects },
  });

  try {
    const response = await s3client.send(deleteCommand);
    return response;
  } catch (err) {
    console.error(err);
  }
}

async function verifyEtag(bucket, key, etag) {
  const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(headCommand);
  const etagFromS3 = response.ETag;

  return etagFromS3 === etag;
}

module.exports = {
  getS3Client,
  getSignedUrlForUpload,
  getSignedUrlForDownload,
  verifyEtag,
  deleteCertificatesFromS3,
};
