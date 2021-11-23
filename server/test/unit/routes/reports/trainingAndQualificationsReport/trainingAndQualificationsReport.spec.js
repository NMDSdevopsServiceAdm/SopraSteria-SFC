const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const excelJS = require('exceljs');
const models = require('../../../../../models');

const trainingAndQualificationsReport = require('../../../../../routes/reports/trainingAndQualifications/generateTrainingAndQualificationsReport');

describe('generateTrainingAndQualificationsReport', () => {
  beforeEach(() => {
    sinon.stub(models.establishment, 'findByUid').returns({ id: 1234 });

    sinon.stub(models.establishment, 'workersAndTraining').returns([
      {
        id: 1234,
        name: 'Test',
        workers: [],
        get: () => {},
      },
    ]);
    sinon.stub(models.establishment, 'getEstablishmentTrainingRecords').callsFake(() => {
      return [];
    });
    sinon.stub(models.establishment, 'getWorkerQualifications').returns([{ workers: [] }]);
    sinon.stub(models.establishment, 'getWorkersWithCareCertificateStatus').returns([
      {
        workers: [],
        get: () => {},
      },
    ]);
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
