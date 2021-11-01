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

  // describe('All training records table', () => {
  //   it('should add all training records table headings to row 6', async () => {
  //     addContentToSummaryTab(mockSummaryTab, mockWorkerTrainingBreakdowns, mockTrainingRecordTotals);

  //     expect(mockSummaryTab.getCell('B6').value).to.equal('All training records');
  //     expect(mockSummaryTab.getCell('C6').value).to.equal('Total');
  //     expect(mockSummaryTab.getCell('D6').value).to.equal('Mandatory');
  //     expect(mockSummaryTab.getCell('E6').value).to.equal('Non-mandatory');
  //   });
  // });
});
