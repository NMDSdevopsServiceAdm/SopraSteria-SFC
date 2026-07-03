const config = require('../../../config/config');
const { S3ClientV3 } = require('../../../aws/s3Client');

const region = String(config.get('bulkupload.region'));
const bulkUploadS3Client = new S3ClientV3(region);

module.exports = bulkUploadS3Client;
