const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const uuid = require('uuid');

const models = require('../../../../../models');
const buildUser = require('../../../../factories/user');
const { trainingBuilder } = require('../../../../factories/models');
const s3 = require('../../../../../routes/establishments/workerCertificate/s3');
const config = require('../../../../../config/config');

const trainingCertificateRoute = require('../../../../../routes/establishments/workerCertificate/trainingCertificate');

describe('backend/server/routes/establishments/workerCertificate/trainingCertificate.js', () => {
  const user = buildUser();
  const training = trainingBuilder();

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {});

  describe('requestUploadUrl', () => {
    const mockUploadFiles = ['cert1.pdf', 'cert2.pdf'];
    const mockSignedUrl = 'http://localhost/mock-upload-url';
    let res;

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
      res = httpMocks.createResponse();
    });

    it('should reply with a status of 200', async () => {
      const req = createReq();

      await trainingCertificateRoute.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should include a signed url for upload and a uuid for each file', async () => {
      const req = createReq();

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

      await trainingCertificateRoute.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Missing `files` param in request body');
    });

    it('should reply with status 400 if filename was missing in any of the files', async () => {
      const req = createReq({ body: { files: [{ filename: 'file1.pdf' }, { anotherItem: 'no file name' }] } });

      await trainingCertificateRoute.requestUploadUrl(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('Missing file name in request body');
    });

    describe('confirmUpload', () => {
      const mockUploadFiles = [
        { filename: 'cert1.pdf', fileId: 'uuid1', etag: 'etag1', key: 'mockKey' },
        { filename: 'cert2.pdf', fileId: 'uuid2', etag: 'etag2', key: 'mockKey2' },
      ];
      const mockWorkerFk = user.id;
      const mockTrainingRecord = { dataValues: { workerFk: user.id, id: training.id } };

      let stubAddCertificate;

      beforeEach(() => {
        sinon.stub(models.workerTraining, 'findOne').returns(mockTrainingRecord);
        sinon.stub(s3, 'verifyEtag').returns(true);
        stubAddCertificate = sinon.stub(models.trainingCertificates, 'addCertificate');
        sinon.stub(console, 'error'); // mute error log
      });

      const createPutReq = (override) => {
        return createReq({ method: 'PUT', body: { files: mockUploadFiles }, ...override });
      };

      it('should reply with a status of 200', async () => {
        const req = createPutReq();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(200);
      });

      it('should add a new record to database for each file', async () => {
        const req = createPutReq();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(stubAddCertificate).to.have.been.callCount(mockUploadFiles.length);

        mockUploadFiles.forEach((file) => {
          expect(stubAddCertificate).to.have.been.calledWith({
            trainingRecordId: training.id,
            workerFk: mockWorkerFk,
            filename: file.filename,
            fileId: file.fileId,
            key: file.key,
          });
        });
      });

      it('should reply with status 400 if file param was missing', async () => {
        const req = createPutReq({ body: {} });

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(400);
        expect(stubAddCertificate).not.to.be.called;
      });

      it(`should reply with status 400 if training record does not exist in database`, async () => {
        models.workerTraining.findOne.restore();
        sinon.stub(models.workerTraining, 'findOne').returns(null);

        const req = createPutReq();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(400);
        expect(stubAddCertificate).not.to.be.called;
      });

      it(`should reply with status 400 if etag from request does not match the etag on s3`, async () => {
        s3.verifyEtag.restore();
        sinon.stub(s3, 'verifyEtag').returns(false);

        const req = createPutReq();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(400);
        expect(stubAddCertificate).not.to.be.called;
      });

      it('should reply with status 400 if the file does not exist on s3', async () => {
        s3.verifyEtag.restore();
        sinon.stub(s3, 'verifyEtag').throws('403: UnknownError');

        const req = createPutReq();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(400);
        expect(stubAddCertificate).not.to.be.called;
      });

      it('should reply with status 500 if failed to add new certificate record to database', async () => {
        stubAddCertificate.throws('DatabaseError');

        const req = createPutReq();

        await trainingCertificateRoute.confirmUpload(req, res);

        expect(res.statusCode).to.equal(500);
      });
    });
  });

  describe('getPresignedUrlForCertificateDownload', () => {
    const mockSignedUrl = 'http://localhost/mock-download-url';
    let res;
    let mockFileUid;

    beforeEach(() => {
      getSignedUrlForDownloadSpy = sinon.stub(s3, 'getSignedUrlForDownload').returns(mockSignedUrl);
      mockFileUid = 'mockFileUid';
      req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/establishment/${user.establishment.uid}/worker/${user.uid}/training/${training.uid}/certificate/download`,
        body: { filesToDownload: [mockFileUid] },
        establishmentId: user.establishment.uid,
        params: { id: user.establishment.uid, workerId: user.uid, trainingUid: training.uid },
      });
      res = httpMocks.createResponse();
    });

    it('should reply with a status of 200', async () => {
      await trainingCertificateRoute.getPresignedUrlForCertificateDownload(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should return an array with signed url for download in response', async () => {
      await trainingCertificateRoute.getPresignedUrlForCertificateDownload(req, res);
      const actual = await res._getJSONData();

      expect(actual.files).to.deep.equal([{ signedUrl: mockSignedUrl }]);
    });

    it('should call getSignedUrlForDownload with bucket name from config', async () => {
      const bucketName = config.get('workerCertificate.bucketname');

      await trainingCertificateRoute.getPresignedUrlForCertificateDownload(req, res);
      expect(getSignedUrlForDownloadSpy.args[0][0].bucket).to.equal(bucketName);
    });

    it('should call getSignedUrlForDownload with key of formatted uids passed in params', async () => {
      await trainingCertificateRoute.getPresignedUrlForCertificateDownload(req, res);

      const expectedKey = `${req.params.id}/${req.params.workerId}/trainingCertificate/${req.params.trainingUid}/${mockFileUid}`;
      expect(getSignedUrlForDownloadSpy.args[0][0].key).to.equal(expectedKey);
    });

    it('should return 400 status and no files message if no file uids in req body', async () => {
      req.body = { filesToDownload: [] };

      await trainingCertificateRoute.getPresignedUrlForCertificateDownload(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('No files provided in request body');
      expect(getSignedUrlForDownloadSpy).not.to.be.called;
    });

    it('should return 400 status and no files message if no req body', async () => {
      req.body = {};

      await trainingCertificateRoute.getPresignedUrlForCertificateDownload(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.equal('No files provided in request body');
      expect(getSignedUrlForDownloadSpy).not.to.be.called;
    });
  });
});
