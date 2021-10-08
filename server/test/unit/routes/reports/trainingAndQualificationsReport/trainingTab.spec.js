const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToTrainingTab } = require('../../../../../routes/reports/trainingAndQualifications/trainingTab');

describe('addContentToTrainingTab', () => {
  let mockTrainingTab;

  beforeEach(() => {
    mockTrainingTab = new excelJS.Workbook().addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title to cell B2', async () => {
    addContentToTrainingTab(mockTrainingTab);

    expect(mockTrainingTab.getCell('B2').value).to.equal('Training');
  });

  it('should add table headings to row 6', async () => {
    addContentToTrainingTab(mockTrainingTab);

    expect(mockTrainingTab.getCell('B6').value).to.equal('Worker ID');
    expect(mockTrainingTab.getCell('C6').value).to.equal('Job role');
    expect(mockTrainingTab.getCell('D6').value).to.equal('Training category');
    expect(mockTrainingTab.getCell('E6').value).to.equal('Training name');
    expect(mockTrainingTab.getCell('F6').value).to.equal('Mandatory');
    expect(mockTrainingTab.getCell('G6').value).to.equal('Status');
    expect(mockTrainingTab.getCell('H6').value).to.equal('Expiry date');
    expect(mockTrainingTab.getCell('I6').value).to.equal('Date completed');
    expect(mockTrainingTab.getCell('J6').value).to.equal('Long-term absence');
    expect(mockTrainingTab.getCell('K6').value).to.equal('Accredited');
  });
});
