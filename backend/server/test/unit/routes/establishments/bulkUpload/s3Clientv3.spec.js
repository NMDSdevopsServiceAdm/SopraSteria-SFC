const sinon = require('sinon');
const expect = require('chai').expect;
const { ListObjectsV2Command, S3Client } = require('@aws-sdk/client-s3');

const s3ClientV3 = require('../../../../../routes/establishments/bulkUpload/s3clientv3');

describe('S3 Client (Ver 3) for Bulk upload', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('listObjects', () => {
    it('should call s3.send() with listObjectcommand', async () => {
      const sendSpy = sinon.stub(S3Client.prototype, 'send');

      await s3ClientV3.listObjects({ Bucket: 'bulk-upload-s3-bucket', Prefix: '1234/' });

      expect(sendSpy).to.have.been.calledOnce;

      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(ListObjectsV2Command);
      expect(callArgument.input).to.deep.equal({ Bucket: 'bulk-upload-s3-bucket', Prefix: '1234/' });
    });
  });
});
