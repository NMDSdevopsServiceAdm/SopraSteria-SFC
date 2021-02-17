const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const { generateReport } = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/report');

describe('server/routes/admin/email-campaigns/inactive-workplaces/report', () => {
  it('should generate a report', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/admin/email-campaigns/inactive-workplaces/report`,
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();

    await generateReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });
});
