const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { generateInactiveWorkplacesReport } = require('../../../../reports/inactive-workplaces/index');
const setParentWorkplaces = require('../../../../services/email-campaigns/inactive-workplaces/setParentWorkplaces')
const setInactiveWorkplaces = require('../../../../services/email-campaigns/inactive-workplaces/setInactiveWorkplaces')
const setInactiveWorkplacesForDeletion = require('../../../../services/email-campaigns/inactive-workplaces/setInactiveWorkplacesForDeletion')
const inactiveWorkplacesUtils = require('../../../../utils/db/inactiveWorkplacesUtils');

describe('reports/inactive-workplaces/index.js', () => {
  let workbook;
  let refreshEstablishmentLastActivityViewSpy;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
    sinon.stub(setParentWorkplaces, 'findParentWorkplaces').returns([])
    sinon.stub(setInactiveWorkplaces, 'findInactiveWorkplaces').returns([])
    sinon.stub(setInactiveWorkplacesForDeletion, 'findInactiveWorkplacesForDeletion').returns([])
    refreshEstablishmentLastActivityViewSpy = sinon
      .stub(inactiveWorkplacesUtils, 'refreshEstablishmentLastActivityView')
      .returns();
  });

  afterEach(() => {
    sinon.restore();
    workbook = null
  });

  it('should not call refreshEstablishmentLastActivityView when there is a request to stop refreshing the view', async () => {
    const stopViewRefresh = 'true';

    await generateInactiveWorkplacesReport(workbook, stopViewRefresh);

    expect(refreshEstablishmentLastActivityViewSpy).not.to.have.been.called;
  });

  it('should call refreshEstablishmentLastActivityView when there is no request to stop refreshing the view', async () => {
    const stopViewRefresh = undefined;

    await generateInactiveWorkplacesReport(workbook, stopViewRefresh);

    expect(refreshEstablishmentLastActivityViewSpy).to.be.called;
  });
});
