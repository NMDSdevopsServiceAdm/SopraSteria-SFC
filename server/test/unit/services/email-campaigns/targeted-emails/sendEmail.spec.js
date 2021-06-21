const expect = require('chai').expect;
const sinon = require('sinon');

const sendEmail = require('../../../../../services/email-campaigns/targeted-emails/sendEmail');
const sendInBlueEmail = require('../../../../../utils/email/sendInBlueEmail');
const isWhitelisted = require('../../../../../services/email-campaigns/isWhitelisted');

describe('server/routes/admin/email-campaigns/targeted-emails/sendEmail', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('sendEmail', () => {
    it('should call sendEmails for primary users', async () => {
      const user = {
        email: 'test@test.com',
        FullNameValue: 'Test Name',
        establishment: {
          nmdsId: 'J1234567',
          NameValue: 'Haven Care'
        },
        get: () => {
          return 'test@test.com';
        }
      };
      const templateId = 1;

      const isWhitelistedStub = sinon.stub(isWhitelisted, 'isWhitelisted').returns(true);

      const sendEmailStub = sinon.stub(sendInBlueEmail, 'sendEmail').returns();

      await sendEmail.sendEmail(user, templateId);

      sinon.assert.calledWith(
        isWhitelistedStub,
        'test@test.com'
      )
      sinon.assert.calledWith(
        sendEmailStub,
        {
          email: 'test@test.com',
          name: 'Test Name',
        },
        1,
        {
          FULL_NAME: 'Test Name',
          WORKPLACE_ID: 'J1234567',
        },
      );
    });
  });

  describe('getParams', () => {
    it('returns the right params for primary users', () => {
      const user = {
        FullNameValue: 'Test Name',
        dataValues: {
          email: 'test@example.com',
        },
        establishment: {
          nmdsId: 'J1234567',
        },
      };

      const params = sendEmail.getParams(user);
      expect(params).to.deep.equal({
        FULL_NAME: 'Test Name',
        WORKPLACE_ID: 'J1234567',
      });
    });
  });
});
