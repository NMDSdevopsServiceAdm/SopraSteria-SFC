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
        LastEmailedDate: '2020-06-01',
        EmailCount: 1,
      },
    ]);

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

    expect(inactiveWorkplaces).to.deep.equal(dummyInactiveWorkplaces);
  });

  it('should return the correct template when 6 months inactive', async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: moment().subtract(6, 'months'),
        LastEmailedDate: '2020-12-01',
        EmailCount: 0,
      }
    ]);

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

    expect(inactiveWorkplaces[0].emailTemplateId).to.equal(13);
  });

  it('should return the correct template when 12 months inactive', async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: moment().subtract(12, 'months'),
        LastEmailedDate: '2020-12-01',
        EmailCount: 1,
      }
    ]);

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

    expect(inactiveWorkplaces[0].emailTemplateId).to.equal(13);
  });

  it('should return the correct template when 18 months inactive', async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: moment().subtract(18, 'months'),
        LastEmailedDate: '2020-12-01',
        EmailCount: 2,
      }
    ]);

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

    expect(inactiveWorkplaces[0].emailTemplateId).to.equal(10);
  });

  it('should return the correct template when 24 months inactive', async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 478,
        NameValue: 'Workplace Name',
        NmdsID: 'J1234567',
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Name',
        PrimaryUserEmail: 'test@example.com',
        LastUpdated: moment().subtract(24, 'months'),
        LastEmailedDate: '2020-12-01',
        EmailCount: 2,
      }
    ]);

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

    expect(inactiveWorkplaces[0].emailTemplateId).to.equal(12);
  });
});
