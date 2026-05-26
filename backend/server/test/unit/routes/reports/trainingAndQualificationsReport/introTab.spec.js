const excelJS = require('exceljs');
const expect = require('chai').expect;
const sinon = require('sinon');

const {
  addHeadingsToIntroTab,
  addLinksToOtherTabs,
} = require('../../../../../routes/reports/trainingAndQualifications/introTab');

describe('introTab', () => {
  const mockWorkplace = {
    NameValue: 'Care Home',
  };

  const setup = () => {
    return new excelJS.Workbook().addWorksheet('Introduction', { views: [{ showGridLines: false }] });
  };

  describe('addHeadingsToIntroTab', () => {
    let clock;
    before(() => {
      clock = sinon.useFakeTimers({ now: 1775043296000 }); // '01 April 2026, 12:34'
    });
    after(() => {
      clock.restore();
    });

    it('should add workplace name to cell B2', async () => {
      const introTab = setup();
      addHeadingsToIntroTab(introTab, mockWorkplace);

      expect(introTab.getCell('B2').value).to.equal('Care Home');
    });

    it('should add tab title to cell B3, and current date and time to G3', async () => {
      const introTab = setup();
      addHeadingsToIntroTab(introTab, mockWorkplace);

      expect(introTab.getCell('B3').value).to.equal('Training and qualifications report');
      expect(introTab.getCell('G3').value).to.equal('01 April 2026, 12:34');
    });
  });

  describe('addLinksToOtherTabs', () => {
    it('should add links to jump to other tabs', () => {
      const introTab = setup();
      addLinksToOtherTabs(introTab);

      expect(introTab.getCell('B11').value).to.deep.equal({ text: 'Summary', hyperlink: "#'Summary'!A1" });
      expect(introTab.getCell('B12').value).to.deep.equal({
        text: 'Training records by staff',
        hyperlink: "#'Training by staff'!A1",
      });
      expect(introTab.getCell('B13').value).to.deep.equal({
        text: 'Training records by category',
        hyperlink: "#'Training by category'!A1",
      });
      expect(introTab.getCell('B14').value).to.deep.equal({
        text: 'Expired and missing training',
        hyperlink: "#'Expired training'!A1",
      });
      expect(introTab.getCell('B15').value).to.deep.equal({
        text: 'Training record details',
        hyperlink: "#'Training record details'!A1",
      });
      expect(introTab.getCell('B16').value).to.deep.equal({
        text: 'Care Certificates',
        hyperlink: "#'Care Certificates'!A1",
      });
      expect(introTab.getCell('B17').value).to.deep.equal({
        text: 'Qualification record details',
        hyperlink: "#'Qualification record details'!A1",
      });
    });
  });
});
