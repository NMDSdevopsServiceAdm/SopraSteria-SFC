const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const buildUser = require('../../../../factories/user');
const models = require('../../../../../models');
const Qualifications = require('../../../../../models/classes/qualification').Qualification;
const { deleteQualificationRecord } = require('../../../../../routes/establishments/qualification/index');
const {
  mockQualificationsRecordWithCertificates,
  mockQualificationsRecordWithoutCertificates,
} = require('../../../mockdata/qualifications');
const QualificationCertificateRoute = require('../../../../../routes/establishments/workerCertificate/qualificationCertificate');
const WorkerCertificateService = require('../../../../../routes/establishments/workerCertificate/workerCertificateService');
const HttpError = require('../../../../../utils/errors/httpError');

describe('server/routes/establishments/qualifications/index.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  const user = buildUser();

  describe('deleteQualificationsRecord', () => {
    let req;
    let res;
    let stubFindQualificationsRecord;
    let stubRestoredQualificationsRecord;
    let stubDestroyQualificationsRecord;
    let workerUid = mockQualificationsRecordWithCertificates.workerUid;
    let qualificationsUid = mockQualificationsRecordWithCertificates.uid;
    let establishmentUid = user.establishment.uid;
    let qualificationsRecord;

    let stubs;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'DELETE',
        url: `/api/establishment/${establishmentUid}/worker/${workerUid}/qualifications/${qualificationsUid}/`,
        params: { qualificationsUid: qualificationsUid, workerId: workerUid, id: establishmentUid },
        establishmentId: '10',
      });
      res = httpMocks.createResponse();

      qualificationsRecord = new Qualifications(establishmentUid, workerUid);

      stubs = {
        qualificationsRecord: sinon.createStubInstance(Qualifications),
        restoreQualificationsRecord: sinon.stub(Qualifications.prototype, 'restore'),
        getWorkerCertificateServiceInstance: sinon.stub(WorkerCertificateService, 'initialiseQualifications').returns(new WorkerCertificateService()),
        destroyQualificationsRecord: sinon.stub(models.workerQualifications, 'destroy'),
        deleteCertificates: sinon.stub(WorkerCertificateService.prototype, 'deleteCertificates'),
      }
    });

    it('should return with a status of 204 when the qualifications record is deleted with qualifications certificates', async () => {
      stubs.restoreQualificationsRecord.returns(mockQualificationsRecordWithCertificates);
      stubs.destroyQualificationsRecord.returns(1);

      await deleteQualificationRecord(req, res);

      expect(res.statusCode).to.equal(204);
    });

    it('should return with a status of 204 when the qualifications record is deleted with no qualifications certificates', async () => {
      stubs.restoreQualificationsRecord.returns(mockQualificationsRecordWithoutCertificates);
      stubs.destroyQualificationsRecord.returns(1);

      await deleteQualificationRecord(req, res);

      expect(res.statusCode).to.equal(204);
    });

    describe('errors', () => {
      describe('restoring qualifications record', () => {
        it('should pass through status code if one is provided', async () => {
          stubs.restoreQualificationsRecord.throws(new HttpError('Test error message', 123));
          req.params.qualificationUid = 'mockQualificationId';

          await deleteQualificationRecord(req, res);

          expect(res.statusCode).to.equal(123);
        });

        it('should return a 404 status code if there is an unknown worker uid', async () => {
          qualificationsRecord_workerUid = 'mockWorkerUid';

          await deleteQualificationRecord(req, res);

          const response = res._getData();

          expect(res.statusCode).to.equal(404);
          expect(response).to.equal('Not Found');
        });

        it('should return a 500 status code if there is an error loading the qualifications record', async () => {
          stubs.restoreQualificationsRecord.throws();

          await deleteQualificationRecord(req, res);

          expect(res.statusCode).to.equal(500);
        });
      });

      describe('deleting qualifications record', () => {
        it('should return with a status of 404 when there is an error deleting the qualifications record from the database', async () => {
          stubs.restoreQualificationsRecord.returns(mockQualificationsRecordWithCertificates);
          stubs.destroyQualificationsRecord.returns(0);

          await deleteQualificationRecord(req, res);

          const response = res._getData();

          expect(res.statusCode).to.equal(404);
          expect(response).to.equal('Not Found');
        });
      });
    });
  });
});
