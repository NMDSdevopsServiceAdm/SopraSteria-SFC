const {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { AssumeRoleCommand, STSClient } = require('@aws-sdk/client-sts');
const { fromContainerMetadata } = require('@aws-sdk/credential-providers');

const config = require('../../../config/config');
const region = String(config.get('workerCertificate.region'));
const iamRoleArn = String(config.get('workerCertificate.roleArn'));

const getS3Client = async () => {
  const clientConfigs = {
    region,
    signatureVersion: 'v4',
  };
  if (iamRoleArn) {
    // assume role and add credentials to clientConfigs
    // const command = new AssumeRoleCommand({
    //   RoleArn: iamRoleArn,
    //   DurationSeconds: 900,
    // });
    // const stsClient = new STSClient();
    // const response = await stsClient.send(command);
    // clientConfigs['credentials'] = {
    //   accessKeyId: response.Credentials.AccessKeyId,
    //   secretAccessKey: response.Credentials.SecretAccessKey,
    //   sessionToken: response.Credentials.SessionToken,
    // };
  }

  const S3clientWithContainerRole = new S3Client({
    credentials: fromContainerMetadata({
      timeout: 1000,
      maxRetries: 0,
    }),
    region,
    signatureVersion: 'v4',
  });

  return S3clientWithContainerRole;

  //return new S3Client(clientConfigs);
};

const s3Client = getS3Client();

async function getSignedUrlForUpload({ bucket, key, options }) {
  const s3Client = await getS3Client();
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, putCommand, options);
}

const getSignedUrlForDownload = async ({ bucket, key, options }) => {
  const s3Client = await getS3Client();
  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, getCommand, options);
};

async function deleteCertificatesFromS3({ bucket, objects }) {
  const s3Client = await getS3Client();
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
}

async function verifyEtag(bucket, key, etag) {
  const s3Client = await getS3Client();
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
