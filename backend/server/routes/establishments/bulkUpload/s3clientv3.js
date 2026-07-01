const {
  ListObjectsV2Command,
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');

const config = require('../../../config/config');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: String(config.get('bulkupload.region')),
  signatureVersion: 'v4',
});

const listObjects = async (listParams) => {
  const listObjectsCommand = new ListObjectsV2Command(listParams);
  return s3Client.send(listObjectsCommand);
};

const getObject = async (params) => {
  const command = new GetObjectCommand(params);
  return s3Client.send(command);
};

const putObject = async (params) => {
  const command = new PutObjectCommand(params);
  return s3Client.send(command);
};

const deleteObjects = async (params) => {
  const command = new DeleteObjectsCommand(params);
  return s3Client.send(command);
};

const copyObject = async (params) => {
  const command = new CopyObjectCommand(params);
  return s3Client.send(command);
};

const headObject = async (params) => {
  const command = new HeadObjectCommand(params);
  return s3Client.send(command);
};

const getSignedUrlForPutObject = async ({ options, ...params }) => {
  const putCommand = new PutObjectCommand(params);
  return getSignedUrl(s3Client, putCommand, options);
};

module.exports = {
  s3client: s3Client,
  listObjects,
  getObject,
  putObject,
  deleteObjects,
  copyObject,
  headObject,
  getSignedUrlForPutObject,
};
