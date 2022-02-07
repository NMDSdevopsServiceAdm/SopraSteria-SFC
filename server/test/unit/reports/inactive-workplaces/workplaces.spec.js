const expect = require('chai').expect;

const workplaceWorksheetBuilder = require('../../../../reports/inactive-workplaces/workplaces');

describe('reports/inactive-workplaces/workplaces.js', () => {
  it('should add Workplace to the worksheet', () => {
    const workplace = {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastLogin: '2020-06-01',
      emailTemplate: {
        id: 13,
        name: '6 months',
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Test Name',
        email: 'test@example.com',
      },
    };

    const rows = workplaceWorksheetBuilder.buildRows([workplace]);

    expect(rows).to.deep.equal([
      {
        workplace: 'Workplace Name',
        workplaceId: 'J1234567',
        lastLogin: '2020-06-01',
        emailTemplate: '6 months',
        dataOwner: 'Workplace',
        nameOfUser: 'Test Name',
        userEmail: 'test@example.com',
      },
    ]);
  });
});
