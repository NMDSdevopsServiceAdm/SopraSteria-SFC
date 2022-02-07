const expect = require('chai').expect;

const subsidiariesWorksheetBuilder = require('../../../../reports/inactive-workplaces/subsidiaries');

describe('reports/inactive-workplaces/parents.js', () => {
  it('should add Subsidiary Workplaces to the worksheet', () => {
    const workplace = {
      id: 1,
      name: 'Test Name',
      nmdsId: 'A1234567',
      lastLogin: '2021-03-01',
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
          lastLogin: '2020-09-10',
          dataOwner: 'Parent',
        },
        {
          id: 3,
          name: 'Test Name 3',
          nmdsId: 'H2345678',
          lastLogin: '2020-03-10',
          dataOwner: 'Parent',
        },
      ],
    };

    const rows = subsidiariesWorksheetBuilder.buildRows(workplace, workplace.subsidiaries);

    expect(rows).to.deep.equal([
      {
        parentWorkplaceId: 'A1234567',
        workplace: 'Test Name 2',
        workplaceId: 'J231466',
        lastLogin: '2020-09-10',
        dataOwner: 'Parent',
      },
      {
        parentWorkplaceId: 'A1234567',
        workplace: 'Test Name 3',
        workplaceId: 'H2345678',
        lastLogin: '2020-03-10',
        dataOwner: 'Parent',
      },
    ]);
  });
});
