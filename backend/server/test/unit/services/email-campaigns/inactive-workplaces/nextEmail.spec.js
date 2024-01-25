const expect = require('chai').expect;
const moment = require('moment');
const sinon = require('sinon');

const nextEmail = require('../../../../../services/email-campaigns/inactive-workplaces/nextEmail');

describe('nextEmailTemplate', () => {
  afterEach(() => {
    sinon.restore();
  });

  const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');
  const sixMonthTemplateId = 13;
  const twelveMonthTemplateId = 14;
  const eighteenMonthTemplateId = 10;
  const twentyFourMonthTemplateId = 12;

  [
    {
      inactiveMonths: 6,
      LastActivity: endOfLastMonth.clone().subtract(6, 'months'),
      NextTemplate: sixMonthTemplateId,
    },
    {
      inactiveMonths: 12,
      LastActivity: endOfLastMonth.clone().subtract(12, 'months'),
      NextTemplate: twelveMonthTemplateId,
    },
    {
      inactiveMonths: 18,
      LastActivity: endOfLastMonth.clone().subtract(18, 'months'),
      NextTemplate: eighteenMonthTemplateId,
    },
    {
      inactiveMonths: 24,
      LastActivity: endOfLastMonth.clone().subtract(24, 'months'),
      NextTemplate: twentyFourMonthTemplateId,
    },
  ].forEach(({ inactiveMonths, LastActivity, NextTemplate }) => {
    it(`should return the correct template when ${inactiveMonths} months inactive`, async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastLogin: LastActivity,
        LastUpdated: LastActivity,
        LastTemplate: null,
      };

      const emailTemplate = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplate.id).to.equal(NextTemplate);
    });
  });

  [
    {
      inactiveMonths: 12,
      LastActivity: endOfLastMonth.clone().subtract(12, 'months'),
      LastTemplate: sixMonthTemplateId,
      NextTemplate: twelveMonthTemplateId,
    },
    {
      inactiveMonths: 18,
      LastActivity: endOfLastMonth.clone().subtract(18, 'months'),
      LastTemplate: twelveMonthTemplateId,
      NextTemplate: eighteenMonthTemplateId,
    },
    {
      inactiveMonths: 24,
      LastActivity: endOfLastMonth.clone().subtract(24, 'months'),
      LastTemplate: eighteenMonthTemplateId,
      NextTemplate: twentyFourMonthTemplateId,
    },
  ].forEach(({ inactiveMonths, LastActivity, LastTemplate, NextTemplate }) => {
    it(`should return the next template when ${inactiveMonths} months inactive`, async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastLogin: LastActivity,
        LastUpdated: LastActivity,
        LastTemplate: LastTemplate,
      };

      const emailTemplate = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplate ? emailTemplate.id : emailTemplate).to.equal(NextTemplate);
    });
  });

  [
    {
      inactiveMonths: 6,
      LastActivity: endOfLastMonth.clone().subtract(6, 'months'),
      LastTemplate: sixMonthTemplateId,
    },
    {
      inactiveMonths: 12,
      LastActivity: endOfLastMonth.clone().subtract(12, 'months'),
      LastTemplate: twelveMonthTemplateId,
    },
    {
      inactiveMonths: 18,
      LastActivity: endOfLastMonth.clone().subtract(18, 'months'),
      LastTemplate: eighteenMonthTemplateId,
    },
    {
      inactiveMonths: 24,
      LastActivity: endOfLastMonth.clone().subtract(24, 'months'),
      LastTemplate: twentyFourMonthTemplateId,
    },
  ].forEach(({ inactiveMonths, LastActivity, LastTemplate }) => {
    it(`should not return a ${inactiveMonths} month template when already sent a ${inactiveMonths} month email`, async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastLogin: LastActivity,
        LastUpdated: LastActivity,
        LastTemplate: LastTemplate,
      };

      const emailTemplate = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplate).to.equal(null);
    });
  });

  [
    {
      inactiveMonths: 5,
      LastActivity: endOfLastMonth.clone().subtract(5, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 7,
      LastActivity: endOfLastMonth.clone().subtract(7, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 14,
      LastActivity: endOfLastMonth.clone().subtract(14, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 20,
      LastActivity: endOfLastMonth.clone().subtract(20, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
  ].forEach(({ inactiveMonths, LastActivity, LastTemplate, NextTemplate }) => {
    it(`should not return a template when ${inactiveMonths} months inactive as they are outside of the 6, 12, 18, 24 month`, async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastLogin: LastActivity,
        LastUpdated: LastActivity,
        LastTemplate: LastTemplate,
      };

      const emailTemplateId = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(NextTemplate);
    });
  });

  [
    {
      inactiveMonths: 5,
      LastActivity: endOfLastMonth.clone().subtract(5, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 7,
      LastActivity: endOfLastMonth.clone().subtract(7, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 14,
      LastActivity: endOfLastMonth.clone().subtract(14, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 20,
      LastActivity: endOfLastMonth.clone().subtract(20, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
  ].forEach(({ inactiveMonths, LastActivity, LastTemplate, NextTemplate }) => {
    it(`should not return a template when ${inactiveMonths} months inactive as Last Login is outside of the 6, 12, 18, 24 month`, async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastLogin: LastActivity,
        LastUpdated: endOfLastMonth.clone().subtract(12, 'months'),
        LastTemplate: LastTemplate,
      };

      const emailTemplateId = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(NextTemplate);
    });
  });

  [
    {
      inactiveMonths: 5,
      LastActivity: endOfLastMonth.clone().subtract(5, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 7,
      LastActivity: endOfLastMonth.clone().subtract(7, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 14,
      LastActivity: endOfLastMonth.clone().subtract(14, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
    {
      inactiveMonths: 20,
      LastActivity: endOfLastMonth.clone().subtract(20, 'months'),
      LastTemplate: null,
      NextTemplate: null,
    },
  ].forEach(({ inactiveMonths, LastActivity, LastTemplate, NextTemplate }) => {
    it(`should not return a template when ${inactiveMonths} months inactive as Last Updated is outside of the 6, 12, 18, 24 month`, async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastLogin: endOfLastMonth.clone().subtract(12, 'months'),
        LastUpdated: LastActivity,
        LastTemplate: LastTemplate,
      };

      const emailTemplateId = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(NextTemplate);
    });
  });
});
