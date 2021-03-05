const sinon = require('sinon');
const sendEmail = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/sendEmail');
const sendInBlueEmail = require('../../../../../../utils/email/sendInBlueEmail');

describe('server/routes/admin/email-campaigns/inactive-workplaces/sendEmail', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should call sendEmails for inactive workplace', async () => {
    const inactiveWorkplace = {
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastUpdated: '2020-06-01',
      emailTemplateId: 13,
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
});
