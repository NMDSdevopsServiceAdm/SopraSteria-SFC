const {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { fromContainerMetadata } = require('@aws-sdk/credential-providers');

const config = require('../../../config/config');
const region = String(config.get('workerCertificate.region'));
const env = String(config.get('env'));

const getS3Client = () => {
  if (env === 'localhost') {
    return new S3Client({
      region,
      signatureVersion: 'v4',
    });
  }

  return new S3Client({
    credentials: fromContainerMetadata({
      timeout: 1000,
      maxRetries: 0,
    }),
    region,
    signatureVersion: 'v4',
  });
};

const s3Client = getS3Client();

const getSignedUrlForUpload = ({ bucket, key, options }) => {
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, putCommand, options);
};

const getSignedUrlForDownload = ({ bucket, key, options }) => {
  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, getCommand, options);
};

const deleteCertificatesFromS3 = async ({ bucket, objects }) => {
  const deleteCommand = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: { Objects: objects },
  });

  try {
    const response = await s3Client.send(deleteCommand);
    return response;
  } catch (err) {
    console.error(err);
  }
};

const verifyEtag = async (bucket, key, etag) => {
  const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(headCommand);
  const etagFromS3 = response.ETag;

  return etagFromS3 === etag;
};

module.exports = {
  getS3Client,
  getSignedUrlForUpload,
  getSignedUrlForDownload,
  verifyEtag,
  deleteCertificatesFromS3,
};
