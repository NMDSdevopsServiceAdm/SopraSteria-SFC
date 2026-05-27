const expect = require('chai').expect;
const excelJS = require('exceljs');
const sinon = require('sinon');
const { mockSummaryTabDataForParent } = require('../../../../mockdata/trainingAndQualifications');
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
  });
});
