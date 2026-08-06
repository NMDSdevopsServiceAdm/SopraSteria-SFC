const sinon = require('sinon');
const expect = require('chai').expect;
const {
  ListObjectsV2Command,
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const lodash = require('lodash');

const { S3ClientV3 } = require('../../../aws/s3Client');
const S3RequestPresignerModule = require('@aws-sdk/s3-request-presigner');

describe('S3ClientV3', () => {
  let s3;
  let sendSpy;
  beforeEach(() => {
    s3 = new S3ClientV3();
    sendSpy = sinon.stub(S3Client.prototype, 'send');
  });
  afterEach(() => {
    sinon.restore();
  });

  describe('listObjects', () => {
    it('should call s3.send() with listObjectsCommand', async () => {
      await s3.listObjects({ Bucket: 'bulk-upload-s3-bucket', Prefix: '1234/' });

      expect(sendSpy).to.have.been.calledOnce;

      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(ListObjectsV2Command);
      expect(callArgument.input).to.deep.equal({ Bucket: 'bulk-upload-s3-bucket', Prefix: '1234/' });
    });
  });

  describe('getObject', () => {
    it('should call s3.send() with GetObjectCommand', async () => {
      const params = { Bucket: 'my-bucket', Key: 'file.txt' };
      await s3.getObject(params);

      expect(sendSpy).to.have.been.calledOnce;
      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(GetObjectCommand);
      expect(callArgument.input).to.deep.equal(params);
    });
  });

  describe('putObject', () => {
    it('should call s3.send() with PutObjectCommand', async () => {
      const params = { Bucket: 'my-bucket', Key: 'file.txt', Body: 'some mock file content' };
      await s3.putObject(params);

      expect(sendSpy).to.have.been.calledOnce;
      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(PutObjectCommand);
      expect(callArgument.input).to.deep.equal(params);
    });
  });

  describe('deleteObjects', () => {
    it('should call s3.send() with DeleteObjectsCommand', async () => {
      const params = {
        Bucket: 'my-bucket',
        Delete: { Objects: [{ Key: 'file1.txt' }, { Key: 'file2.txt' }] },
      };
      await s3.deleteObjects(params);

      expect(sendSpy).to.have.been.calledOnce;
      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(DeleteObjectsCommand);
      expect(callArgument.input).to.deep.equal(params);
    });
  });

  describe('copyObject', () => {
    it('should call s3.send() with CopyObjectCommand', async () => {
      const params = {
        Bucket: 'destination-bucket',
        CopySource: 'source-bucket/source-key',
        Key: 'new-key',
      };
      await s3.copyObject(params);

      expect(sendSpy).to.have.been.calledOnce;
      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(CopyObjectCommand);
      expect(callArgument.input).to.deep.equal(params);
    });
  });

  describe('headObject', () => {
    it('should call s3.send() with HeadObjectCommand', async () => {
      const params = { Bucket: 'my-bucket', Key: 'file.txt' };
      await s3.headObject(params);

      expect(sendSpy).to.have.been.calledOnce;
      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(HeadObjectCommand);
      expect(callArgument.input).to.deep.equal(params);
    });
  });

  describe('getSignedUrlForPutObject', () => {
    it('should call getSignedUrl with PutObjectCommand', async () => {
      const mockgetSignedUrl = sinon.stub(S3RequestPresignerModule, 'getSignedUrl');
      const params = {
        Key: 'file.json',
        Bucket: 'mock-s3-bucket-name',
        ContentType: 'application/json',
        Metadata: {
          username: 'mock-username',
          establishmentId: 'mock-uid',
          validationstatus: 'pending',
        },
        options: {
          expiresIn: 36000,
        },
      };

      await s3.getSignedUrlForPutObject(params);

      expect(mockgetSignedUrl).to.have.been.calledOnce;

      const client = mockgetSignedUrl.getCall(0).args[0];
      expect(client).to.be.instanceOf(S3Client);

      const command = mockgetSignedUrl.getCall(0).args[1];
      expect(command).to.be.instanceOf(PutObjectCommand);
      expect(command.input).to.deep.equal(lodash.omit(params, 'options'));

      const options = mockgetSignedUrl.getCall(0).args[2];
      expect(options).to.deep.equal({
        expiresIn: 36000,
      });
    });
  });

  describe('getSignedUrlForGetObject', () => {
    it('should call getSignedUrl with GetObjectCommand', async () => {
      const mockgetSignedUrl = sinon.stub(S3RequestPresignerModule, 'getSignedUrl');
      const params = {
        Key: 'file.json',
        Bucket: 'mock-s3-bucket-name',
        ContentType: 'application/json',
        Metadata: {
          username: 'mock-username',
          establishmentId: 'mock-uid',
          validationstatus: 'pending',
        },
        options: {
          expiresIn: 36000,
        },
      };

      await s3.getSignedUrlForGetObject(params);

      expect(mockgetSignedUrl).to.have.been.calledOnce;

      const client = mockgetSignedUrl.getCall(0).args[0];
      expect(client).to.be.instanceOf(S3Client);

      const command = mockgetSignedUrl.getCall(0).args[1];
      expect(command).to.be.instanceOf(GetObjectCommand);
      expect(command.input).to.deep.equal(lodash.omit(params, 'options'));

      const options = mockgetSignedUrl.getCall(0).args[2];
      expect(options).to.deep.equal({
        expiresIn: 36000,
      });
    });
  });
});
