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
      const expectedMenuItems = [
        { text: 'Summary', hyperlink: "#'Summary'!A1" },
        { text: 'Training records by staff', hyperlink: "#'Training by staff'!A1" },
        { text: 'Training records by category', hyperlink: "#'Training by category'!A1" },
        { text: 'Expired and missing training', hyperlink: "#'Expired training'!A1" },
        { text: 'Training record details', hyperlink: "#'Training record details'!A1" },
        { text: 'Care Certificates', hyperlink: "#'Care Certificates'!A1" },
        { text: 'Qualification record details', hyperlink: "#'Qualification record details'!A1" },
      ];

      const introTab = setup();
      const firstRowForLinkMenu = 12;

      addLinksToOtherTabs(introTab);

      expectedMenuItems.forEach((item, index) => {
        expect(introTab.getCell(`B${firstRowForLinkMenu + index}`).value).to.deep.equal(item);
      });
    });
  });
});
