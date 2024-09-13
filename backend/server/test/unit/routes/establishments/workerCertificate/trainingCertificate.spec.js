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

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    sinon.stub(Training.prototype, 'load');
    sinon.stub(Training.prototype, 'save');
  });

  describe('requestUploadUrl', () => {
    const mockUploadFiles = ['cert1.pdf', 'cert2.pdf'];
    const mockSignedUrl = 'http://localhost/mock-upload-url';

    function createReq(override = {}) {
      const mockUploadBody = { files: [{ filename: 'cert1.pdf' }, { filename: 'cert2.pdf' }] };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/establishment/${user.establishmentId}/worker/${user.workerId}/training/${training.uid}/certificate`,
        body: mockUploadBody,
        ...override,
      });

      return req;
    }

    beforeEach(() => {
      sinon.stub(s3, 'getSignedUrlForUpload').returns(mockSignedUrl);
    });

    it('should reply with a status of 200', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();
      await trainingCertificate.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should include a signed url for upload and a uuid for each file', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();
      await trainingCertificate.requestUploadUrl(req, res);

      const actual = await res._getJSONData();

      expect(actual.files).to.have.lengthOf(mockUploadFiles.length);

      actual.files.forEach((file) => {
        const { fileId, filename, signedUrl } = file;
        expect(uuid.validate(fileId)).to.be.true;
        expect(filename).to.be.oneOf(mockUploadFiles);
        expect(signedUrl).to.equal(mockSignedUrl);
      });
    });

    it('should reply with status 400 if files param was missing in body', async () => {
      const req = createReq({ body: {} });
      const res = httpMocks.createResponse();
      await trainingCertificate.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Missing `files` param in request body');
    });

    it('should reply with status 400 if filename was missing in any of the files', async () => {
      const req = createReq({ body: { files: [{ filename: 'file1.pdf' }, { anotherItem: 'no file name' }] } });
      const res = httpMocks.createResponse();
      await trainingCertificate.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Missing file name in request body');
    });
  });
});
