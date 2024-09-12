const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const uuid = require('uuid');

const buildUser = require('../../../../factories/user');
const { trainingBuilder } = require('../../../../factories/models');
const { Training } = require('../../../../../models/classes/training');
const s3 = require('../../../../../routes/establishments/workerCertificate/s3');

const trainingCertificate = require('../../../../../routes/establishments/workerCertificate/trainingCertificate');

describe.only('backend/server/routes/establishments/workerCertificate/trainingCertificate.js', () => {
  const user = buildUser();
  const training = trainingBuilder();

  const mockUploadFiles = ['cert1.pdf', 'cert2.pdf'];

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    sinon.stub(Training.prototype, 'load');
    sinon.stub(Training.prototype, 'save');
    sinon.stub(s3, 'getSignedUrlForUpload').returns('http://localhost/mock-upload-url');
    sinon.stub(uuid, 'v4').returns('mockuuid');
  });

  function createReq() {
    const mockUploadBody = { files: [{ filename: 'cert1.pdf' }, { filename: 'cert2.pdf' }] };

    const req = httpMocks.createRequest({
      method: 'POST',
      url: `/api/establishment/${user.establishmentId}/worker/${user.workerId}/training/${training.uid}/certificate`,
      body: mockUploadBody,
    });

    return req;
  }

  describe('requestUploadUrl', () => {
    it('should reply with a status of 200', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();
      await trainingCertificate.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should reply with an object that contains signed urls for upload', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();
      await trainingCertificate.requestUploadUrl(req, res);

      const expectedResponseBody = {
        files: [
          {
            filename: 'cert1.pdf',
            signedUrl: 'http://localhost/mock-upload-url',
          },
          ,
          {
            filename: 'cert2.pdf',
            signedUrl: 'http://localhost/mock-upload-url',
          },
        ],
      };

      const actual = await res._getJSONData();

      expect(actual.files).to.have.lengthOf(mockUploadFiles.length);

      actual.files.forEach((file) => {
        const { fileId, filename, signedUrl } = file;
        expect(uuid.validate(fileId)).to.be.true;
        expect(mockUploadFiles).to.include(filename);
        expect(signedUrl).to.include('http://localhost/mock-upload-url');
      });
    });
  });
});
