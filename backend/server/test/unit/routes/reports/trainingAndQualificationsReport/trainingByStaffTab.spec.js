const excelJS = require('exceljs');
const expect = require('chai').expect;
const lodash = require('lodash');

const {
  mockWorkerTrainingBreakdowns,
  mockWorkerTrainingBreakdownsWithNoMandatoryTraining,
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
    it('should add a worksheet with training record counts listed by worker', () => {
      generateTrainingByStaffTab(workbook, mockWorkerTrainingBreakdowns);

      const tab = workbook.getWorksheet('Training by staff');
      const workerColumns = tab.getColumn('B');
      expect(workerColumns.values).to.contain('Name or ID number');

      mockWorkerTrainingBreakdowns.forEach((worker) => {
        expect(workerColumns.values).to.contain(worker.name);
        const workerRowNumber = workerColumns.values.indexOf(worker.name);
        const workerRow = tab.getRow(workerRowNumber);

        const expectedRowValues = lodash.at(worker, [
          'name',
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
        ]);

        expect(workerRow.values.slice(2)).to.deep.equal(expectedRowValues);
      });
    });

    it('should add a total row at the end of table', () => {
      generateTrainingByStaffTab(workbook, mockWorkerTrainingBreakdowns);

      const tab = workbook.getWorksheet('Training by staff');
      const totalRow = tab.getRow(4 + mockWorkerTrainingBreakdowns.length + 1);

      expect(totalRow.values.slice(2)).to.deep.equals([
        'Total',
        { formula: 'SUM(C5:C8)' },
        { formula: 'SUM(D5:D8)' },
        { formula: 'SUM(E5:E8)' },
        { formula: 'SUM(F5:F8)' },
        { formula: 'SUM(G5:G8)' },
        { formula: 'SUM(H5:H8)' },
        { formula: 'SUM(I5:I8)' },
        { formula: 'SUM(J5:J8)' },
        { formula: 'SUM(K5:K8)' },
        { formula: 'SUM(L5:L8)' },
      ]);
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
