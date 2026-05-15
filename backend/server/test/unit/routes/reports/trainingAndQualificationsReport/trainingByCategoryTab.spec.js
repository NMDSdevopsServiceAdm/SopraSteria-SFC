const excelJS = require('exceljs');
const expect = require('chai').expect;
const lodash = require('lodash');

const {
  generateTrainingByCategoryTab,
} = require('../../../../../routes/reports/trainingAndQualifications/trainingByCategoryTab');

const { buildTrainingCategorySummary } = require('../../../../../utils/trainingAndQualificationsUtils');

const { mockWorkerTrainingRecords } = require('../../../mockdata/trainingAndQualifications');

describe('TrainingByCategoryTab', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateTrainingByCategoryTab', () => {
    let trainingCategoryBreakdowns;

    beforeEach(() => {
      trainingCategoryBreakdowns = buildTrainingCategorySummary(mockWorkerTrainingRecords);

      generateTrainingByCategoryTab(workbook, trainingCategoryBreakdowns);
    });

    it('should create a worksheet named "Training by category"', () => {
      const tab = workbook.getWorksheet('Training by category');

      expect(tab).to.exist;
    });

    it('should display the correct table headers', () => {
      const tab = workbook.getWorksheet('Training by category');

      const headerRow = tab.getRow(4);

      expect(headerRow.values.slice(2)).to.deep.equal([
        'Training category',
        'Mandatory',
        'Total',
        'Expired',
        'Expiring soon',
        'Up-to-date',
        'Missing',
      ]);
    });

    it('should display rows for each training category', () => {
      const tab = workbook.getWorksheet('Training by category');

      const categoryColumn = tab.getColumn('B');

      expect(categoryColumn.values).to.contain('Activity provision/Well-being');

      expect(categoryColumn.values).to.contain('Dementia care');

      expect(categoryColumn.values).to.contain('Emergency Aid awareness');

      expect(categoryColumn.values).to.contain('Diabetes');
    });

    it('should display the correct values for the Diabetes category', () => {
      const tab = workbook.getWorksheet('Training by category');

      const categoryColumn = tab.getColumn('B');

      const diabetesRowNumber = categoryColumn.values.indexOf('Diabetes');

      const diabetesRow = tab.getRow(diabetesRowNumber);

      expect(diabetesRow.values.slice(2)).to.deep.equal(['Diabetes', 'Yes', 2, 1, 0, 0, 1]);
    });

    it('should show a total row at the end of the table', () => {
      const tab = workbook.getWorksheet('Training by category');

      const totalRow = tab.getRows(1, tab.rowCount).find((row) => row.getCell(2).value === 'Total');

      expect(totalRow.values.slice(2)).to.deep.equal(['Total', '-', 7, 1, 1, 2, 3]);
    });

    it('should left align the Total label cell', () => {
      const tab = workbook.getWorksheet('Training by category');

      const totalRow = tab.getRows(1, tab.rowCount).find((row) => row.getCell(2).value === 'Total');

      const totalCell = totalRow.getCell(2);

      expect(totalCell.alignment.horizontal).to.equal('left');
    });

    it('should freeze the table header rows', () => {
      const tab = workbook.getWorksheet('Training by category');

      expect(tab.views[0]).to.deep.equal({
        state: 'frozen',
        ySplit: 4,
        activeCell: 'B1',
      });
    });

    it('should add footnotes below the table', () => {
      const tab = workbook.getWorksheet('Training by category');

      const allValues = [];

      tab.eachRow((row) => {
        allValues.push(...row.values);
      });

      expect(allValues).to.include(
        'The figures shown could include records of staff who have been flagged as long-term absent.',
      );

      expect(allValues).to.include(
        'Note, the number in the Missing column may include training not yet taken by new starters.',
      );
    });
  });
});
