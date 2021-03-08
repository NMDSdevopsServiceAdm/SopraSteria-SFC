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

  describe('nextEmailTemplate', () => {
    [
      {
        inactiveMonths: 6,
        LastUpdated: endOfLastMonth.clone().subtract(6, 'months'),
        NextTemplate: 13,
      },
      {
        inactiveMonths: 12,
        LastUpdated: endOfLastMonth.clone().subtract(12, 'months'),
        NextTemplate: 14,
      },
      {
        inactiveMonths: 18,
        LastUpdated: endOfLastMonth.clone().subtract(18, 'months'),
        NextTemplate: 10,
      },
      {
        inactiveMonths: 24,
        LastUpdated: endOfLastMonth.clone().subtract(24, 'months'),
        NextTemplate: 12,
      },
    ].forEach(({ inactiveMonths, LastUpdated, NextTemplate }) => {
      it(`should return the correct template when ${inactiveMonths} months inactive`, async () => {
        const inactiveWorkplace = {
          EstablishmentID: 478,
          NameValue: 'Workplace Name',
          NmdsID: 'J1234567',
          DataOwner: 'Workplace',
          PrimaryUserName: 'Test Name',
          PrimaryUserEmail: 'test@example.com',
          LastUpdated: LastUpdated,
          LastTemplate: null,
        };

        const emailTemplate = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

        expect(emailTemplate.id).to.equal(NextTemplate);
      });
    });

    [
      {
        inactiveMonths: 12,
        LastUpdated: endOfLastMonth.clone().subtract(12, 'months'),
        LastTemplate: 13,
        NextTemplate: 14,
      },
      {
        inactiveMonths: 18,
        LastUpdated: endOfLastMonth.clone().subtract(18, 'months'),
        LastTemplate: 14,
        NextTemplate: 10,
      },
      {
        inactiveMonths: 24,
        LastUpdated: endOfLastMonth.clone().subtract(24, 'months'),
        LastTemplate: 10,
        NextTemplate: 12,
      },
      {
        inactiveMonths: 25,
        LastUpdated: endOfLastMonth.clone().subtract(25, 'months'),
        LastTemplate: 12,
        NextTemplate: null,
      },
    ].forEach(({ inactiveMonths, LastUpdated, LastTemplate, NextTemplate }) => {
      it(`should return the next template when ${inactiveMonths} months inactive`, async () => {
        const inactiveWorkplace = {
          EstablishmentID: 478,
          NameValue: 'Workplace Name',
          NmdsID: 'J1234567',
          DataOwner: 'Workplace',
          PrimaryUserName: 'Test Name',
          PrimaryUserEmail: 'test@example.com',
          LastUpdated: LastUpdated,
          LastTemplate: LastTemplate,
        };

        const emailTemplate = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

        expect(emailTemplate ? emailTemplate.id : emailTemplate).to.equal(NextTemplate);
      });
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
      it(`should not return a ${inactiveMonths} month template when already sent a ${inactiveMonths} month email`, async () => {
        const inactiveWorkplace = {
          EstablishmentID: 478,
          NameValue: 'Workplace Name',
          NmdsID: 'J1234567',
          DataOwner: 'Workplace',
          PrimaryUserName: 'Test Name',
          PrimaryUserEmail: 'test@example.com',
          LastUpdated: LastUpdated,
          LastTemplate: LastTemplate,
        };

        const emailTemplate = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

        expect(emailTemplate).to.equal(null);
      });
    });
  });

  [
    {
      inactiveMonths: 5,
      LastUpdated: endOfLastMonth.clone().subtract(5, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 7,
      LastUpdated: endOfLastMonth.clone().subtract(7, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 14,
      LastUpdated: endOfLastMonth.clone().subtract(14, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 20,
      LastUpdated: endOfLastMonth.clone().subtract(20, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 26,
      LastUpdated: endOfLastMonth.clone().subtract(26, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
  ].forEach(({ inactiveMonths, LastUpdated, LastTemplate, NextTemplate }) => {
    it(`should not return a template when ${inactiveMonths} months inactive as they are outside of the 6, 12, 18, 24 month`, async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: LastUpdated,
        LastTemplate: LastTemplate,
      };

      const emailTemplateId = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(null);
    });
  });
});
