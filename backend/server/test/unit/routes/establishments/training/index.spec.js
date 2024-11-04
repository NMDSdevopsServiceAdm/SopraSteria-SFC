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
const HttpError = require('../../../../../utils/errors/httpError');

describe('server/routes/establishments/training/index.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  const user = buildUser();

  describe('deleteTrainingRecord', () => {
    let req;
    let res;
    let workerUid = mockTrainingRecordWithCertificates.workerUid;
    let trainingUid = mockTrainingRecordWithCertificates.uid;
    let establishmentUid = user.establishment.uid;

    let stubs = {};

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'DELETE',
        url: `/api/establishment/${establishmentUid}/worker/${workerUid}/training/${trainingUid}/deleteTrainingRecord`,
        params: { trainingUid: trainingUid, workerId: workerUid, id: establishmentUid },
        establishmentId: '10',
      });
      res = httpMocks.createResponse();

      stubs = {
        trainingRecord: sinon.createStubInstance(Training),
        restoreTrainingRecord: sinon.stub(Training.prototype, 'restore'),
        getWorkerCertificateServiceInstance: sinon.stub(WorkerCertificateService, 'initialiseTraining').returns(new WorkerCertificateService()),
        deleteCertificates: sinon.stub(WorkerCertificateService.prototype, 'deleteCertificates'),
        destroyTrainingRecord: sinon.stub(models.workerTraining, 'destroy'),
      }
    });

    it('should return with a status of 204 when the training record is deleted with training certificates', async () => {
      stubs.restoreTrainingRecord.returns(mockTrainingRecordWithCertificates);
      stubs.destroyTrainingRecord.returns(1);

      await deleteTrainingRecord(req, res);

      expect(res.statusCode).to.equal(204);
    });

    it('should return with a status of 204 when the training record is deleted with no training certificates', async () => {
      stubs.restoreTrainingRecord.returns(mockTrainingRecordWithoutCertificates);
      stubs.destroyTrainingRecord.returns(1);

      await deleteTrainingRecord(req, res);

      expect(res.statusCode).to.equal(204);
    });

    describe('errors', () => {
      it('should pass through status code if one is provided', async () => {
        stubs.restoreTrainingRecord.throws(new HttpError('Test error message', 123));
        req.params.trainingUid = 'mockTrainingUid';

        await deleteTrainingRecord(req, res);

        const response = res._getData();

        expect(res.statusCode).to.equal(123);
        expect(response).to.equal('Test error message');
      });

      it('should default to status code 500 if no error code is provided', async () => {
        stubs.restoreTrainingRecord.throws(new Error());
        req.params.trainingUid = 'mockTrainingUid';

        await deleteTrainingRecord(req, res);

        expect(res.statusCode).to.equal(500);
      });

      describe('restoring training record', () => {
        it('should return a 404 status code if there is an unknown worker uid', async () => {
          trainingRecord_workerUid = 'mockWorkerUid';

          await deleteTrainingRecord(req, res);

          const response = res._getData();

          expect(res.statusCode).to.equal(404);
          expect(response).to.equal('Not Found');
        });
      });

      describe('deleting training record', () => {
        it('should return with a status of 404 when there is an error deleting the training record from the database', async () => {
          stubs.destroyTrainingRecord.returns(0);

          await deleteTrainingRecord(req, res);

          const response = res._getData();

          expect(res.statusCode).to.equal(404);
          expect(response).to.equal('Not Found');
        });
      });
    });
  });
});
