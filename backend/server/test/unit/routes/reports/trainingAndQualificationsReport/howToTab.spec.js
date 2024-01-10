const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const {
  addTitleToHowToTab,
} = require('../../../../../routes/reports/trainingAndQualifications/howToTab');

describe('addTitleToHowToTab()', () => {
  let mockHowToTab;

  beforeEach(() => {
    mockHowToTab = new excelJS.Workbook().addWorksheet('How to...', { views: [{ showGridLines: false }] });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title for single workplaces to cell B5', async () => {
    addTitleToHowToTab(mockHowToTab, false);

    expect(mockHowToTab.getCell('B5').value).to.equal('Training and qualifications report');
  });

  it('should add tab title for parent workplaces to cell B5', async () => {
    addTitleToHowToTab(mockHowToTab, true);

    expect(mockHowToTab.getCell('B5').value).to.equal('Parent training and qualifications report');
  });
});
