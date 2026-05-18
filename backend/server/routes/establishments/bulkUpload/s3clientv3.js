const { ListObjectsV2Command, S3Client } = require('@aws-sdk/client-s3');

const config = require('../../../config/config');

const s3ClientV3 = new S3Client({
  region: String(config.get('bulkupload.region')),
  signatureVersion: 'v4',
});

const listObjects = async (listParams) => {
  const listObjectsCommand = new ListObjectsV2Command(listParams);
  return s3ClientV3.send(listObjectsCommand);
};

module.exports = { listObjects, s3client: s3ClientV3 };
