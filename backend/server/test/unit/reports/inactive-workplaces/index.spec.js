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
});
