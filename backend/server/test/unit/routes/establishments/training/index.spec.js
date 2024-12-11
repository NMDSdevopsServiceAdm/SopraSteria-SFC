const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const buildUser = require('../../../../factories/user');
const Training = require('../../../../../models/classes/training').Training;
const { deleteTrainingRecord } = require('../../../../../routes/establishments/training/index');
const {
  mockTrainingRecordWithCertificates,
  mockTrainingRecordWithoutCertificates,
} = require('../../../mockdata/training');
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
    let trainingRecord;
    let trainingCertificateService;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'DELETE',
        url: `/api/establishment/${establishmentUid}/worker/${workerUid}/training/${trainingUid}/deleteTrainingRecord`,
        params: { trainingUid: trainingUid, workerId: workerUid, id: establishmentUid },
        establishmentId: '10',
      });
      res = httpMocks.createResponse();

      trainingRecord = sinon.createStubInstance(Training);
      trainingRecord.restore.resolves(true);

      trainingCertificateService = {
        deleteCertificates: sinon.stub(),
      };
    });

    describe('With training certificates', () => {
      beforeEach(() => {
        trainingRecord.trainingCertificates = mockTrainingRecordWithCertificates.trainingCertificates;
        trainingRecord.delete.resolves(1);
      });

      it('should return with a status of 204', async () => {
        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        expect(res.statusCode).to.equal(204);
      });

      it('should call delete on training instance', async () => {
        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        expect(trainingRecord.delete).to.have.been.calledOnce;
      });

      it('should call deleteCertificates', async () => {
        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        expect(trainingCertificateService.deleteCertificates.calledOnce).to.be.true;
        expect(
          trainingCertificateService.deleteCertificates.calledWith(
            mockTrainingRecordWithCertificates.trainingCertificates,
            establishmentUid,
            workerUid,
            trainingUid,
          ),
        ).to.be.true;
      });
    });

    describe('Without training certificates', () => {
      beforeEach(() => {
        trainingRecord.trainingCertificates = null;
        trainingRecord.delete.resolves(1);
      });

      it('should return with a status of 204 when successful', async () => {
        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        expect(res.statusCode).to.equal(204);
      });

      it('should call delete on training instance', async () => {
        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        expect(trainingRecord.delete).to.have.been.calledOnce;
      });

      it('should not call deleteCertificates when no training certificates', async () => {
        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        expect(trainingCertificateService.deleteCertificates.called).to.be.false;
      });
    });

    describe('errors', () => {
      it('should pass through status code if one is provided', async () => {
        trainingRecord.restore.throws(new HttpError('Test error message', 123));

        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        expect(res.statusCode).to.equal(123);
      });

      it('should default to status code 500 if no error code is provided', async () => {
        trainingRecord.restore.throws(new Error());

        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        expect(res.statusCode).to.equal(500);
      });

      it('should return a 404 status code when failed to restore training (e.g. unknown worker uid)', async () => {
        trainingRecord.restore.resolves(false);

        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        const response = res._getData();

        expect(res.statusCode).to.equal(404);
        expect(response).to.equal('Not Found');
      });

      it('should return with a status of 404 when there is an error deleting the training record from the database', async () => {
        trainingRecord.restore.resolves(true);
        trainingRecord.delete.resolves(0);

        await deleteTrainingRecord(req, res, trainingRecord, trainingCertificateService);

        const response = res._getData();

        expect(res.statusCode).to.equal(404);
        expect(response).to.equal('Not Found');
      });
    });
  });
});
