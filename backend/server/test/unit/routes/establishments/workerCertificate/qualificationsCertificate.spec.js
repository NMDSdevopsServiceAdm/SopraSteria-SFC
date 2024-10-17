const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');

const buildUser = require('../../../../factories/user');
const { qualificationBuilder } = require('../../../../factories/models');

const qualificationCertificateRoute = require('../../../../../routes/establishments/workerCertificate/qualificationCertificate');
const WorkerCertificateService = require('../../../../../routes/establishments/workerCertificate/workerCertificateService');
const HttpError = require('../../../../../utils/errors/httpError');

describe('backend/server/routes/establishments/workerCertificate/qualificationCertificate.js', () => {
  const user = buildUser();
  const qualification = qualificationBuilder();

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => { });

  describe('requestUploadUrl', () => {
    let res;

    function createReq(override = {}) {
      const mockRequestBody = { files: [{ filename: 'cert1.pdf' }, { filename: 'cert2.pdf' }] };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/establishment/${user.establishment.uid}/worker/${user.uid}/qualifications/${qualification.uid}/certificate`,
        body: mockRequestBody,
        establishmentId: user.establishment.uid,
        ...override,
      });

      return req;
    }

    beforeEach(() => {
      responsePayload = [{ data: 'someData' }, { data: 'someData2' }];
      stubGetUrl = sinon.stub(WorkerCertificateService.prototype, "requestUploadUrl").returns(responsePayload);
      res = httpMocks.createResponse();
    });

    it('should reply with a status of 200', async () => {
      const req = createReq();

      await qualificationCertificateRoute.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should wrap the response data in a files property', async () => {
      const req = createReq();

      await qualificationCertificateRoute.requestUploadUrl(req, res);

      const actual = await res._getJSONData();

      expect(actual).to.deep.equal({ files: responsePayload });
    });

    it('should reply with status 400 if an exception is thrown', async () => {
      const req = createReq({ body: {} });

      stubGetUrl.throws(new HttpError('Test message', 400))

      await qualificationCertificateRoute.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Test message');
    });
  });

  describe('confirmUpload', () => {
    const mockUploadFiles = [
      { filename: 'cert1.pdf', fileId: 'uuid1', etag: 'etag1', key: 'mockKey' },
      { filename: 'cert2.pdf', fileId: 'uuid2', etag: 'etag2', key: 'mockKey2' },
    ];

    let res;

    beforeEach(() => {
      stubConfirmUpload = sinon.stub(WorkerCertificateService.prototype, "confirmUpload").returns();
      sinon.stub(console, 'error'); // mute error log
      res = httpMocks.createResponse();
    });

    const createPutReq = (override) => {
      return createReq({ method: 'PUT', body: { files: mockUploadFiles }, ...override });
    };

    it('should reply with a status of 200 when no exception is thrown', async () => {
      const req = createPutReq();

      await qualificationCertificateRoute.confirmUpload(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should call workerCertificateService.confirmUpload with the correct parameter format', async () => {
      const req = createPutReq({ body: { files: ['fileName'] }, params: { id: 1, qualificationUid: 3 } });

      await qualificationCertificateRoute.confirmUpload(req, res);

      expect(stubConfirmUpload).to.have.been.calledWith(
        ['fileName'],
        3
      );
    })

    it('should reply with status code 400 when a HttpError is thrown with status code 400', async () => {
      const req = createPutReq();

      stubConfirmUpload.throws(new HttpError('Test exception 400', 400));

      await qualificationCertificateRoute.confirmUpload(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Test exception 400');
    });

    it('should reply with status code 500 when a HttpError is thrown with status code 500', async () => {
      const req = createPutReq();

      stubConfirmUpload.throws(new HttpError('Test exception 500', 500));

      await qualificationCertificateRoute.confirmUpload(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.equal('Test exception 500');
    });
  });

  describe('getPresignedUrlForCertificateDownload', () => {
    let res;
    let mockFileUid;
    let mockFileName;

    beforeEach(() => {
      responsePayload = {};
      stubPresignedCertificate = sinon.stub(WorkerCertificateService.prototype, "getPresignedUrlForCertificateDownload").returns(responsePayload);
      mockFileUid = 'mockFileUid';
      mockFileName = 'mockFileName';
      req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/establishment/${user.establishment.uid}/worker/${user.uid}/qualifications/${qualification.uid}/certificate/download`,
        body: { files: [{ uid: mockFileUid, filename: mockFileName }] },
        params: { id: user.establishment.uid, workerId: user.uid, qualificationUid: qualification.uid },
      });
      res = httpMocks.createResponse();
    });

    it('should reply with a status of 200 when no exception is thrown', async () => {
      await qualificationCertificateRoute.getPresignedUrlForCertificateDownload(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should call workerCertificateService.getPresignedUrlForCertificateDowload with the correct parameter format', async () => {
      await qualificationCertificateRoute.getPresignedUrlForCertificateDownload(req, res);

      expect(stubPresignedCertificate).to.have.been.calledWith(
        [{ uid: mockFileUid, filename: mockFileName }],
        user.establishment.uid,
        user.uid,
        qualification.uid,
        );
    });

    it('should return reply with status code 400 when a HttpError is thrown with status code 400', async () => {
      stubPresignedCertificate.throws(new HttpError('Test exception', 400));

      await qualificationCertificateRoute.getPresignedUrlForCertificateDownload(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Test exception');
    });

    it('should return reply with status code 500 when a HttpError is thrown with status code 500', async () => {
      stubPresignedCertificate.throws(new HttpError('Test exception', 500));

      await qualificationCertificateRoute.getPresignedUrlForCertificateDownload(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.equal('Test exception');
    });
  });

  describe('delete certificates', () => {
    let res;
    let mockFileUid1;
    let mockFileUid2;
    let mockFileUid3;

    let mockKey1;
    let mockKey2;
    let mockKey3;

    beforeEach(() => {
      mockFileUid1 = 'mockFileUid1';
      mockFileUid2 = 'mockFileUid2';
      mockFileUid3 = 'mockFileUid3';

      mockKey1 = `${user.establishment.uid}/${user.uid}/qualificationsCertificate/${qualification.uid}/${mockFileUid1}`;
      mockKey2 = `${user.establishment.uid}/${user.uid}/qualificationsCertificate/${qualification.uid}/${mockFileUid2}`;
      mockKey3 = `${user.establishment.uid}/${user.uid}/qualificationsCertificate/${qualification.uid}/${mockFileUid3}`;
      req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/establishment/${user.establishment.uid}/worker/${user.uid}/qualifications/${qualification.uid}/certificate/delete`,
        body: { files: [{ uid: mockFileUid1, filename: 'mockFileName1' }] },
        params: { id: user.establishment.uid, workerId: user.uid, qualificationUid: qualification.uid },
      });
      res = httpMocks.createResponse();
      errorMessage = 'DatabaseError';
      stubDeleteCertificates = sinon.stub(WorkerCertificateService.prototype, 'deleteCertificates');
    });

    it('should return a 200 status when no exceptions are thrown', async () => {
      await qualificationCertificateRoute.deleteCertificates(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should call workerCertificateService.deleteCertificates with the correct parameter format', async () => {
      await qualificationCertificateRoute.deleteCertificates(req, res);

      expect(stubDeleteCertificates).to.have.been.calledWith(
        [{ uid: mockFileUid1, filename: 'mockFileName1' }],
        user.establishment.uid,
        user.uid,
        qualification.uid
      );
    });

    describe('errors', () => {
      it('should return status code 400 when a HttpError is thrown with status code 400', async () => {
        stubDeleteCertificates.throws(new HttpError('Test exception', 400));

        await qualificationCertificateRoute.deleteCertificates(req, res);

        expect(res.statusCode).to.equal(400);
        expect(res._getData()).to.equal('Test exception');
      });

      it('should return status code 500 when a HttpError is thrown with status code 500', async () => {
        stubDeleteCertificates.throws(new HttpError('Test exception', 500));

        await qualificationCertificateRoute.deleteCertificates(req, res);

        expect(res.statusCode).to.equal(500);
        expect(res._getData()).to.equal('Test exception');
      });
    });
  });
});