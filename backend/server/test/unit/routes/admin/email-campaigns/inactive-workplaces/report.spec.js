const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const report = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/report');
const inactiveWorkplacesReport = require('../../../../../../reports/inactive-workplaces/index')

describe('server/routes/admin/email-campaigns/inactive-workplaces/report', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should generate a report', async () => {
    sinon.stub(inactiveWorkplacesReport, 'generateInactiveWorkplacesReport').returns();

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/admin/email-campaigns/inactive-workplaces/report',
      query: { stopViewRefresh: false }
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();

    await report.generateReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
});
