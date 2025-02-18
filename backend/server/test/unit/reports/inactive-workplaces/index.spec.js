const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { generateInactiveWorkplacesReport } = require('../../../../reports/inactive-workplaces/index');
const inactiveWorkplacesUtils = require('../../../../utils/db/inactiveWorkplacesUtils');

describe('reports/inactive-workplaces/index.js', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should not call refreshEstablishmentLastActivityView when there is a request to stop refreshing the view', async () => {
    const stopViewRefresh = 'true';

    const refreshEstablishmentLastActivityViewSpy = sinon
      .stub(inactiveWorkplacesUtils, 'refreshEstablishmentLastActivityView')
      .returns();

    await generateInactiveWorkplacesReport(workbook, stopViewRefresh);

    expect(refreshEstablishmentLastActivityViewSpy).not.to.have.been.called;
  });

  it('should call refreshEstablishmentLastActivityView when there is no request to stop refreshing the view', async () => {
    const stopViewRefresh = undefined;

    const refreshEstablishmentLastActivityViewSpy = sinon
      .stub(inactiveWorkplacesUtils, 'refreshEstablishmentLastActivityView')
      .returns();

    await generateInactiveWorkplacesReport(workbook, stopViewRefresh);

    expect(refreshEstablishmentLastActivityViewSpy).to.be.called;
  });

  // it('should add inactive Workplaces which are to be deleted to the worksheet', () => {
  //   const workplace = {
  //     EstablishmentID: 1,
  //     NameValue: 'workplace name test',
  //     NmdsID: 'G1101344',
  //     LastLogin: '2019-10-10',
  //     LastUpdated: '2019-10-10',
  //     DataOwner: 'Workplace',
  //     Address1: '1 paddington Avenue',
  //     Town: 'Westminster',
  //     County: 'London',
  //     PostCode: 'W2 1HB',
  //     LocationID: '1-10000902',
  //     ParentNmdsID: 'J1003212',
  //   };

  //   const transformedWorkplace = transformInactiveWorkplacesForDeletion(workplace);

  //   const rows = deleteInactiveWorkplaceWorksheetBuilder.buildRows([transformedWorkplace]);
  //   expect(rows).to.deep.equal([
  //     {
  //       workplaceNmdsId: 'G1101344',
  //       workplaceName: 'workplace name test',
  //       lastLogin: '2019-10-10',
  //       lastUpdated: '2019-10-10',
  //       dataOwner: 'Workplace',
  //       address: '1 paddington Avenue Westminster London W2 1HB',
  //       parentNmdsId: 'J1003212',
  //       cqcRegulated: 'Yes',
  //     },
  //   ]);
  // });
});
