const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToSummaryTab } = require('../../../../../../routes/reports/trainingAndQualifications/parentReport/parentSummaryTab');
const { getTrainingTotals } = require('../../../../../../utils/trainingAndQualificationsUtils');
const { mockWorkerTrainingBreakdowns } = require('../../../../mockdata/trainingAndQualifications');

describe('addContentToSummaryTab', () => {
  let mockSummaryTab;

  const mockTrainingRecordTotals = getTrainingTotals(mockWorkerTrainingBreakdowns);

  beforeEach(() => {
    mockSummaryTab = new excelJS.Workbook().addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title to cell B2', async () => {
    addContentToSummaryTab(mockSummaryTab, mockWorkerTrainingBreakdowns, mockTrainingRecordTotals);

    expect(mockSummaryTab.getCell('B2').value).to.equal('Training (summary)');
  });

  describe('Training records table', () => {
    it('should add all training record status types to row 6', async () => {
      addContentToSummaryTab(mockSummaryTab, mockWorkerTrainingBreakdowns, mockTrainingRecordTotals);

      expect(mockSummaryTab.getCell('C6').value).to.equal('Up to date');
      expect(mockSummaryTab.getCell('F6').value).to.equal('Expiring soon');
      expect(mockSummaryTab.getCell('I6').value).to.equal('Expired');
      expect(mockSummaryTab.getCell('L6').value).to.equal('Missing');
    });
  });
});
