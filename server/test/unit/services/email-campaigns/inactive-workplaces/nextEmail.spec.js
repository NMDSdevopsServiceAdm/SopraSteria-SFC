const expect = require('chai').expect;
const moment = require('moment');
const sinon = require('sinon');

const config = require('../../../../../config/config');
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
      LastUpdated: endOfLastMonth.clone().subtract(6, 'months'),
      NextTemplate: sixMonthTemplateId,
    },
    {
      inactiveMonths: 12,
      LastUpdated: endOfLastMonth.clone().subtract(12, 'months'),
      NextTemplate: twelveMonthTemplateId,
    },
    {
      inactiveMonths: 18,
      LastUpdated: endOfLastMonth.clone().subtract(18, 'months'),
      NextTemplate: eighteenMonthTemplateId,
    },
    {
      inactiveMonths: 24,
      LastUpdated: endOfLastMonth.clone().subtract(24, 'months'),
      NextTemplate: twentyFourMonthTemplateId,
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

      const emailTemplate = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplate.id).to.equal(NextTemplate);
    });
  });

  [
    {
      inactiveMonths: 12,
      LastUpdated: endOfLastMonth.clone().subtract(12, 'months'),
      LastTemplate: sixMonthTemplateId,
      NextTemplate: twelveMonthTemplateId,
    },
    {
      inactiveMonths: 18,
      LastUpdated: endOfLastMonth.clone().subtract(18, 'months'),
      LastTemplate: twelveMonthTemplateId,
      NextTemplate: eighteenMonthTemplateId,
    },
    {
      inactiveMonths: 24,
      LastUpdated: endOfLastMonth.clone().subtract(24, 'months'),
      LastTemplate: eighteenMonthTemplateId,
      NextTemplate: twentyFourMonthTemplateId,
    },
    {
      inactiveMonths: 25,
      LastUpdated: endOfLastMonth.clone().subtract(25, 'months'),
      LastTemplate: twentyFourMonthTemplateId,
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

      const emailTemplate = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplate ? emailTemplate.id : emailTemplate).to.equal(NextTemplate);
    });
  });

  [
    {
      inactiveMonths: 6,
      LastUpdated: endOfLastMonth.clone().subtract(6, 'months'),
      LastTemplate: sixMonthTemplateId,
    },
    {
      inactiveMonths: 12,
      LastUpdated: endOfLastMonth.clone().subtract(12, 'months'),
      LastTemplate: twelveMonthTemplateId,
    },
    {
      inactiveMonths: 18,
      LastUpdated: endOfLastMonth.clone().subtract(18, 'months'),
      LastTemplate: eighteenMonthTemplateId,
    },
    {
      inactiveMonths: 24,
      LastUpdated: endOfLastMonth.clone().subtract(24, 'months'),
      LastTemplate: twentyFourMonthTemplateId,
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

      const emailTemplate = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplate).to.equal(null);
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

      const emailTemplateId = nextEmail.getTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(NextTemplate);
    });
  });

  describe('isWhitelisted', () => {
    it ('should return true if there is no whitelist', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('');

      const whitelisted =  nextEmail.isWhitelisted('test@test.com');

      expect(whitelisted).to.equal(true);
    });


    it ('should return true if the email is whitelisted', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('test@test.com,name@name.com');

      const whitelisted =  nextEmail.isWhitelisted('test@test.com');

      expect(whitelisted).to.equal(true);
    });

    it ('should return false if the email is not whitelisted', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('test@test.com,name@name.com');

      const whitelisted =  nextEmail.isWhitelisted('example@example.com');

      expect(whitelisted).to.equal(false);
    });
  });
});
