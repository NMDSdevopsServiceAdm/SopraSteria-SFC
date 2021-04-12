const SibApiV3Sdk = require('sib-api-v3-sdk');
const sinon = require('sinon');
const { sendEmail } = require('../../../../utils/email/sendInBlueEmail')

describe('sendInBlueEmail', async () => {
  afterEach(() => {
    sinon.restore();
  });

  it('sends an email', async () => {
    const sendTransacEmail = sinon.stub();
    sinon.stub(SibApiV3Sdk, 'TransactionalEmailsApi').returns({
      sendTransacEmail,
    });

    const to = {
      name: "test",
      email: 'test@test.com'
    };
    const templateId = 2;
    const params = {
      firstName: 'Test',
    };

    await sendEmail(to, templateId, params);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{
      name: "test",
      email: "test@test.com",
    }];
    sendSmtpEmail.templateId = 2;
    sendSmtpEmail.params = {
      firstName: 'Test',
    };

    sinon.assert.calledWith(sendTransacEmail, sendSmtpEmail);
  })
});
