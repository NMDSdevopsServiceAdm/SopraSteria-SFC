const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const targetedEmailsRoutes = require('../../../../../../routes/admin/email-campaigns/targeted-emails')

describe('server/routes/admin/email-campaigns/targeted-emails', () => {
    describe('getTargetedTotalEmails()', () => {
      it('should return 200', async () => {
        const req = httpMocks.createRequest({
          method: 'GET',
          url: '/api/admin/email-campaigns/targeted-emails',
        });

        req.role = 'Admin';
        req.query.groupType = 'primaryUsers';

        const res = httpMocks.createResponse();
        await targetedEmailsRoutes.getTargetedTotalEmails(req, res);

        expect(res.statusCode).to.deep.equal(200);
      });

      it('should return the total number of users', async () => {
        const req = httpMocks.createRequest({
          method: 'GET',
          url: '/api/admin/email-campaigns/targeted-emails',
        });

        req.role = 'Admin';
        req.query.groupType = 'primaryUsers';

        const res = httpMocks.createResponse();
        await targetedEmailsRoutes.getTargetedTotalEmails(req, res);

        const response = res._getData();

        expect(response.totalEmails).to.deep.equal(1500);
      })
    });
});
