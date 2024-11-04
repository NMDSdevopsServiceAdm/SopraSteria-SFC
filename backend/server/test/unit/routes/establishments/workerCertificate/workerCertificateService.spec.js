const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const uuid = require('uuid');

const models = require('../../../../../models');
const buildUser = require('../../../../factories/user');
const { qualificationBuilder } = require('../../../../factories/models');
const s3 = require('../../../../../routes/establishments/workerCertificate/s3');
const config = require('../../../../../config/config');

const WorkerCertificateService = require('../../../../../routes/establishments/workerCertificate/workerCertificateService');

describe('backend/server/routes/establishments/workerCertificate/workerCertificateService.js', () => {
  const user = buildUser();
  const qualification = qualificationBuilder();
  let service;

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    service = WorkerCertificateService.initialiseQualifications();
  });

  describe('requestUploadUrl', () => {
    const mockUploadFiles = ['cert1.pdf', 'cert2.pdf'];
    const mockSignedUrl = 'http://localhost/mock-upload-url';
    let res;

    beforeEach(() => {
      mockRequestBody = {
        files: [{ filename: 'cert1.pdf' }, { filename: 'cert2.pdf' }],
        params: { id: 1, workerId: 2, recordUid: 3 },
      };
      sinon.stub(s3, 'getSignedUrlForUpload').returns(mockSignedUrl);
    });

    it('should include a signed url for upload and a uuid for each file', async () => {
      const result = await service.requestUploadUrl(
        mockRequestBody.files,
        mockRequestBody.establishmentUid,
        mockRequestBody.workerUid,
        mockRequestBody.recordUid,
      );

      expect(result).to.have.lengthOf(mockUploadFiles.length);

      result.forEach((file) => {
        const { fileId, filename, signedUrl } = file;
        expect(uuid.validate(fileId)).to.be.true;
        expect(filename).to.be.oneOf(mockUploadFiles);
        expect(signedUrl).to.equal(mockSignedUrl);
      });
    });

    it('should throw a HttpError with status 400 if files param was missing in body', async () => {
      let error;

      try {
        await service.requestUploadUrl({ params: { id: 1, workerId: 2, recordUid: 3 } });
      } catch (err) {
        error = err;
      }

      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal('Missing `files` param in request body');
    });

    it('should throw a HttpError with status 400 if filename was missing in any of the files', async () => {
      try {
        await service.requestUploadUrl([{ filename: 'file1.pdf' }, { somethingElse: 'no file name' }], 1, 2, 3);
      } catch (err) {
        error = err;
      }

      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal('Missing file name in request body');
    });
  });

  describe('confirmUpload', () => {
    const mockUploadFiles = [
      { filename: 'cert1.pdf', fileId: 'uuid1', etag: 'etag1', key: 'mockKey' },
      { filename: 'cert2.pdf', fileId: 'uuid2', etag: 'etag2', key: 'mockKey2' },
    ];
    const mockWorkerFk = user.id;
    const mockQualificationRecord = { dataValues: { workerFk: user.id, id: qualification.id } };

    let stubAddCertificate;

    beforeEach(() => {
      stubWorkerQualifications = sinon.stub(models.workerQualifications, 'findOne').returns(mockQualificationRecord);
      sinon.stub(s3, 'verifyEtag').returns(true);
      stubAddCertificate = sinon.stub(models.qualificationCertificates, 'addCertificate');
      sinon.stub(console, 'error'); // mute error log
    });

    createReq = (override) => {
      return { files: mockUploadFiles, params: { establishmentUid: 1, workerId: 2, recordUid: 3 }, ...override };
    };

    it('should add a new record to database for each file', async () => {
      const req = createReq();

      await service.confirmUpload(req.files, req.params.qualificationUid);

      expect(stubAddCertificate).to.have.been.callCount(mockUploadFiles.length);

      mockUploadFiles.forEach((file) => {
        expect(stubAddCertificate).to.have.been.calledWith({
          recordId: qualification.id,
          workerFk: mockWorkerFk,
          filename: file.filename,
          fileId: file.fileId,
          key: file.key,
        });
      });
    });

    it('should reply with status 400 if file param was missing', async () => {
      const req = createReq({ files: [] });
      let error;
      try {
        await service.confirmUpload(req.files, req.params.qualificationUid);
      } catch (err) {
        error = err;
      }
      expect(error.statusCode).to.equal(400);
      expect(stubAddCertificate).not.to.be.called;
    });

    it(`should reply with status 400 if qualification record does not exist in database`, async () => {
      models.workerQualifications.findOne.restore();
      sinon.stub(models.workerQualifications, 'findOne').returns(null);

      const req = createReq();
      let error;

      try {
        await service.confirmUpload(req.files, req.params.qualificationUid);
      } catch (err) {
        error = err;
      }
      expect(error.statusCode).to.equal(400);
      expect(stubAddCertificate).not.to.be.called;
    });

    it(`should reply with status 400 if etag from request does not match the etag on s3`, async () => {
      s3.verifyEtag.restore();
      sinon.stub(s3, 'verifyEtag').returns(false);

      const req = createReq();
      let error;

      try {
        await service.confirmUpload(req.files, req.params.qualificationUid);
      } catch (err) {
        error = err;
      }

      expect(error.statusCode).to.equal(400);
      expect(stubAddCertificate).not.to.be.called;
    });

    it('should reply with status 400 if the file does not exist on s3', async () => {
      s3.verifyEtag.restore();
      sinon.stub(s3, 'verifyEtag').throws('403: UnknownError');

      const req = createReq();
      let error;

      try {
        await service.confirmUpload(req.files, req.params.recordUid);
      } catch (err) {
        error = err;
      }

      expect(error.statusCode).to.equal(400);
      expect(stubAddCertificate).not.to.be.called;
    });

    it('should reply with status 500 if failed to add new certificate record to database', async () => {
      stubAddCertificate.throws('DatabaseError');

      const req = createReq();
      let error;

      try {
        await service.confirmUpload(req.files, req.params.recordUid);
      } catch (err) {
        error = err;
      }

      expect(error.statusCode).to.equal(500);
    });
  });

  describe('getPresignedUrlForCertificateDownload', () => {
    const mockSignedUrl = 'http://localhost/mock-download-url';
    let res;
    let mockFileUid;
    let mockFileName;

    beforeEach(() => {
      getSignedUrlForDownloadSpy = sinon.stub(s3, 'getSignedUrlForDownload').returns(mockSignedUrl);
      sinon.stub(service, 'getFileKeys').callsFake((workerUid, recordUid, fileIds) => {
        return fileIds.map((fileId) => ({
          uid: fileId,
          key: `${user.establishment.uid}/${workerUid}/qualificationCertificate/${recordUid}/${fileId}`,
        }));
      });

      mockFileUid = 'mockFileUid';
      mockFileName = 'mockFileName';
      req = {
        files: [{ uid: mockFileUid, filename: mockFileName }],
        params: { establishmentUid: user.establishment.uid, workerUid: user.uid, recordUid: qualification.uid },
      };
    });

    it('should return an array with signed url for download and file name in response', async () => {
      const actual = await service.getPresignedUrlForCertificateDownload(
        req.files,
        req.params.establishmentUid,
        req.params.workerUid,
        req.params.recordUid,
      );

      expect(actual).to.deep.equal([{ signedUrl: mockSignedUrl, filename: mockFileName }]);
    });

    it('should call getSignedUrlForDownload with bucket name from config', async () => {
      const bucketName = config.get('workerCertificate.bucketname');

      await service.getPresignedUrlForCertificateDownload(
        req.files,
        req.params.establishmentUid,
        req.params.workerUid,
        req.params.recordUid,
      );
      expect(getSignedUrlForDownloadSpy.args[0][0].bucket).to.equal(bucketName);
    });

    it('should call getSignedUrlForDownload with key of formatted uids passed in params', async () => {
      await service.getPresignedUrlForCertificateDownload(
        req.files,
        req.params.establishmentUid,
        req.params.workerUid,
        req.params.recordUid,
      );

      const expectedKey = `${req.params.establishmentUid}/${req.params.workerUid}/qualificationCertificate/${req.params.recordUid}/${mockFileUid}`;
      expect(getSignedUrlForDownloadSpy.args[0][0].key).to.equal(expectedKey);
    });

    it('should return 400 status and no files message if no files provided in file parameter', async () => {
      req.files = [];

      let error;
      try {
        await service.getPresignedUrlForCertificateDownload(
          req.files,
          req.params.establishmentUid,
          req.params.workerUid,
          req.params.recordUid,
        );
      } catch (err) {
        error = err;
      }

      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal('No files provided in request body');
      expect(getSignedUrlForDownloadSpy).not.to.be.called;
    });
  });

  describe('delete certificates', () => {
    let stubDeleteCertificatesFromS3;
    let stubDeleteCertificate;
    let errorMessage;
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

      mockKey1 = `${user.establishment.uid}/${user.uid}/qualificationCertificate/${qualification.uid}/${mockFileUid1}`;
      mockKey2 = `${user.establishment.uid}/${user.uid}/qualificationCertificate/${qualification.uid}/${mockFileUid2}`;
      mockKey3 = `${user.establishment.uid}/${user.uid}/qualificationCertificate/${qualification.uid}/${mockFileUid3}`;
      req = httpMocks.createRequest({
        files: [{ uid: mockFileUid1, filename: 'mockFileName1' }],
        params: { establishmentUid: user.establishment.uid, workerUid: user.uid, recordUid: qualification.uid },
      });
      errorMessage = 'DatabaseError';
      stubDeleteCertificatesFromS3 = sinon.stub(s3, 'deleteCertificatesFromS3');
      stubDeleteCertificate = sinon.stub(models.qualificationCertificates, 'deleteCertificate');
      stubCountCertificatesToBeDeleted = sinon.stub(models.qualificationCertificates, 'countCertificatesToBeDeleted');

      sinon.stub(service, 'getFileKeys').callsFake((workerUid, recordUid, fileIds) => {
        return fileIds.map((fileId) => ({
          uid: fileId,
          key: `${user.establishment.uid}/${workerUid}/qualificationCertificate/${recordUid}/${fileId}`,
        }));
      });
    });

    it('should delete certificate from S3', async () => {
      const bucketName = config.get('workerCertificate.bucketname');
      stubDeleteCertificate.returns(1);
      stubDeleteCertificatesFromS3.returns({ Deleted: [{ Key: mockKey1 }] });
      stubCountCertificatesToBeDeleted.returns(1);

      await service.deleteCertificates(
        req.files,
        req.params.establishmentUid,
        req.params.workerUid,
        req.params.recordUid,
      );

      expect(stubDeleteCertificatesFromS3).to.be.calledWith({
        bucket: bucketName,
        objects: [
          {
            Key: `${req.params.establishmentUid}/${req.params.workerUid}/qualificationCertificate/${req.params.recordUid}/${mockFileUid1}`,
          },
        ],
      });
    });

    describe('errors', () => {
      it('should throw a HttpError with status code 400 and message if no files in req body', async () => {
        req.files = [];
        let error;

        try {
          await service.deleteCertificates(
            req.files,
            req.params.establishmentUid,
            req.params.workerUid,
            req.params.recordUid,
          );
        } catch (err) {
          error = err;
        }

        expect(error.statusCode).to.equal(400);
        expect(error.message).to.equal('No files provided in request body');
      });

      it('should throw a HttpError with status code 500 if there was a database error when calling countCertificatesToBeDeleted', async () => {
        req.files = [
          { uid: mockFileUid1, filename: 'mockFileName1' },
          { uid: mockFileUid2, filename: 'mockFileName2' },
          { uid: mockFileUid3, filename: 'mockFileName3' },
        ];
        stubCountCertificatesToBeDeleted.throws(errorMessage);
        let error;

        try {
          await service.deleteCertificates(
            req.files,
            req.params.establishmentUid,
            req.params.workerUid,
            req.params.recordUid,
          );
        } catch (err) {
          error = err;
        }

        expect(error.statusCode).to.equal(500);
      });

      it('should throw a HttpError with status code 500 if there was a database error on DB deleteCertificate call', async () => {
        req.files = [
          { uid: mockFileUid1, filename: 'mockFileName1' },
          { uid: mockFileUid2, filename: 'mockFileName2' },
          { uid: mockFileUid3, filename: 'mockFileName3' },
        ];
        stubCountCertificatesToBeDeleted.returns(3);
        stubDeleteCertificate.throws(errorMessage);
        let error;

        try {
          await service.deleteCertificates(
            req.files,
            req.params.establishmentUid,
            req.params.workerUid,
            req.params.recordUid,
          );
        } catch (err) {
          error = err;
        }

        expect(error.statusCode).to.equal(500);
      });

      it('should throw a HttpError with status code 400 if the number of records in database does not match request', async () => {
        req.files = [
          { uid: mockFileUid1, filename: 'mockFileName1' },
          { uid: mockFileUid2, filename: 'mockFileName2' },
          { uid: mockFileUid3, filename: 'mockFileName3' },
        ];

        stubCountCertificatesToBeDeleted.returns(1);

        try {
          await service.deleteCertificates(
            req.files,
            req.params.establishmentUid,
            req.params.workerUid,
            req.params.recordUid,
          );
        } catch (err) {
          error = err;
        }

        expect(error.statusCode).to.equal(400);
        expect(error.message).to.equal('Invalid request');
      });
    });
  });

  describe('getFileKeys', () => {
    const mockFileIds = ['mock-file-id-1', 'mock-file-id-2', 'mock-file-id-3'];
    const mockRecords = [
      { uid: 'mock-file-id-1', key: 'file-key-formock-file-id-1' },
      { uid: 'mock-file-id-2', key: 'file-key-formock-file-id-2' },
      { uid: 'mock-file-id-3', key: 'file-key-formock-file-id-3' },
    ];

    it('should return an array that contain every key for the given certificate records', async () => {
      sinon.stub(models.qualificationCertificates, 'findAll').resolves(mockRecords);

      const actual = await service.getFileKeys(user.uid, qualification.uid, mockFileIds);
      expect(actual).to.deep.equal(mockRecords);
    });

    it('should throw an error if certificate records are not found', async () => {
      sinon.stub(models.qualificationCertificates, 'findAll').resolves([]);

      try {
        await service.getFileKeys(user.uid, qualification.uid, mockFileIds);
      } catch (err) {
        error = err;
      }
      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal('Failed to find related qualification certificate records');
    });

    it('should throw an error if the number of certificate records found does not match the number of given ids', async () => {
      sinon.stub(models.qualificationCertificates, 'findAll').resolves(mockRecords.slice(0, 1));

      try {
        await service.getFileKeys(user.uid, qualification.uid, mockFileIds);
      } catch (err) {
        error = err;
      }
      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal('Failed to find related qualification certificate records');
    });
  });

  describe('deleteCertificatesWithTransaction', () => {
    afterEach(() => {
      sinon.restore();
    });

    const mockCertificateRecords = [
      new models.qualificationCertificates({ key: 'file-key-1', uid: 'file-uid-1' }),
      new models.qualificationCertificates({ key: 'file-key-2', uid: 'file-uid-2' }),
      new models.qualificationCertificates({ key: 'file-key-3', uid: 'file-uid-3' }),
    ];

    it('should delete every certificate records that are passed in', async () => {
      const stubDeleteCertificate = sinon.stub(models.qualificationCertificates, 'destroy');
      const mockExternalTransaction = { mockTransaction: '', afterCommit: sinon.stub() };

      await service.deleteCertificatesWithTransaction(mockCertificateRecords, mockExternalTransaction);

      expect(stubDeleteCertificate).to.have.been.calledWith({
        where: { uid: ['file-uid-1', 'file-uid-2', 'file-uid-3'] },
        transaction: mockExternalTransaction,
      });
    });

    it("should register a deleteCertificatesFromS3 call to the transaction's after commit hook", async () => {
      sinon.stub(models.qualificationCertificates, 'destroy');
      const stubDeleteCertificatesFromS3 = sinon.stub(service, 'deleteCertificatesFromS3');
      const mockExternalTransaction = { mockTransaction: '', afterCommit: sinon.stub() };

      await service.deleteCertificatesWithTransaction(mockCertificateRecords, mockExternalTransaction);

      expect(mockExternalTransaction.afterCommit).to.have.been.called;

      // emulate the afterCommit call being triggered when database operation complete;
      const registeredCall = mockExternalTransaction.afterCommit.args[0][0];
      registeredCall();

      expect(stubDeleteCertificatesFromS3).to.have.been.calledWith([
        { Key: 'file-key-1' },
        { Key: 'file-key-2' },
        { Key: 'file-key-3' },
      ]);
    });
  });
});
