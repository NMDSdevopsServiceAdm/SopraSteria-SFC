const expect = require('chai').expect;
const moment = require('moment');
const sinon = require('sinon');

const models = require('../../../../../models');
const findInactiveWorkplaces = require('../../../../../services/email-campaigns/inactive-workplaces/findInactiveWorkplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces', () => {
  afterEach(() => {
    sinon.restore();
  });

  const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');
  const sixMonthTemplateId = 13;
  const twelveMonthTemplateId = 14;
  const eighteenMonthTemplateId = 10;
  const twentyFourMonthTemplateId = 12;

  const dummyInactiveWorkplaces = [
    {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
      emailTemplate: {
        id: sixMonthTemplateId,
        name: '6 months',
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Test Name',
        email: 'test@example.com',
      },
    },
    {
      id: 479,
      name: 'Second Workplace Name',
      nmdsId: 'A0012345',
      lastLogin: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
      emailTemplate: {
        id: twelveMonthTemplateId,
        name: '12 months',
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Name McName',
        email: 'name@mcname.com',
      },
    },
  ];

  it('should return inactive workplaces', async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
        LastTemplate: null,
      },
      {
        EstablishmentID: 479,
        NameValue: 'Second Workplace Name',
        NmdsID: 'A0012345',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Name McName',
        PrimaryUserEmail: 'name@mcname.com',
        LastLogin: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
        LastTemplate: null,
      },
    ]);

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();
    // console.log('**************');
    // console.log(inactiveWorkplaces);
    expect(inactiveWorkplaces).to.deep.equal(dummyInactiveWorkplaces);
  });

  [
    {
      inactiveMonths: 6,
      LastLogin: endOfLastMonth.clone().subtract(6, 'months'),
      LastTemplate: sixMonthTemplateId,
    },
    {
      inactiveMonths: 12,
      LastLogin: endOfLastMonth.clone().subtract(12, 'months'),
      LastTemplate: twelveMonthTemplateId,
    },
    {
      inactiveMonths: 18,
      LastLogin: endOfLastMonth.clone().subtract(18, 'months'),
      LastTemplate: eighteenMonthTemplateId,
    },
    {
      inactiveMonths: 24,
      LastLogin: endOfLastMonth.clone().subtract(24, 'months'),
      LastTemplate: twentyFourMonthTemplateId,
    },
  ].forEach(({ inactiveMonths, LastLogin, LastTemplate }) => {
    it(`should not include a workplace that has already been sent a ${inactiveMonths} month email`, async () => {
      sinon.stub(models.sequelize, 'query').returns([
        {
          EstablishmentID: 478,
          NameValue: 'Workplace Name',
          NmdsID: 'J1234567',
          DataOwner: 'Workplace',
          PrimaryUserName: 'Test Name',
          PrimaryUserEmail: 'test@example.com',
          LastLogin: LastLogin,
          LastTemplate: LastTemplate,
        },
      ]);

      const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();
      expect(inactiveWorkplaces.length).to.equal(0);
    });
  });
});
