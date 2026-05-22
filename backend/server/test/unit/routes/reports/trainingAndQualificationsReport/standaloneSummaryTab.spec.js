const expect = require('chai').expect;
const excelJS = require('exceljs');
const lodash = require('lodash');

const {
  mockSummaryTabDataForWorkplaceA,
  totalCountsForMockWorkplaceA,
  mockSummaryTabDataForWorkplaceAWithoutMandatoryTraining,
  careCertAndQualificationLevelsForWorkplaceA,
  mockSummaryTabDataForWorkplaceAWithNoCareProvidingStaffs,
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

      expect(missingRecordCount).to.equal(totalCountsForMockWorkplaceA.missingMandatoryTrainingCount);
    });

    it('should show a special message and show the counts as "-", if the workplace has no mandatory training at all', () => {
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

      expect(missingRecordCount).to.equal('-');
    });

    it('should show a sub heading "Care-providing staff only" with the number of such staffs', () => {
      generateSummaryTab(workbook, mockSummaryTabDataForWorkplaceA);

      const tab = workbook.getWorksheet('Summary');
      const careProvidingStaffsCount = careCertAndQualificationLevelsForWorkplaceA.careProvidingStaffsCount;

      const expected = `Care-providing staff only (${careProvidingStaffsCount})`;

      expect(tab.getCell('P4').value).to.equal(expected);
    });

    it('should show the care cert counts and social care qualification levels', () => {
      generateSummaryTab(workbook, mockSummaryTabDataForWorkplaceA);

      const tab = workbook.getWorksheet('Summary');

      const headerRow = tab.getRow(5);
      const careCertColumn = tab.getColumn(headerRow.values.indexOf('Care Certificates'));

      expect(careCertColumn.values.slice(7, 15)).to.deep.equal([
        'Completed',
        0,
        undefined,
        'Started or partially completed',
        careCertAndQualificationLevelsForWorkplaceA.careCertificate['Yes, in progress or partially completed'],
        undefined,
        'Not started',
        careCertAndQualificationLevelsForWorkplaceA.careCertificate['No'],
      ]);

      const L2CareCertColumn = tab.getColumn(headerRow.values.indexOf('L2 Adult Social Care Certificates'));

      expect(L2CareCertColumn.values.slice(7, 15)).to.deep.equal([
        'Completed',
        careCertAndQualificationLevelsForWorkplaceA.level2CareCertificate['Yes, completed'],
        undefined,
        'Started',
        0,
        undefined,
        'Not started',
        careCertAndQualificationLevelsForWorkplaceA.level2CareCertificate['No'],
      ]);

      const socialCareQualificationLevel = tab.getColumn(headerRow.values.indexOf('Social care qualification levels'));

      expect(socialCareQualificationLevel.values.slice(7, 21)).to.deep.equal([
        'Level 2 or higher',
        careCertAndQualificationLevelsForWorkplaceA.socialCareQualificationLevel['Level 2 or above'],
        undefined,
        'Level 2',
        careCertAndQualificationLevelsForWorkplaceA.socialCareQualificationLevel['Level 2'] ?? 0,
        undefined,
        'Level 3',
        careCertAndQualificationLevelsForWorkplaceA.socialCareQualificationLevel['Level 3'] ?? 0,
        undefined,
        'Level 4',
        careCertAndQualificationLevelsForWorkplaceA.socialCareQualificationLevel['Level 4'],
        undefined,
        'Level 5 or above',
        careCertAndQualificationLevelsForWorkplaceA.socialCareQualificationLevel['Level 5 or above'],
      ]);
    });

    it('should show the care cert counts and social care qualification levels as "-" if no care providing staff in the workplace', () => {
      generateSummaryTab(workbook, mockSummaryTabDataForWorkplaceAWithNoCareProvidingStaffs);

      const tab = workbook.getWorksheet('Summary');

      const headerRow = tab.getRow(5);
      const careCertColumn = tab.getColumn(headerRow.values.indexOf('Care Certificates'));

      expect(careCertColumn.values.slice(7, 15)).to.deep.equal([
        'Completed',
        '-',
        undefined,
        'Started or partially completed',
        '-',
        undefined,
        'Not started',
        '-',
      ]);

      const L2CareCertColumn = tab.getColumn(headerRow.values.indexOf('L2 Adult Social Care Certificates'));

      expect(L2CareCertColumn.values.slice(7, 15)).to.deep.equal([
        'Completed',
        '-',
        undefined,
        'Started',
        '-',
        undefined,
        'Not started',
        '-',
      ]);

      const socialCareQualificationLevel = tab.getColumn(headerRow.values.indexOf('Social care qualification levels'));

      expect(socialCareQualificationLevel.values.slice(7, 21)).to.deep.equal([
        'Level 2 or higher',
        '-',
        undefined,
        'Level 2',
        '-',
        undefined,
        'Level 3',
        '-',
        undefined,
        'Level 4',
        '-',
        undefined,
        'Level 5 or above',
        '-',
      ]);
    });
  });
});
