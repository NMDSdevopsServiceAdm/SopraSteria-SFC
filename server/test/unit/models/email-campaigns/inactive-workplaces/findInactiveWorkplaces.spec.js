const expect = require('chai').expect;
const moment = require('moment');
const sinon = require('sinon');

const models = require('../../../../../models');
const findInactiveWorkplaces = require('../../../../../models/email-campaigns/inactive-workplaces/findInactiveWorkplaces');

describe.only('server/routes/admin/email-campaigns/inactive-workplaces', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dummyInactiveWorkplaces = [
    {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastUpdated: moment().subtract(6, 'months').format('YYYY-MM-DD'),
      emailTemplateId: 13,
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
      lastUpdated: moment().subtract(12, 'months').format('YYYY-MM-DD'),
      emailTemplateId: 13,
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
        LastUpdated: moment().subtract(6, 'months').format('YYYY-MM-DD'),
        LastTemplate: null,
        LastEmailedDate: '2020-12-01',
        EmailCount: 1,
      },
      {
        EstablishmentID: 479,
        NameValue: 'Second Workplace Name',
        NmdsID: 'A0012345',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Name McName',
        PrimaryUserEmail: 'name@mcname.com',
        LastUpdated: moment().subtract(12, 'months').format('YYYY-MM-DD'),
        LastTemplate: null,
        LastEmailedDate: '2020-06-01',
        EmailCount: 1,
      },
    ]);

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

    expect(inactiveWorkplaces).to.deep.equal(dummyInactiveWorkplaces);
  });

  [
    {
      inactiveMonths: 6,
      LastUpdated: moment().subtract(6, 'months'),
      LastTemplate: 13,
    },
    {
      inactiveMonths: 12,
      LastUpdated: moment().subtract(12, 'months'),
      LastTemplate: 13,
    },
    {
      inactiveMonths: 18,
      LastUpdated: moment().subtract(18, 'months'),
      LastTemplate: 10,
    },
    {
      inactiveMonths: 24,
      LastUpdated: moment().subtract(24, 'months'),
      LastTemplate: 12,
    }
  ].forEach(({ inactiveMonths, LastUpdated, LastTemplate }) => {
    it(`should not include a workplace that has already been sent a ${inactiveMonths} month email`, async () => {
      sinon.stub(models.sequelize, 'query').returns([{
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastEmailedDate: '2020-12-01',
        EmailCount: 2,
        LastUpdated: LastUpdated,
        LastTemplate: LastTemplate,
      }]);

      const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();
      expect(inactiveWorkplaces.length).to.equal(0);
    });
  });

  describe('nextEmailTemplate', () => {
    it('should return the correct template when 6 months inactive', async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: moment().subtract(6, 'months'),
        LastEmailedDate: '2020-12-01',
        EmailCount: 0,
      };

      const emailTemplateId = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(13);
    });

    it('should return the correct template when 12 months inactive', async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: moment().subtract(12, 'months'),
        LastEmailedDate: '2020-12-01',
        EmailCount: 1,
      };

      const emailTemplateId = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(13);
    });

    it('should return the correct template when 18 months inactive', async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: moment().subtract(18, 'months'),
        LastEmailedDate: '2020-12-01',
        EmailCount: 2,
      };

      const emailTemplateId = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(10);
    });

    it('should return the correct template when 24 months inactive', async () => {
      const inactiveWorkplace = {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: moment().subtract(24, 'months'),
        LastEmailedDate: '2020-12-01',
        EmailCount: 2,
      };

      const emailTemplateId = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

      expect(emailTemplateId).to.equal(12);
    });

    [
      {
        inactiveMonths: 6,
        LastUpdated: moment().subtract(6, 'months'),
        LastTemplate: 13,
      },
      {
        inactiveMonths: 12,
        LastUpdated: moment().subtract(12, 'months'),
        LastTemplate: 13,
      },
      {
        inactiveMonths: 18,
        LastUpdated: moment().subtract(18, 'months'),
        LastTemplate: 10,
      },
      {
        inactiveMonths: 24,
        LastUpdated: moment().subtract(24, 'months'),
        LastTemplate: 12,
      }
    ].forEach(({ inactiveMonths, LastUpdated, LastTemplate }) => {
      it(`should not return a ${inactiveMonths} month template when already sent a ${inactiveMonths} month email`, async () => {
        const inactiveWorkplace = {
          EstablishmentID: 478,
          NameValue: 'Workplace Name',
          NmdsID: 'J1234567',
          DataOwner: 'Workplace',
          PrimaryUserName: 'Test Name',
          PrimaryUserEmail: 'test@example.com',
          LastEmailedDate: '2020-12-01',
          EmailCount: 2,
          LastUpdated: LastUpdated,
          LastTemplate: LastTemplate,
        };

        const emailTemplateId = await findInactiveWorkplaces.nextEmailTemplate(inactiveWorkplace);

        expect(emailTemplateId).to.equal(null);
      });
    });
  });
});
