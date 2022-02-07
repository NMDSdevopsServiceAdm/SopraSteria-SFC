const expect = require('chai').expect;
const moment = require('moment');
const sinon = require('sinon');

const models = require('../../../../../models');
const findParentWorkplaces = require('../../../../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces/findParentWorkplaces', () => {
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
      lastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
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
          lastLogin: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
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
        LastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
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
        LastLogin: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Parent',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      },
    ]);
    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

    expect(parentWorkplaces).to.deep.equal(dummyParentWorkplaces);
  });

  it("should only return parent workplaces of subs that haven't updated for at least 6 months", async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 1,
        NameValue: 'Test Name',
        ParentID: null,
        IsParent: true,
        NmdsID: 'A1234567',
        LastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
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
        LastLogin: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Parent',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      },
      {
        EstablishmentID: 3,
        NameValue: 'Parent 2 Name',
        ParentID: null,
        IsParent: true,
        NmdsID: 'A0011223',
        LastLogin: endOfLastMonth.clone().subtract(3, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test 2 Person',
        PrimaryUserEmail: 'test2@example.com',
      },
      {
        EstablishmentID: 4,
        NameValue: 'Workplace 2 Name',
        ParentID: 3,
        IsParent: false,
        NmdsID: 'H0205232',
        LastLogin: endOfLastMonth.clone().subtract(3, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Parent',
        PrimaryUserName: 'Test 2 Person',
        PrimaryUserEmail: 'test2@example.com',
      },
    ]);

    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

    expect(parentWorkplaces).to.deep.equal(dummyParentWorkplaces);
  });

  it('should return an empty array when there are no inactive subs', async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 1,
        NameValue: 'Parent Name',
        ParentID: null,
        IsParent: true,
        NmdsID: 'A1234567',
        LastLogin: endOfLastMonth.clone().subtract(3, 'months').format('YYYY-MM-DD'),
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
        LastLogin: endOfLastMonth.clone().subtract(1, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Parent',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      },
    ]);

    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

    expect(parentWorkplaces).to.deep.equal([]);
  });

  it("should return parent workplaces if they are inactive and their subs aren't", async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 1,
        NameValue: 'Test Name',
        ParentID: null,
        IsParent: true,
        NmdsID: 'A1234567',
        LastLogin: endOfLastMonth.clone().subtract(13, 'months').format('YYYY-MM-DD'),
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
        LastLogin: endOfLastMonth.clone().subtract(1, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Parent',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      },
    ]);

    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

    expect(parentWorkplaces).to.deep.equal([
      {
        id: 1,
        name: 'Test Name',
        nmdsId: 'A1234567',
        lastLogin: endOfLastMonth.clone().subtract(13, 'months').format('YYYY-MM-DD'),
        emailTemplate: {
          id: parentTemplateId,
          name: 'Parent',
        },
        dataOwner: 'Workplace',
        user: {
          name: 'Test Person',
          email: 'test@example.com',
        },
        subsidiaries: [],
      },
    ]);
  });

  it('should return parent when there are no subs', async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 1,
        NameValue: 'Test Name',
        ParentID: null,
        IsParent: true,
        NmdsID: 'A1234567',
        LastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      },
    ]);

    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();
    expect(parentWorkplaces).to.deep.equal([
      {
        id: 1,
        name: 'Test Name',
        nmdsId: 'A1234567',
        lastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
        emailTemplate: {
          id: parentTemplateId,
          name: 'Parent',
        },
        dataOwner: 'Workplace',
        user: {
          name: 'Test Person',
          email: 'test@example.com',
        },
        subsidiaries: [],
      },
    ]);
  });

  it("should group subs when the parent isn't the first workplace in the list", async () => {
    sinon.stub(models.sequelize, 'query').returns([
      {
        EstablishmentID: 2,
        NameValue: 'Workplace Name',
        ParentID: 1,
        IsParent: false,
        NmdsID: 'A0045232',
        LastLogin: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Parent',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      },
      {
        EstablishmentID: 1,
        NameValue: 'Test Name',
        ParentID: null,
        IsParent: true,
        NmdsID: 'A1234567',
        LastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
        DataOwner: 'Workplace',
        PrimaryUserName: 'Test Person',
        PrimaryUserEmail: 'test@example.com',
      },
    ]);

    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();
    expect(parentWorkplaces).to.deep.equal(dummyParentWorkplaces);
  });
});
