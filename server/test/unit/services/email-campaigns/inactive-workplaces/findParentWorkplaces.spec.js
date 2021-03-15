const expect = require('chai').expect;
const moment = require('moment');
const sinon = require('sinon');

const models = require('../../../../../models');
const findParentWorkplaces = require('../../../../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');

describe.only('server/routes/admin/email-campaigns/inactive-workplaces/findParentWorkplaces', () => {
  afterEach(() => {
    sinon.restore();
  });

  const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');
  const parentTemplateId = 15;

  const dummyParentWorkplaces = [
    {
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
          lastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
          dataOwner: 'Parent',
        },
      ],
    },
  ];

  it('should return parent workplaces', async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 1,
        NameValue: 'Test Name',
        ParentID: null,
        IsParent: true,
        NmdsID: 'A1234567',
        LastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      },
      {
        EstablishmentID: 2,
        NameValue: 'Workplace Name',
        ParentID: 1,
        IsParent: false,
        NmdsID: 'A0045232',
        LastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Parent',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      }
    ]);
    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

    expect(parentWorkplaces).to.deep.equal(dummyParentWorkplaces);
  });
});
