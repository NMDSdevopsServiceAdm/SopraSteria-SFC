const excelJS = require('exceljs');
const expect = require('chai').expect;
const lodash = require('lodash');

const {
  mockWorkerTrainingBreakdowns,
  mockWorkerTrainingBreakdownsWithNoMandatoryTraining,
  totalCountsForMockWorkplaceA,
} = require('../../../mockdata/trainingAndQualifications');
const {
  generateTrainingByStaffTab,
} = require('../../../../../routes/reports/trainingAndQualifications/trainingByStaffTab');

describe('TrainingByStaffTab', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateTrainingByStaffTab', () => {
    const expectedColumnLabels = [
      'Total',
      'Expired',
      'Expiring soon',
      'Up-to-date',
      'Total',
      'Missing',
      'Expired',
      'Expiring soon',
      'Up-to-date',
      'Total',
    ];
    const expectedFieldNameOrders = [
      'trainingCount',
      'expiredMandatoryTrainingCount',
      'expiringMandatoryTrainingCount',
      'upToDateMandatoryTrainingCount',
      'mandatoryTrainingCount',
      'missingMandatoryTrainingCount',
      'expiredNonMandatoryTrainingCount',
      'expiringNonMandatoryTrainingCount',
      'upToDateNonMandatoryTrainingCount',
      'nonMandatoryTrainingCount',
    ];

    it('should add a worksheet with training record counts listed by worker', () => {
      generateTrainingByStaffTab(workbook, mockWorkerTrainingBreakdowns);

      const tab = workbook.getWorksheet('Training by staff');

      const headerRow = tab.getRow('4');

      expectedColumnLabels.forEach((columnLabel, index) => {
        const actualHeader = headerRow.getCell(index + 3);
        expect(actualHeader.value.trim()).to.equal(columnLabel);
      });

      const workerColumns = tab.getColumn('B');
      expect(workerColumns.values).to.contain('Name or ID number');

      mockWorkerTrainingBreakdowns.forEach((worker) => {
        expect(workerColumns.values).to.contain(worker.name);
        const workerRowNumber = workerColumns.values.indexOf(worker.name);
        const workerRow = tab.getRow(workerRowNumber);

        const expectedRowValues = lodash.at(worker, expectedFieldNameOrders);

        expect(workerRow.values.slice(3)).to.deep.equal(expectedRowValues);
      });
    });

    it('should show a total row at the end of table', () => {
      generateTrainingByStaffTab(workbook, mockWorkerTrainingBreakdowns);

      const tab = workbook.getWorksheet('Training by staff');
      const totalRow = tab.getRow(4 + mockWorkerTrainingBreakdowns.length + 1);

      const expectedTotalValues = expectedFieldNameOrders.map((fieldName) => {
        return totalCountsForMockWorkplaceA[fieldName];
      });
      expect(totalRow.values.slice(2)).to.deep.equals(['Total', ...expectedTotalValues]);
    });

    it('should show mandatory training counts as dash "-" if workplace does not have mandatory training', () => {
      const workerBreakdown = mockWorkerTrainingBreakdownsWithNoMandatoryTraining;
      generateTrainingByStaffTab(workbook, workerBreakdown);

      const tab = workbook.getWorksheet('Training by staff');
      const workerColumns = tab.getColumn('B');

      const firstMandatoryTrainingColumn = tab.getRow(3).values.indexOf('Mandatory training');

      workerBreakdown.forEach((worker) => {
        const workerRowNumber = workerColumns.values.indexOf(worker.name);
        const workerRow = tab.getRow(workerRowNumber);
        const mandatoryTrainingValues = workerRow.values.slice(
          firstMandatoryTrainingColumn,
          firstMandatoryTrainingColumn + 5,
        );
        expect(mandatoryTrainingValues).to.deep.equal(['-', '-', '-', '-', '-']);
      });
    });
  });
});
