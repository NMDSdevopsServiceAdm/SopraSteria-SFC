const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const sendInBlue = require('../../../../../../utils/email/sendInBlueEmail');

const {
  getTargetedEmailTemplates,
} = require('../../../../../../routes/admin/email-campaigns/targeted-emails/templates');

describe('templates.js', () => {
  describe('getTargetedEmailTemplates()', () => {
    let req;
    let res;

    beforeEach(() => {
      sinon.stub(sendInBlue, 'getTemplates').returns({
        count: 1,
        templates: [
          {
            id: 3,
            name: 'Email about something important',
            subject: 'Merry Christmas',
            isActive: false,
            testSent: false,
            sender: { name: 'John', email: 'john.smith@example.com', id: 23 },
            replyTo: 'replyto@domain.com',
            toField: '',
            tag: 'Festival',
            htmlContent: 'HTML CONTENT 1',
            createdAt: '2016-02-24T14:44:24.000Z',
            modifiedAt: '2016-02-24T15:37:11.000Z',
          },
        ],
      });

      req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/targeted-emails/templates',
        role: 'Admin',
      });

      res = httpMocks.createResponse();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return 200', async () => {
      await getTargetedEmailTemplates(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the templates from send in blue', async () => {
      const templates = {
        templates: [
          {
            id: 3,
            name: 'Email about something important',
          },
        ],
      };

      await getTargetedEmailTemplates(req, res);

      const response = res._getData();

      expect(response).to.deep.equal(templates);
    });

    it('should return an empty array if error thrown', async () => {
      sinon.restore();
      sinon.stub(sendInBlue, 'getTemplates').throws();

      const templates = {
        templates: [],
      };

      await getTargetedEmailTemplates(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal(templates);
    });
  });
});
