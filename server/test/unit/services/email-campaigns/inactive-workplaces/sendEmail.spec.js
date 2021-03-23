const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../../../../config/config');
const sendEmail = require('../../../../../services/email-campaigns/inactive-workplaces/sendEmail');
const sendInBlueEmail = require('../../../../../utils/email/sendInBlueEmail');

describe('server/routes/admin/email-campaigns/inactive-workplaces/sendEmail', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should call sendEmails for inactive workplace', async () => {
    const inactiveWorkplace = {
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastUpdated: '2020-06-01',
      emailTemplate: {
        id: 13,
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Test Name',
        email: 'test@example.com',
      },
    };

    const sendEmailStub = sinon.stub(sendInBlueEmail, 'sendEmail').returns();

    await sendEmail.sendEmail(inactiveWorkplace);

    sinon.assert.calledWith(
      sendEmailStub,
      {
        email: 'test@example.com',
        name: 'Test Name',
      },
      13,
      {
        WORKPLACE_ID: 'J1234567',
        FULL_NAME: 'Test Name',
      },
    );
  });

  describe('isWhitelisted', () => {
    it('should return true if there is no whitelist', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('');

      const whitelisted = sendEmail.isWhitelisted('test@test.com');

      expect(whitelisted).to.equal(true);
    });

    it('should return true if the email is whitelisted', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('test@test.com,name@name.com');

      const whitelisted = sendEmail.isWhitelisted('test@test.com');

      expect(whitelisted).to.equal(true);
    });

    it('should return false if the email is not whitelisted', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('test@test.com,name@name.com');

      const whitelisted = sendEmail.isWhitelisted('example@example.com');

      expect(whitelisted).to.equal(false);
    });
  });
});
