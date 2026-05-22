const expect = require('chai').expect;
const excelJS = require('exceljs');

const {
  mockSummaryTabDataForWorkplaceA,
  totalCountsForMockWorkplaceA,
  mockSummaryTabDataForWorkplaceAWithoutMandatoryTraining,
} = require('../../../mockdata/trainingAndQualifications');
const { generateSummaryTab } = require('../../../../../routes/reports/trainingAndQualifications/standaloneSummaryTab');

describe('SummaryTab (Standalone)', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateSummaryTab', () => {
    it('should add a worksheet for summary', () => {
      generateSummaryTab(workbook, mockSummaryTabDataForWorkplaceA);

      const tab = workbook.getWorksheet('Summary');

      expect(tab.getCell('D2').value).to.deep.equal('mock care home 1');
      expect(tab.getCell('D3').value).to.deep.equal('Summary');
    });

    it('should fill in the total counts for training records', () => {
      generateSummaryTab(workbook, mockSummaryTabDataForWorkplaceA);

      const tab = workbook.getWorksheet('Summary');

      const headerRow = tab.getRow(5);

      const allTrainingRecordColumn = tab.getColumn(headerRow.values.indexOf('All training records'));
      expect(allTrainingRecordColumn.values.slice(7)).to.deep.equals([
        'Total',
        totalCountsForMockWorkplaceA.trainingCount,
        undefined,

        'Expired',
        totalCountsForMockWorkplaceA.expiredTrainingCount,
        undefined,

        'Expiring soon',
        totalCountsForMockWorkplaceA.expiringTrainingCount,
        undefined,

        'Up-to-date',
        totalCountsForMockWorkplaceA.upToDateTrainingCount,
      ]);
    });

    it('should fill in the total counts for non mandatory training records', () => {
      generateSummaryTab(workbook, mockSummaryTabDataForWorkplaceA);

      const tab = workbook.getWorksheet('Summary');

      const headerRow = tab.getRow(5);

      const nonMandatoryTrainingRecordColumn = tab.getColumn(
        headerRow.values.indexOf('Non-mandatory training records'),
      );
      expect(nonMandatoryTrainingRecordColumn.values.slice(7)).to.deep.equals([
        'Total',
        totalCountsForMockWorkplaceA.nonMandatoryTrainingCount,
        undefined,

        'Expired',
        totalCountsForMockWorkplaceA.expiredNonMandatoryTrainingCount,
        undefined,

        'Expiring soon',
        totalCountsForMockWorkplaceA.expiringNonMandatoryTrainingCount,
        undefined,

        'Up-to-date',
        totalCountsForMockWorkplaceA.upToDateNonMandatoryTrainingCount,
      ]);
    });

    it('should fill in the total counts for mandatory training records', () => {
      generateSummaryTab(workbook, mockSummaryTabDataForWorkplaceA);

      const tab = workbook.getWorksheet('Summary');

      const headerRow = tab.getRow(5);

      const mandatoryTrainingRecordColumn = tab.getColumn(headerRow.values.indexOf('Mandatory training records'));

      expect(mandatoryTrainingRecordColumn.values.slice(7, 18)).to.deep.equals([
        'Total',
        totalCountsForMockWorkplaceA.mandatoryTrainingCount,
        undefined,

        'Expired',
        totalCountsForMockWorkplaceA.expiredMandatoryTrainingCount,
        undefined,

        'Expiring soon',
        totalCountsForMockWorkplaceA.expiringMandatoryTrainingCount,
        undefined,

        'Up-to-date',
        totalCountsForMockWorkplaceA.upToDateMandatoryTrainingCount,
      ]);

      const missingRecordLabelRow = mandatoryTrainingRecordColumn.values.indexOf('Missing records');
      const missingRecordCount = mandatoryTrainingRecordColumn.values[missingRecordLabelRow + 1];

      expect(missingRecordCount.value).to.equal(totalCountsForMockWorkplaceA.missingRecordCount);
    });

    it('should show a special message and counts as "-" if the workplace has no mandatory training at all', () => {
      generateSummaryTab(workbook, mockSummaryTabDataForWorkplaceAWithoutMandatoryTraining);

      const tab = workbook.getWorksheet('Summary');

      const headerRow = tab.getRow(5);

      const mandatoryTrainingRecordColumn = tab.getColumn(headerRow.values.indexOf('Mandatory training records'));

      expect(mandatoryTrainingRecordColumn.values.slice(7, 18)).to.deep.equals([
        'Total',
        'No training categories have been made mandatory yet',
        undefined,

        'Expired',
        '-',
        undefined,

        'Expiring soon',
        '-',
        undefined,

        'Up-to-date',
        '-',
      ]);

      const missingRecordLabelRow = mandatoryTrainingRecordColumn.values.indexOf('Missing records');
      const missingRecordCount = mandatoryTrainingRecordColumn.values[missingRecordLabelRow + 1];

      expect(missingRecordCount.value).to.equal('-');
    });
  });
});
