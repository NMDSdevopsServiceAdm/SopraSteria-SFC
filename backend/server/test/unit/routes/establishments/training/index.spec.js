const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const buildUser = require('../../../../factories/user');
const models = require('../../../../../models');
const Training = require('../../../../../models/classes/training').Training;
const { deleteTrainingRecord } = require('../../../../../routes/establishments/training/index');
const {
  mockTrainingRecordWithCertificates,
  mockTrainingRecordWithoutCertificates,
} = require('../../../mockdata/training');
const TrainingCertificateRoute = require('../../../../../routes/establishments/workerCertificate/trainingCertificate');
const WorkerCertificateService = require('../../../../../routes/establishments/workerCertificate/workerCertificateService');

describe('server/routes/establishments/training/index.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  const user = buildUser();

  describe('deleteTrainingRecord', () => {
    let req;
    let res;
    let stubFindTrainingRecord;
    let stubRestoredTrainingRecord;
    let stubDeleteTrainingCertificatesFromDatabase;
    let stubDestroyTrainingRecord;
    let workerUid = mockTrainingRecordWithCertificates.workerUid;
    let trainingUid = mockTrainingRecordWithCertificates.uid;
    let establishmentUid = user.establishment.uid;
    let trainingRecord;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'DELETE',
        url: `/api/establishment/${establishmentUid}/worker/${workerUid}/training/${trainingUid}/deleteTrainingRecord`,
        params: { trainingUid: trainingUid, workerId: workerUid, id: establishmentUid },
        establishmentId: '10',
      });
      res = httpMocks.createResponse();

      trainingRecord = new Training(establishmentUid, workerUid);

      stubRestoredTrainingRecord = sinon.stub(trainingRecord, 'restore');
      stubFindTrainingRecord = sinon.stub(models.workerTraining, 'findOne');
      stubDestroyTrainingRecord = sinon.stub(models.workerTraining, 'destroy');
      stubDeleteCertificates = sinon.stub(WorkerCertificateService.prototype, 'deleteCertificates');
    });

    it('should return with a status of 204 when the training record is deleted with training certificates', async () => {
      stubDeleteTrainingCertificatesFromDatabase.returns(true);
      stubDestroyTrainingRecord.returns(1);

      await deleteTrainingRecord(req, res);

      expect(res.statusCode).to.equal(204);
    });

    it('should return with a status of 204 when the training record is deleted with no training certificates', async () => {
      stubRestoredTrainingRecord.returns(mockTrainingRecordWithoutCertificates);
      stubFindTrainingRecord.returns(mockTrainingRecordWithoutCertificates);
      stubDestroyTrainingRecord.returns(1);

      await deleteTrainingRecord(req, res);

      expect(res.statusCode).to.equal(204);
    });

    describe('errors', () => {
      describe('restoring training record', () => {
        it('should return a 500 status code if there is an invalid training uid', async () => {
          req.params.trainingUid = 'mockTrainingUid';

          await deleteTrainingRecord(req, res);

          expect(res.statusCode).to.equal(500);
        });

        it('should return a 404 status code if there is an unknown worker uid', async () => {
          trainingRecord_workerUid = 'mockWorkerUid';

          await deleteTrainingRecord(req, res);

          const response = res._getData();

          expect(res.statusCode).to.equal(404);
          expect(response).to.equal('Not Found');
        });

        it('should return a 500 status code if there is an error loading the training record', async () => {
          stubRestoredTrainingRecord.returns(mockTrainingRecordWithCertificates);
          stubFindTrainingRecord.throws();

          await deleteTrainingRecord(req, res);

          expect(res.statusCode).to.equal(500);
        });
      });

      describe('deleting certificates', () => {
        it('should return with a status of 500 when there is an error deleting certificates from the database', async () => {
          stubRestoredTrainingRecord.returns(mockTrainingRecordWithCertificates);
          stubFindTrainingRecord.returns(mockTrainingRecordWithCertificates);
          stubDeleteTrainingCertificatesFromDatabase.returns(false);

          await deleteTrainingRecord(req, res);

          expect(res.statusCode).to.equal(500);
        });
      });

      describe('deleting training record', () => {
        it('should return with a status of 404 when there is an error deleting the training record from the database', async () => {
          stubRestoredTrainingRecord.returns(mockTrainingRecordWithCertificates);
          stubFindTrainingRecord.returns(mockTrainingRecordWithCertificates);
          stubDeleteTrainingCertificatesFromDatabase.returns(true);
          stubDestroyTrainingRecord.returns(0);

          await deleteTrainingRecord(req, res);

          const response = res._getData();

          expect(res.statusCode).to.equal(404);
          expect(response).to.equal('Not Found');
        });
      });
    });
  });
});
