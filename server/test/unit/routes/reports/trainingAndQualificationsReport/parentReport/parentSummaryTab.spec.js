const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToSummaryTab } = require('../../../../../../routes/reports/trainingAndQualifications/parentReport/parentSummaryTab');
const { getTrainingTotals } = require('../../../../../../utils/trainingAndQualificationsUtils');
const { mockWorkerTrainingBreakdowns, secondMockWorkerTrainingBreakdowns } = require('../../../../mockdata/trainingAndQualifications');

describe.only('addContentToSummaryTab', () => {
  let mockSummaryTab;

  const mockEstablishmentTrainingTotals = [
    {
      establishmentId: 2320,
      totals: {
        ...getTrainingTotals(mockWorkerTrainingBreakdowns)
      }
    },
    {
      establishmentId: 2321,
      totals: {
        ...getTrainingTotals(secondMockWorkerTrainingBreakdowns)
      }
    },
  ]

  beforeEach(() => {
    mockSummaryTab = new excelJS.Workbook().addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title to cell B2', async () => {
    addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

    expect(mockSummaryTab.getCell('B2').value).to.equal('Training (summary)');
  });

  describe('Training records table', () => {
    it('should add all training record status types to row 6', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('C6').value).to.equal('Up to date');
      expect(mockSummaryTab.getCell('F6').value).to.equal('Expiring soon');
      expect(mockSummaryTab.getCell('I6').value).to.equal('Expired');
      expect(mockSummaryTab.getCell('L6').value).to.equal('Missing');
    });

    it('should add training totals for the first workplace to row 9', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('C9').value).to.equal(15); // up to date - total
      expect(mockSummaryTab.getCell('D9').value).to.equal(5); // up to date - mandatory
      expect(mockSummaryTab.getCell('E9').value).to.equal(10); // up to date - non-mandatory
      expect(mockSummaryTab.getCell('F9').value).to.equal(8); // expiring soon - total
      expect(mockSummaryTab.getCell('G9').value).to.equal(2); // expiring soon - mandatory
      expect(mockSummaryTab.getCell('H9').value).to.equal(6); // expiring soon - non-mandatory
      expect(mockSummaryTab.getCell('I9').value).to.equal(12); // expired - total
      expect(mockSummaryTab.getCell('J9').value).to.equal(4); // expired - mandatory
      expect(mockSummaryTab.getCell('K9').value).to.equal(8); // expired - non-mandatory
      expect(mockSummaryTab.getCell('L9').value).to.equal(5); // missing
    });

    it('should add training totals for the first workplace to row 10', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('C10').value).to.equal(13); // up to date - total
      expect(mockSummaryTab.getCell('D10').value).to.equal(5); // up to date - mandatory
      expect(mockSummaryTab.getCell('E10').value).to.equal(8); // up to date - non-mandatory
      expect(mockSummaryTab.getCell('F10').value).to.equal(6); // expiring soon - total
      expect(mockSummaryTab.getCell('G10').value).to.equal(2); // expiring soon - mandatory
      expect(mockSummaryTab.getCell('H10').value).to.equal(4); // expiring soon - non-mandatory
      expect(mockSummaryTab.getCell('I10').value).to.equal(4); // expired - total
      expect(mockSummaryTab.getCell('J10').value).to.equal(0); // expired - mandatory
      expect(mockSummaryTab.getCell('K10').value).to.equal(4); // expired - non-mandatory
      expect(mockSummaryTab.getCell('L10').value).to.equal(2); // missing
    });
  });
});
