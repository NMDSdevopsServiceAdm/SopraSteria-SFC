const expect = require('chai').expect;

const deleteInactiveWorkplaceWorksheetBuilder = require('../../../../reports/inactive-workplaces/deleteInactiveWorkplace');

const {
  transformInactiveWorkplacesForDeletion,
} = require('../../../../services/email-campaigns/inactive-workplaces/setInactiveWorkplacesForDeletion');

describe('reports/inactive-workplaces/parents.js', () => {
  it('should add inactive Workplaces which are to be deleted to the worksheet', () => {
    const workplace = {
      EstablishmentID: 1,
      NameValue: 'workplace name test',
      lastLogin: '2015-03-01',
      lastUpdated: '2015-03-01',
      Address1: '1 paddington Avenue',
      Town: 'Westminster',
      County: 'London',
      PostCode: 'W2 1HB',
    };

    const transformedWorkplace = transformInactiveWorkplacesForDeletion(workplace);
    const rows = deleteInactiveWorkplaceWorksheetBuilder.buildRows([transformedWorkplace]);

    expect(rows).to.deep.equal([
      {
        workplaceAscId: 1,
        workplaceName: 'workplace name test',
        address: '1 paddington Avenue  Westminster  London  W2 1HB',
      },
    ]);
  });
});
