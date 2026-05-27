const expect = require('chai').expect;
const excelJS = require('exceljs');
const sinon = require('sinon');
const {
  mockSummaryTabDataForParent,
  mockSummaryTabDataForWorkplaceA,
  mockSummaryTabDataForWorkplaceB,
} = require('../../../../mockdata/trainingAndQualifications');
const {
  generateParentSummaryTab,
} = require('../../../../../../routes/reports/trainingAndQualifications/parentReport/parentSummaryTab');

describe.only('SummaryTab (Parent)', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateParentSummaryTab', () => {
    const mockParentWorkplace = {
      NameValue: 'mock parent workplace',
    };

    it('should add a worksheet for summary', () => {
      generateParentSummaryTab(workbook, mockParentWorkplace, mockSummaryTabDataForParent);

      const tab = workbook.getWorksheet('Summary');

      expect(tab.getCell('B2').value).to.deep.equal('mock parent workplace');
      expect(tab.getCell('B3').value).to.deep.equal('Summary');
    });

    it('should add a table for summary data of each sub workplace', () => {
      generateParentSummaryTab(workbook, mockParentWorkplace, mockSummaryTabDataForParent);

      const tab = workbook.getWorksheet('Summary');

      expect(tab.getCell('B8').value).to.equal(mockSummaryTabDataForWorkplaceA.workplaceName);
      expect(tab.getCell('B9').value).to.equal(mockSummaryTabDataForWorkplaceB.workplaceName);
    });
  });
});
