const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const excelJS = require('exceljs');
const models = require('../../../../../models');

const trainingAndQualificationsReport = require('../../../../../routes/reports/trainingAndQualifications/generateTrainingAndQualificationsReport');

const getMockWorkersAndTrainingResponse = () => {
  const mockWorkersAndTrainingResponse = {
    get() {},
  };

  sinon
    .stub(mockWorkersAndTrainingResponse, 'get')
    .withArgs('trainingCount')
    .returns('1')
    .withArgs('qualificationCount')
    .returns('3')
    .withArgs('expiredTrainingCount')
    .returns('5')
    .withArgs('expiringTrainingCount')
    .returns('31')
    .withArgs('missingMandatoryTrainingCount')
    .returns('12');

  return mockWorkersAndTrainingResponse;
};

describe('generateTrainingAndQualificationsReport', () => {
  beforeEach(() => {
    sinon.stub(models.establishment, 'findByUid').callsFake(() => {
      return { id: 1234 };
    });
    sinon.stub(models.worker, 'workersAndTraining').callsFake(() => {
      return [getMockWorkersAndTrainingResponse()];
    });
    sinon.stub(models.workerQualifications, 'getWorkerQualifications').callsFake(() => {
      return [];
    });
    sinon.stub(models.worker, 'getWorkersWithCareCertificateStatus').callsFake(() => {
      return [];
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/api/report/trainingAndQualifications/establishmentUid/report',
  });
  const res = httpMocks.createResponse();

  it('should return 200 status and an excel format', async () => {
    await trainingAndQualificationsReport.generateTrainingAndQualificationsReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('should return 500 status when an error is thrown', async () => {
    sinon.stub(excelJS, 'Workbook').throws();

    await trainingAndQualificationsReport.generateTrainingAndQualificationsReport(req, res);

    expect(res.statusCode).to.equal(500);
  });
});
