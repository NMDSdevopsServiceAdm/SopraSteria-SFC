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
  let services;
  let stubs;
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    stubs = {};
    services = {
      qualifications: WorkerCertificateService.initialiseQualifications(),
      training: WorkerCertificateService.initialiseTraining(),
    };
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
      const result = await services.qualifications.requestUploadUrl(
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
        await services.qualifications.requestUploadUrl({ params: { id: 1, workerId: 2, recordUid: 3 } });
      } catch (err) {
        error = err;
      }

      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal('Missing `files` param in request body');
    });

    it('should throw a HttpError with status 400 if filename was missing in any of the files', async () => {
      try {
        await services.qualifications.requestUploadUrl(
          [{ filename: 'file1.pdf' }, { somethingElse: 'no file name' }],
          1,
          2,
          3,
        );
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

      await services.qualifications.confirmUpload(req.files, req.params.qualificationUid);

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
        await services.qualifications.confirmUpload(req.files, req.params.qualificationUid);
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
        await services.qualifications.confirmUpload(req.files, req.params.qualificationUid);
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
        await services.qualifications.confirmUpload(req.files, req.params.qualificationUid);
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
        await services.qualifications.confirmUpload(req.files, req.params.recordUid);
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
        await services.qualifications.confirmUpload(req.files, req.params.recordUid);
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
      sinon.stub(services.qualifications, 'getFileKeys').callsFake((workerUid, recordUid, fileIds) => {
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
      const actual = await services.qualifications.getPresignedUrlForCertificateDownload(
        req.files,
        req.params.establishmentUid,
        req.params.workerUid,
        req.params.recordUid,
      );

      expect(actual).to.deep.equal([{ signedUrl: mockSignedUrl, filename: mockFileName }]);
    });

    it('should call getSignedUrlForDownload with bucket name from config', async () => {
      const bucketName = config.get('workerCertificate.bucketname');

      await services.qualifications.getPresignedUrlForCertificateDownload(
        req.files,
        req.params.establishmentUid,
        req.params.workerUid,
        req.params.recordUid,
      );
      expect(getSignedUrlForDownloadSpy.args[0][0].bucket).to.equal(bucketName);
    });

    it('should call getSignedUrlForDownload with key of formatted uids passed in params', async () => {
      await services.qualifications.getPresignedUrlForCertificateDownload(
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
        await services.qualifications.getPresignedUrlForCertificateDownload(
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
      stubs.deleteCertificatesFromS3 = sinon.stub(s3, 'deleteCertificatesFromS3');
      stubs.deleteCertificate = sinon.stub(models.qualificationCertificates, 'deleteCertificate');
      stubs.countCertificatesToBeDeleted = sinon.stub(models.qualificationCertificates, 'countCertificatesToBeDeleted');

      sinon.stub(services.qualifications, 'getFileKeys').callsFake((workerUid, recordUid, fileIds) => {
        return fileIds.map((fileId) => ({
          uid: fileId,
          key: `${user.establishment.uid}/${workerUid}/qualificationCertificate/${recordUid}/${fileId}`,
        }));
      });
    });

    it('should delete certificate from S3', async () => {
      const bucketName = config.get('workerCertificate.bucketname');
      stubs.deleteCertificate.returns(1);
      stubs.deleteCertificatesFromS3.returns({ Deleted: [{ Key: mockKey1 }] });
      stubs.countCertificatesToBeDeleted.returns(1);

      await services.qualifications.deleteCertificates(
        req.files,
        req.params.establishmentUid,
        req.params.workerUid,
        req.params.recordUid,
      );

      expect(stubs.deleteCertificatesFromS3).to.be.calledWith({
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
          await services.qualifications.deleteCertificates(
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
        stubs.countCertificatesToBeDeleted.throws(errorMessage);
        let error;

        try {
          await services.qualifications.deleteCertificates(
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
        stubs.countCertificatesToBeDeleted.returns(3);
        stubs.deleteCertificate.throws(errorMessage);
        let error;

        try {
          await services.qualifications.deleteCertificates(
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

        stubs.countCertificatesToBeDeleted.returns(1);

        try {
          await services.qualifications.deleteCertificates(
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

  describe('deleteAllCertificates', () => {
    const trainingCertificatesReturnedFromDb = [
      { uid: 'abc123', key: 'abc123/trainingCertificate/dasdsa12312' },
      { uid: 'def456', key: 'def456/trainingCertificate/deass12092' },
      { uid: 'ghi789', key: 'ghi789/trainingCertificate/da1412342' },
    ];

    const qualificationCertificatesReturnedFromDb = [
      { uid: 'abc123', key: 'abc123/qualificationCertificate/dasdsa12312' },
      { uid: 'def456', key: 'def456/qualificationCertificate/deass12092' },
      { uid: 'ghi789', key: 'ghi789/qualificationCertificate/da1412342' },
    ];

    beforeEach(() => {
      stubs.getAllTrainingCertificatesForUser = sinon
        .stub(models.trainingCertificates, 'getAllCertificateRecordsForWorker')
        .resolves(trainingCertificatesReturnedFromDb);
      stubs.deleteTrainingCertificatesFromDb = sinon.stub(models.trainingCertificates, 'deleteCertificate');
      stubs.getAllQualificationCertificatesForUser = sinon
        .stub(models.qualificationCertificates, 'getAllCertificateRecordsForWorker')
        .resolves(qualificationCertificatesReturnedFromDb);
      stubs.deleteQualificationCertificatesFromDb = sinon.stub(models.qualificationCertificates, 'deleteCertificate');
      stubs.deleteCertificatesFromS3 = sinon.stub(s3, 'deleteCertificatesFromS3');
    });

    describe('Training:', () => {
      it('should get all certificates for user', async () => {
        const transaction = models.sequelize.transaction();
        await services.training.deleteAllCertificates(12345, transaction);

        expect(stubs.getAllTrainingCertificatesForUser).to.be.calledWith(12345);
      });

      it('should not make DB or S3 deletion calls if no training certificates found', async () => {
        stubs.getAllTrainingCertificatesForUser.resolves([]);

        const transaction = models.sequelize.transaction();
        await services.training.deleteAllCertificates(12345, transaction);

        expect(stubs.deleteTrainingCertificatesFromDb).to.not.have.been.called;
        expect(stubs.deleteCertificatesFromS3).to.not.have.been.called;
      });

      it('should call deleteCertificate on DB model with uids returned from getAllTrainingCertificateRecordsForWorker and pass in transaction', async () => {
        const transaction = await models.sequelize.transaction();
        await services.training.deleteAllCertificates(12345, transaction);

        expect(stubs.deleteTrainingCertificatesFromDb.args[0][0]).to.deep.equal([
          trainingCertificatesReturnedFromDb[0].uid,
          trainingCertificatesReturnedFromDb[1].uid,
          trainingCertificatesReturnedFromDb[2].uid,
        ]);

        expect(stubs.deleteTrainingCertificatesFromDb.args[0][1]).to.deep.equal(transaction);
      });

      it('should call deleteCertificatesFromS3 with keys returned from getAllTrainingCertificateRecordsForWorker', async () => {
        const bucketName = config.get('workerCertificate.bucketname');
        const transaction = await models.sequelize.transaction();

        await services.training.deleteAllCertificates(12345, transaction);

        expect(stubs.deleteCertificatesFromS3.args[0][0]).to.deep.equal({
          bucket: bucketName,
          objects: [
            { Key: trainingCertificatesReturnedFromDb[0].key },
            { Key: trainingCertificatesReturnedFromDb[1].key },
            { Key: trainingCertificatesReturnedFromDb[2].key },
          ],
        });
      });
    });

    describe('Qualifications:', () => {
      it('should get all certificates for user', async () => {
        const transaction = models.sequelize.transaction();
        await services.qualifications.deleteAllCertificates(12345, transaction);

        expect(stubs.getAllQualificationCertificatesForUser).to.be.calledWith(12345);
      });

      it('should not make DB or S3 deletion calls if no qualification certificates found', async () => {
        stubs.getAllQualificationCertificatesForUser.resolves([]);

        const transaction = models.sequelize.transaction();
        await services.qualifications.deleteAllCertificates(12345, transaction);

        expect(stubs.deleteQualificationCertificatesFromDb).to.not.have.been.called;
        expect(stubs.deleteCertificatesFromS3).to.not.have.been.called;
      });

      it('should call deleteCertificate on DB model with uids returned from getAllQualificationCertificateRecordsForWorker and pass in transaction', async () => {
        const transaction = await models.sequelize.transaction();
        await services.qualifications.deleteAllCertificates(12345, transaction);

        expect(stubs.deleteQualificationCertificatesFromDb.args[0][0]).to.deep.equal([
          qualificationCertificatesReturnedFromDb[0].uid,
          qualificationCertificatesReturnedFromDb[1].uid,
          qualificationCertificatesReturnedFromDb[2].uid,
        ]);

        expect(stubs.deleteQualificationCertificatesFromDb.args[0][1]).to.deep.equal(transaction);
      });

      it('should call deleteCertificatesFromS3 with keys returned from getAllQualificationCertificateRecordsForWorker', async () => {
        const bucketName = config.get('workerCertificate.bucketname');
        const transaction = await models.sequelize.transaction();

        await services.qualifications.deleteAllCertificates(12345, transaction);

        expect(stubs.deleteCertificatesFromS3.args[0][0]).to.deep.equal({
          bucket: bucketName,
          objects: [
            { Key: qualificationCertificatesReturnedFromDb[0].key },
            { Key: qualificationCertificatesReturnedFromDb[1].key },
            { Key: qualificationCertificatesReturnedFromDb[2].key },
          ],
        });
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

      const actual = await services.qualifications.getFileKeys(user.uid, qualification.uid, mockFileIds);
      expect(actual).to.deep.equal(mockRecords);
    });

    it('should throw an error if certificate records are not found', async () => {
      sinon.stub(models.qualificationCertificates, 'findAll').resolves([]);

      try {
        await services.qualifications.getFileKeys(user.uid, qualification.uid, mockFileIds);
      } catch (err) {
        error = err;
      }
      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal('Failed to find related qualification certificate records');
    });

    it('should throw an error if the number of certificate records found does not match the number of given ids', async () => {
      sinon.stub(models.qualificationCertificates, 'findAll').resolves(mockRecords.slice(0, 1));

      try {
        await services.qualifications.getFileKeys(user.uid, qualification.uid, mockFileIds);
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

      await services.qualifications.deleteCertificatesWithTransaction(mockCertificateRecords, mockExternalTransaction);

      expect(stubDeleteCertificate).to.have.been.calledWith({
        where: { uid: ['file-uid-1', 'file-uid-2', 'file-uid-3'] },
        transaction: mockExternalTransaction,
      });
    });

    it("should register a deleteCertificatesFromS3 call to the transaction's after commit hook", async () => {
      sinon.stub(models.qualificationCertificates, 'destroy');
      const stubDeleteCertificatesFromS3 = sinon.stub(services.qualifications, 'deleteCertificatesFromS3');
      const mockExternalTransaction = { mockTransaction: '', afterCommit: sinon.stub() };

      await services.qualifications.deleteCertificatesWithTransaction(mockCertificateRecords, mockExternalTransaction);

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
