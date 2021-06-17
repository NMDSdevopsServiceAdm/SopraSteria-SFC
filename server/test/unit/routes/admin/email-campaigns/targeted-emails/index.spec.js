const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const targetedEmailsRoutes = require('../../../../../../routes/admin/email-campaigns/targeted-emails');
const sendInBlue = require('../../../../../../utils/email/sendInBlueEmail');
const models = require('../../../../../../models');
const { build, fake } = require('@jackfranklin/test-data-bot/build');
const sendEmail = require('../../../../../../services/email-campaigns/targeted-emails/sendEmail');

const user = build('User', {
  fields: {
    FullNameValue: fake((f) => f.name.findName()),
    email: fake((f) => f.internet.email()),
    establishment: {
      NameValue: fake((f) => f.lorem.sentence()),
      nmdsId: fake((f) => f.helpers.replaceSymbols('?#####'))
    }
  },
});

describe('server/routes/admin/email-campaigns/targeted-emails', () => {
  describe('getTargetedTotalEmails()', () => {
    beforeEach(() => {
      sinon.stub(models.user, 'allPrimaryUsers').returns([user, user, user]);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return 200', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/targeted-emails/total',
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
        url: '/api/admin/email-campaigns/targeted-emails/total',
      });

      req.role = 'Admin';
      req.query.groupType = 'primaryUsers';

      const res = httpMocks.createResponse();
      await targetedEmailsRoutes.getTargetedTotalEmails(req, res);

      const response = res._getData();

      expect(response.totalEmails).to.deep.equal(3);
    });
  });

  describe('getTargetedEmailTemplates()', () => {
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
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should return 200', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/targeted-emails/templates',
      });

      req.role = 'Admin';

      const res = httpMocks.createResponse();
      await targetedEmailsRoutes.getTargetedEmailTemplates(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the templates from send in blue', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/targeted-emails/templates',
      });

      req.role = 'Admin';

      const templates = {
        templates: [
          {
            id: 3,
            name: 'Email about something important',
          },
        ],
      };
      const res = httpMocks.createResponse();
      await targetedEmailsRoutes.getTargetedEmailTemplates(req, res);

      const response = res._getData();

      expect(response).to.deep.equal(templates);
    });

    it('should return an empty array if error thrown', async () => {
      sinon.restore();
      sinon.stub(sendInBlue, 'getTemplates').throws();

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/targeted-emails/templates',
      });

      req.role = 'Admin';

      const templates = {
        templates: [],
      };
      const res = httpMocks.createResponse();
      await targetedEmailsRoutes.getTargetedEmailTemplates(req, res);

      const response = res._getData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal(templates);
    });
  });

  describe('createTargetedEmailsCampaign()', () => {
    const mockUser = [
        {
          email: 'test@test.com',
          FullNameValue: 'John Smith',
          establishment: {
            nmdsId: 'H6765790',
            NameValue: 'Haven Care'
          },
          get: () => {
            return 'hello@gello.com';
          }
        },
      ];

    beforeEach(() => {
      sinon.stub(models.user, 'allPrimaryUsers').returns(mockUser);
      sinon.stub(sendEmail, 'sendEmail');
    });

    afterEach(()=> {
      sinon.restore();
    });

    it('should return 200', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/admin/email-campaigns/targeted-emails',
      });

      req.role = 'Admin';
      req.body.groupType = 'primaryUsers';
      req.body.templateId = '1';

      const res = httpMocks.createResponse();
      await targetedEmailsRoutes.createTargetedEmailsCampaign(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return a 503 on error', async () => {
      sinon.restore();
      sinon.stub(models.user, 'allPrimaryUsers').throws();
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/admin/email-campaigns/targeted-emails',
      });

      req.role = 'Admin';
      req.body.groupType = 'primaryUsers';
      req.body.templateId = '1';

      const res = httpMocks.createResponse();
      await targetedEmailsRoutes.createTargetedEmailsCampaign(req, res);

      expect(res.statusCode).to.deep.equal(503);
    });

    it('should create a targeted emails campaign', async () => {
      sinon.restore();
      const sendEmailMock = sinon.stub(sendEmail, 'sendEmail').returns();
      const allPrimaryUsers = sinon.stub(models.user, 'allPrimaryUsers').returns(mockUser);

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/admin/email-campaigns/targeted-emails',
      });

      req.role = 'Admin';
      req.body.groupType = 'primaryUsers';
      req.body.templateId = '1';

      const res = httpMocks.createResponse();
      await targetedEmailsRoutes.createTargetedEmailsCampaign(req, res);

      const response = res._getData();

      expect(response).to.deep.equal({ success: true });
      sinon.assert.called(allPrimaryUsers);
      sinon.assert.calledWith(sendEmailMock, mockUser[0]);
    });
  });
});
