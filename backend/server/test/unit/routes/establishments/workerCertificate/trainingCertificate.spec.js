const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const uuid = require('uuid');

const models = require('../../../../../models');
const buildUser = require('../../../../factories/user');
const { trainingBuilder } = require('../../../../factories/models');
const { Training } = require('../../../../../models/classes/training');
const s3 = require('../../../../../routes/establishments/workerCertificate/s3');

const trainingCertificateRoute = require('../../../../../routes/establishments/workerCertificate/trainingCertificate');

describe.only('backend/server/routes/establishments/workerCertificate/trainingCertificate.js', () => {
  const user = buildUser();
  const training = trainingBuilder();

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {});

  describe('requestUploadUrl', () => {
    const mockUploadFiles = ['cert1.pdf', 'cert2.pdf'];
    const mockSignedUrl = 'http://localhost/mock-upload-url';

    function createReq(override = {}) {
      const mockRequestBody = { files: [{ filename: 'cert1.pdf' }, { filename: 'cert2.pdf' }] };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/establishment/${user.establishment.uid}/worker/${user.uid}/training/${training.uid}/certificate`,
        body: mockRequestBody,
        establishmentId: user.establishment.uid,
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
      await trainingCertificateRoute.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should include a signed url for upload and a uuid for each file', async () => {
      const req = createReq();
      const res = httpMocks.createResponse();
      await trainingCertificateRoute.requestUploadUrl(req, res);

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
      await trainingCertificateRoute.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Missing `files` param in request body');
    });

    it('should reply with status 400 if filename was missing in any of the files', async () => {
      const req = createReq({ body: { files: [{ filename: 'file1.pdf' }, { anotherItem: 'no file name' }] } });
      const res = httpMocks.createResponse();
      await trainingCertificateRoute.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Missing file name in request body');
    });

    describe('confirmUpload', () => {
      const mockUploadFiles = [
        { filename: 'cert1.pdf', fileId: 'uuid1', etag: 'etag1' },
        { filename: 'cert2.pdf', fileId: 'uuid2', etag: 'etag2' },
      ];
      const mockWorkerFk = user.id;
      const mockTrainingRecord = { dataValues: { workerFk: user.id, id: training.id } };

      let stubAddCertificate;

      beforeEach(() => {
        sinon.stub(models.workerTraining, 'findOne').returns(mockTrainingRecord);
        sinon.stub(s3, 'verifyEtag').returns(true);
        stubAddCertificate = sinon.stub(models.trainingCertificates, 'addCertificate');
      });

      const createPutReq = (override) => {
        return createReq({ method: 'PUT', body: { files: mockUploadFiles }, ...override });
      };

      it('should reply with a status of 200', async () => {
        const req = createPutReq();
        const res = httpMocks.createResponse();
        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(200);
      });

      it('should add a new record to database for each file', async () => {
        const req = createPutReq();
        const res = httpMocks.createResponse();
        await trainingCertificateRoute.confirmUpload(req, res);

        expect(stubAddCertificate).to.have.been.callCount(mockUploadFiles.length);

        mockUploadFiles.forEach((file) => {
          expect(stubAddCertificate).to.have.been.called;
          expect(stubAddCertificate).to.have.been.calledWith(training.id, mockWorkerFk, file.filename, file.fileId);
        });
      });

      it('should reply with status 400 if file param was missing', async () => {
        const req = createPutReq({ body: {} });
        const res = httpMocks.createResponse();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(400);
        expect(stubAddCertificate).not.to.be.called;
      });

      it(`should reply with status 400 if training record does not exist in database`, async () => {
        models.workerTraining.findOne.restore();
        sinon.stub(models.workerTraining, 'findOne').returns(null);

        const req = createPutReq();
        const res = httpMocks.createResponse();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(400);
        expect(stubAddCertificate).not.to.be.called;
      });

      it(`should reply with status 400 if etag from request does not match the etag on s3`, async () => {
        s3.verifyEtag.restore();
        sinon.stub(s3, 'verifyEtag').returns(false);

        const req = createPutReq();
        const res = httpMocks.createResponse();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(400);
        expect(stubAddCertificate).not.to.be.called;
      });

      it('should reply with status 400 if the file does not exist on s3', async () => {
        s3.verifyEtag.restore();
        sinon.stub(console, 'error'); // mute the error log
        sinon.stub(s3, 'verifyEtag').throws('403: UnknownError');

        const req = createPutReq();
        const res = httpMocks.createResponse();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(400);
        expect(stubAddCertificate).not.to.be.called;
      });

      it('should reply with status 500 if failed to add new certificate record to database', async () => {
        stubAddCertificate.throws('validation error');
        sinon.stub(console, 'error'); // mute the error log

        const req = createPutReq();
        const res = httpMocks.createResponse();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(500);
      });
    });
  });
});
