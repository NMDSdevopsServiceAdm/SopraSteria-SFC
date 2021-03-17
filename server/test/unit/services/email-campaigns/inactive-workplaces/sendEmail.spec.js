const sinon = require('sinon');
const sendEmail = require('../../../../../services/email-campaigns/inactive-workplaces/sendEmail');
const sendInBlueEmail = require('../../../../../utils/email/sendInBlueEmail');
const moment = require('moment');

describe('server/routes/admin/email-campaigns/inactive-workplaces/sendEmail', () => {
  afterEach(() => {
    sinon.restore();
  });

  const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');
  const parentTemplateId = 15;

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

  it('should call sendEmails for parent workplaces', async () => {
    const parentWorkplace = {
      id: 1,
      name: 'Test Name',
      nmdsId: 'A1234567',
      lastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
      emailTemplate: {
        id: parentTemplateId,
        name: 'Parent',
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Test Person',
        email: 'test@example.com',
      },
      subsidiaries: [
        {
          id: 2,
          name: 'Workplace Name',
          nmdsId: 'A0045232',
          lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
          dataOwner: 'Parent',
        },
      ],
    };

    const sendEmailStub = sinon.stub(sendInBlueEmail, 'sendEmail').returns();

    await sendEmail.sendEmail(parentWorkplace);

    sinon.assert.calledWith(
      sendEmailStub,
      {
        email: 'test@example.com',
        name: 'Test Person',
      },
      15,
      {
        WORKPLACE_ID: 'A1234567',
        FULL_NAME: 'Test Person',
        SUBSIDIARIES: [
          {
            id: 2,
            name: 'Workplace Name',
            nmdsId: 'A0045232',
            lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
            dataOwner: 'Parent',
          },
        ],
      },
    );
  });
});
