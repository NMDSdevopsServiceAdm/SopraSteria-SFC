const expect = require('chai').expect;
const moment = require('moment');
const sinon = require('sinon');

const models = require('../../../../../models');
const findInactiveWorkplaces = require('../../../../../models/email-campaigns/inactive-workplaces/findInactiveWorkplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces', () => {
  afterEach(() => {
    sinon.restore();
  });

  const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');

  const dummyInactiveWorkplaces = [
    {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
      emailTemplate: {
        id: 13,
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
      lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
      emailTemplate: {
        id: 14,
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
        LastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
        LastTemplate: null,
      },
      {
        EstablishmentID: 479,
        NameValue: 'Second Workplace Name',
        NmdsID: 'A0012345',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Name McName',
        PrimaryUserEmail: 'name@mcname.com',
        LastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
        LastTemplate: null,
      },
    ]);

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

    expect(inactiveWorkplaces).to.deep.equal(dummyInactiveWorkplaces);
  });

  [
    {
      inactiveMonths: 6,
      LastUpdated: endOfLastMonth.clone().subtract(6, 'months'),
      LastTemplate: 13,
    },
    {
      inactiveMonths: 12,
      LastUpdated: endOfLastMonth.clone().subtract(12, 'months'),
      LastTemplate: 14,
    },
    {
      inactiveMonths: 18,
      LastUpdated: endOfLastMonth.clone().subtract(18, 'months'),
      LastTemplate: 10,
    },
    {
      inactiveMonths: 24,
      LastUpdated: endOfLastMonth.clone().subtract(24, 'months'),
      LastTemplate: 12,
    },
  ].forEach(({ inactiveMonths, LastUpdated, LastTemplate }) => {
    it(`should not include a workplace that has already been sent a ${inactiveMonths} month email`, async () => {
      sinon.stub(models.sequelize, 'query').returns([
        {
          EstablishmentID: 478,
          NameValue: 'Workplace Name',
          NmdsID: 'J1234567',
          DataOwner: 'Workplace',
          PrimaryUserName: 'Test Name',
          PrimaryUserEmail: 'test@example.com',
          LastUpdated: LastUpdated,
          LastTemplate: LastTemplate,
        },
      ]);

      const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();
      expect(inactiveWorkplaces.length).to.equal(0);
    });
  });
});
