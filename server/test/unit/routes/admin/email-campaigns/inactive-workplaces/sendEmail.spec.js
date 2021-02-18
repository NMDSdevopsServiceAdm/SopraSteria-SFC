const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const { sendGroupEmail } = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/sendEmail');

describe.only('server/routes/admin/email-campaigns/inactive-workplaces/sendEmail', () => {
  it('should send emails to inactive workplaces', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: `/api/admin/email-campaigns/inactive-workplaces/sendEmail`,
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();

    await sendGroupEmail(req, res);

    expect(res.statusCode).to.equal(200);
  });
});
