const S3RequestPresigner = require('@aws-sdk/s3-request-presigner');
const {
  ListObjectsV2Command,
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');

class S3ClientV3 {
  constructor(region) {
    this.region = region;

    const client = new S3Client({
      region: this.region,
      signatureVersion: 'v4',
    });
    this.client = client;
  }

  getClient() {
    return this.client;
  }

  async listObjects(listParams) {
    const listObjectsCommand = new ListObjectsV2Command(listParams);
    return this.client.send(listObjectsCommand);
  }

  async getObject(params) {
    const command = new GetObjectCommand(params);
    return this.client.send(command);
  }

  async putObject(params) {
    const command = new PutObjectCommand(params);
    return this.client.send(command);
  }

  async deleteObjects(params) {
    const command = new DeleteObjectsCommand(params);
    return this.client.send(command);
  }

  async copyObject(params) {
    const command = new CopyObjectCommand(params);
    return this.client.send(command);
  }

  async headObject(params) {
    const command = new HeadObjectCommand(params);
    return this.client.send(command);
  }

  async getSignedUrlForPutObject({ options, ...params }) {
    const putCommand = new PutObjectCommand(params);
    return S3RequestPresigner.getSignedUrl(this.client, putCommand, options);
  }

  async getSignedUrlForGetObject({ options, ...params }) {
    const getCommand = new GetObjectCommand(params);
    return S3RequestPresigner.getSignedUrl(this.client, getCommand, options);
  }
}

module.exports = { S3ClientV3 };
