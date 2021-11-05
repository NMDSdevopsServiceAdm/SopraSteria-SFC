const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToTrainingTab } = require('../../../../../../routes/reports/trainingAndQualifications/parentReport/parentTrainingTab');

const { mockParentWorkerTrainingRecords } = require('../../../../mockdata/trainingAndQualifications');

describe.only('addContentToTrainingTab', () => {
    let mockTrainingTab;

    beforeEach(() => {
      mockTrainingTab = new excelJS.Workbook().addWorksheet('Training', { views: [{ showGridLines: false }] });
    });

    it('should add tab title to cell B2', async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords);

      expect(mockTrainingTab.getCell('B2').value).to.equal('Training');
    });

    it('should add table headings to row 6', async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords);

      const expectedLine = 6;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Workplace');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Worker ID');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Job role');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Training category');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Training name');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Status');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('Expiry date');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('Date completed');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('Long-term absence');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('Accredited');
    });
});