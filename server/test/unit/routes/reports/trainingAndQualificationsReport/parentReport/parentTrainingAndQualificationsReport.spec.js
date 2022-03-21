const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const excelJS = require('exceljs');
const models = require('../../../../../../models');

const parentTrainingAndQualificationsReport = require('../../../../../../routes/reports/trainingAndQualifications/parentReport/generateParentTrainingAndQualificationsReport');

describe('generateParentTrainingAndQualificationsReport', () => {
  beforeEach(() => {
    sinon.stub(models.establishment, 'findByUid').returns({ id: 1234 });

    sinon.stub(models.establishment, 'getEstablishmentTrainingRecords').callsFake(() => {
      return [];
    });

    sinon.stub(models.establishment, 'workersAndTraining').returns({
      count: 1,
      rows: [
        {
          id: 1234,
          name: 'Test',
          workers: [],
          get: () => {},
        },
      ],
    });

    sinon.stub(models.establishment, 'getWorkersWithCareCertificateStatus').returns([
      {
        workers: [],
        get: () => {},
      },
    ]);

    sinon.stub(models.establishment, 'getWorkerQualifications').returns([{ workers: [] }]);
  });

  afterEach(() => {
    sinon.restore();
  });

  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/api/report/trainingAndQualifications/parent/establishmentUid/report',
  });
  const res = httpMocks.createResponse();

  it('should return 200 status and an excel format', async () => {
    await parentTrainingAndQualificationsReport.generateParentTrainingAndQualificationsReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('should return 500 status when an error is thrown', async () => {
    sinon.stub(excelJS, 'Workbook').throws();

    await parentTrainingAndQualificationsReport.generateParentTrainingAndQualificationsReport(req, res);

    expect(res.statusCode).to.equal(500);
  });
});
