const expect = require('chai').expect;

const deleteInactiveWorkplaceWorksheetBuilder = require('../../../../reports/inactive-workplaces/deleteInactiveWorkplace');

const {
  transformInactiveWorkplacesForDeletion,
} = require('../../../../services/email-campaigns/inactive-workplaces/findInactiveWorkplacesForDeletion');

describe('reports/inactive-workplaces/parents.js', () => {
  it('should add inactive Workplaces which are to be deleted to the worksheet', () => {
    const workplace = {
      EstablishmentID: 1,
      NameValue: 'workplace name test',
      ascId: 'A1234567',
      dataOwner: 'Workplace',
      PrimaryUserName: 'primaryUserName',
      PrimaryUserEmail: 'primaryusername@test.com',
      lastLogin: '2015-03-01',
      lastUpdated: '2015-03-01',
      Address1: '1 paddington Avenue',
      Address2: '',
      Address3: '',
      Town: 'Westminster',
      County: 'London',
      PostCode: 'W2 1HB',
    };

    //   "EstablishmentID",
    // "NameValue",
    // TRIM("NmdsID") AS "NmdsID",
    // "DataOwner",
    // "PrimaryUserName",
    // "PrimaryUserEmail",
    // "LastLogin",
    // "LastUpdated",
    // "Address1",
    // "Address2",
    // "Address3",
    // "Town",
    // "County",
    // "PostCode"

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
