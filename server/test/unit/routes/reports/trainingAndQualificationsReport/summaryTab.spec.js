const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToSummaryTab } = require('../../../../../routes/reports/trainingAndQualifications/summaryTab');
const { getTrainingTotals } = require('../../../../../utils/trainingAndQualificationsUtils');

describe('generateTrainingAndQualificationsReport', () => {
  let mockSummaryTab;

  const mockWorkerTrainingBreakdowns = [
    {
      name: 'Bob Test',
      trainingCount: 6,
      qualificationCount: 2,
      expiredTrainingCount: 2,
      expiredMandatoryTrainingCount: 0,
      expiredNonMandatoryTrainingCount: 2,
      expiringTrainingCount: 4,
      expiringMandatoryTrainingCount: 2,
      expiringNonMandatoryTrainingCount: 2,
      missingMandatoryTrainingCount: 0,
      mandatoryTrainingCount: 0,
    },
    {
      name: 'Mike test',
      trainingCount: 10,
      qualificationCount: 0,
      expiredTrainingCount: 6,
      expiredMandatoryTrainingCount: 3,
      expiredNonMandatoryTrainingCount: 3,
      expiringTrainingCount: 4,
      expiringMandatoryTrainingCount: 2,
      expiringNonMandatoryTrainingCount: 2,
      missingMandatoryTrainingCount: 0,
      mandatoryTrainingCount: 5,
    },
    {
      name: 'Andrew Test',
      trainingCount: 13,
      qualificationCount: 0,
      expiredTrainingCount: 4,
      expiredMandatoryTrainingCount: 1,
      expiredNonMandatoryTrainingCount: 3,
      expiringTrainingCount: 2,
      expiringMandatoryTrainingCount: 0,
      expiringNonMandatoryTrainingCount: 2,
      missingMandatoryTrainingCount: 0,
      mandatoryTrainingCount: 3,
    },
    {
      name: 'Daniel Craig',
      trainingCount: 6,
      qualificationCount: 0,
      expiredTrainingCount: 0,
      expiredMandatoryTrainingCount: 0,
      expiredNonMandatoryTrainingCount: 0,
      expiringTrainingCount: 2,
      expiringMandatoryTrainingCount: 0,
      expiringNonMandatoryTrainingCount: 2,
      missingMandatoryTrainingCount: 0,
      mandatoryTrainingCount: 3,
    },
  ];

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

  describe('All training records table', () => {
    it('should add all training records table headings to row 6', async () => {
      addContentToSummaryTab(mockSummaryTab, mockWorkerTrainingBreakdowns, mockTrainingRecordTotals);

      expect(mockSummaryTab.getCell('B6').value).to.equal('All training records');
      expect(mockSummaryTab.getCell('C6').value).to.equal('Total');
      expect(mockSummaryTab.getCell('D6').value).to.equal('Mandatory');
      expect(mockSummaryTab.getCell('E6').value).to.equal('Non-mandatory');
    });

    it('should add total row to all training records table', async () => {
      addContentToSummaryTab(mockSummaryTab, mockWorkerTrainingBreakdowns, mockTrainingRecordTotals);

      expect(mockSummaryTab.getCell('B7').value).to.equal('Total');
      expect(mockSummaryTab.getCell('C7').value).to.equal(mockTrainingRecordTotals.total.totalRecords);
      expect(mockSummaryTab.getCell('D7').value).to.equal(mockTrainingRecordTotals.total.mandatory);
      expect(mockSummaryTab.getCell('E7').value).to.equal(mockTrainingRecordTotals.total.nonMandatory);
    });

    it('should add up-to-date row to all training records table', async () => {
      addContentToSummaryTab(mockSummaryTab, mockWorkerTrainingBreakdowns, mockTrainingRecordTotals);

      expect(mockSummaryTab.getCell('B8').value).to.equal('Up-to-date');
      expect(mockSummaryTab.getCell('C8').value).to.equal(mockTrainingRecordTotals.upToDate.total);
      expect(mockSummaryTab.getCell('D8').value).to.equal(mockTrainingRecordTotals.upToDate.mandatory);
      expect(mockSummaryTab.getCell('E8').value).to.equal(mockTrainingRecordTotals.upToDate.nonMandatory);
    });

    it('should add Expiring soon row to all training records table', async () => {
      addContentToSummaryTab(mockSummaryTab, mockWorkerTrainingBreakdowns, mockTrainingRecordTotals);

      expect(mockSummaryTab.getCell('B9').value).to.equal('Expiring soon');
      expect(mockSummaryTab.getCell('C9').value).to.equal(mockTrainingRecordTotals.expiringSoon.total);
      expect(mockSummaryTab.getCell('D9').value).to.equal(mockTrainingRecordTotals.expiringSoon.mandatory);
      expect(mockSummaryTab.getCell('E9').value).to.equal(mockTrainingRecordTotals.expiringSoon.nonMandatory);
    });

    it('should add Expired row to all training records table', async () => {
      addContentToSummaryTab(mockSummaryTab, mockWorkerTrainingBreakdowns, mockTrainingRecordTotals);

      expect(mockSummaryTab.getCell('B10').value).to.equal('Expired');
      expect(mockSummaryTab.getCell('C10').value).to.equal(mockTrainingRecordTotals.expired.total);
      expect(mockSummaryTab.getCell('D10').value).to.equal(mockTrainingRecordTotals.expired.mandatory);
      expect(mockSummaryTab.getCell('E10').value).to.equal(mockTrainingRecordTotals.expired.nonMandatory);
    });
  });
});
