const expect = require('chai').expect;

const parentWorksheetBuilder = require('../../../../reports/inactive-workplaces/parents');

describe('reports/inactive-workplaces/parents.js', () => {
  it('should add Parent Workplaces to the worksheet', () => {
    const workplace = {
      id: 1,
      name: 'Test Name',
      nmdsId: 'A1234567',
      lastLogin: '2021-03-01',
      lastUpdated: '2021-03-01',
      emailTemplate: {
        id: 15,
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
          name: 'Test Name 2',
          nmdsId: 'J231466',
          lastLogin: '3 months ago',
          lastUpdated: '3 months ago',
          dataOwner: 'Parent',
        },
        {
          id: 3,
          name: 'Test Name 3',
          nmdsId: 'H2345678',
          lastLogin: '6 months ago',
          lastUpdated: '6 months ago',
          dataOwner: 'Parent',
        },
      ],
    };

    const rows = parentWorksheetBuilder.buildRows([workplace]);

    expect(rows).to.deep.equal([
      {
        workplace: 'Test Name',
        workplaceId: 'A1234567',
        lastLogin: '2021-03-01',
        lastUpdated: '2021-03-01',
        emailTemplate: 'Parent',
        dataOwner: 'Workplace',
        nameOfUser: 'Test Person',
        userEmail: 'test@example.com',
        totalSubs: 2,
      },
    ]);
  });
});
