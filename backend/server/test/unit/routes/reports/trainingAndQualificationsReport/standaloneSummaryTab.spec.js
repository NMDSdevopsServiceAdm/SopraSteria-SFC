const expect = require('chai').expect;
const excelJS = require('exceljs');

const { mockSummaryTabDataForWorkplaceA } = require('../../../mockdata/trainingAndQualifications');
const { generateSummaryTab } = require('../../../../../routes/reports/trainingAndQualifications/standaloneSummaryTab');

describe.only('SummaryTab (Standalone)', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateSummaryTab', () => {
    it('should add a worksheet for summary', () => {
      generateSummaryTab(workbook, [mockSummaryTabDataForWorkplaceA]);

      const tab = workbook.getWorksheet('Summary');

      expect(tab.getCell('D2').value).to.deep.equal('mock care home 1');
      expect(tab.getCell('D3').value).to.deep.equal('Summary');
    });
  });
});
