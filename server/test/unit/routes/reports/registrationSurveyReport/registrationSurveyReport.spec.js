const expect = require('chai').expect;
// const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const registrationSurveyReport = require('../../../../../routes/reports/registrationSurveyReport/report');
// const models = require('../../../../../models');

// const { rawDataBuilder } = require('../../../../factories/deleteReport/deleteReport');

describe('/server/routes/reports/registrationSurveyReport/report', () => {
    // beforeEach(() => {
    //   sinon.stub(models.pcodedata, 'getCssrFromPostcode').callsFake(async () => {
    //     return {};
    //   });
    // });
    // afterEach(() => {
    //   sinon.restore();
    // });

  it('should return status 200 and an excel format', async () => {
    // sinon.stub(models.establishment, 'generateDeleteReportData').callsFake(async () => {
    //   return [rawDataBuilder(), rawDataBuilder(), rawDataBuilder()];
    // });
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/report/registrationSurveyReport/report',
    });
    const res = httpMocks.createResponse();

    await registrationSurveyReport.generateReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });
});
