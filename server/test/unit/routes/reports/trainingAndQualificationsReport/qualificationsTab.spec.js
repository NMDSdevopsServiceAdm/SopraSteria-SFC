const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const {
  addContentToQualificationsTab,
} = require('../../../../../routes/reports/trainingAndQualifications/qualificationsTab');
const { mockWorkerQualificationRecords } = require('../../../mockdata/trainingAndQualifications');

describe('addContentToQualificationsTab', () => {
  let mockQualificationsTab;

  beforeEach(() => {
    mockQualificationsTab = new excelJS.Workbook().addWorksheet('Qualifications', {
      views: [{ showGridLines: false }],
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title to cell B2', async () => {
    addContentToQualificationsTab(mockQualificationsTab, mockWorkerQualificationRecords);

    expect(mockQualificationsTab.getCell('B2').value).to.equal('Qualifications');
  });

  it('should add table headings to row 6', async () => {
    addContentToQualificationsTab(mockQualificationsTab, mockWorkerQualificationRecords);

    const expectedLine = 6;

    expect(mockQualificationsTab.getCell(`B${expectedLine}`).value).to.equal('Worker ID');
    expect(mockQualificationsTab.getCell(`C${expectedLine}`).value).to.equal('Job role');
    expect(mockQualificationsTab.getCell(`D${expectedLine}`).value).to.equal('Qualification type');
    expect(mockQualificationsTab.getCell(`E${expectedLine}`).value).to.equal('Qualification name');
    expect(mockQualificationsTab.getCell(`F${expectedLine}`).value).to.equal('Qualification level');
    expect(mockQualificationsTab.getCell(`G${expectedLine}`).value).to.equal('Year achieved');
  });

  it('should add first training record to top row of table', async () => {
    addContentToQualificationsTab(mockQualificationsTab, mockWorkerQualificationRecords);

    const expectedLine = 7;

    expect(mockQualificationsTab.getCell(`B${expectedLine}`).value).to.equal('Helen Jones');
    expect(mockQualificationsTab.getCell(`C${expectedLine}`).value).to.equal(
      'Administrative / office staff not care-providing',
    );
    expect(mockQualificationsTab.getCell(`D${expectedLine}`).value).to.equal('Degree');
    expect(mockQualificationsTab.getCell(`E${expectedLine}`).value).to.equal('Health and Social Care degree');
    expect(mockQualificationsTab.getCell(`F${expectedLine}`).value).to.equal('Level 6');
    expect(mockQualificationsTab.getCell(`G${expectedLine}`).value).to.equal(2020);
  });

  it("should add worker's next training record to next row of table", async () => {
    addContentToQualificationsTab(mockQualificationsTab, mockWorkerQualificationRecords);

    const expectedLine = 8;

    expect(mockQualificationsTab.getCell(`B${expectedLine}`).value).to.equal('Anna Riley');
    expect(mockQualificationsTab.getCell(`C${expectedLine}`).value).to.equal('Care Worker');
    expect(mockQualificationsTab.getCell(`D${expectedLine}`).value).to.equal('Apprenticeship');
    expect(mockQualificationsTab.getCell(`E${expectedLine}`).value).to.equal('Adult Care Worker (standard)');
    expect(mockQualificationsTab.getCell(`F${expectedLine}`).value).to.equal('Level 3');
    expect(mockQualificationsTab.getCell(`G${expectedLine}`).value).to.equal(2010);
  });

  it('should leave the cells blank where values are null', async () => {
    addContentToQualificationsTab(mockQualificationsTab, mockWorkerQualificationRecords);

    const expectedLine = 9;

    expect(mockQualificationsTab.getCell(`B${expectedLine}`).value).to.equal('Bob Smith');
    expect(mockQualificationsTab.getCell(`C${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
    expect(mockQualificationsTab.getCell(`D${expectedLine}`).value).to.equal('NVQ');
    expect(mockQualificationsTab.getCell(`E${expectedLine}`).value).to.equal('Care NVQ');
    expect(mockQualificationsTab.getCell(`F${expectedLine}`).value).to.equal('');
    expect(mockQualificationsTab.getCell(`G${expectedLine}`).value).to.equal('');
  });

  describe('Adding blank row to empty table', async () => {
    it('should not add empty row to end of table when there is data', async () => {
      addContentToQualificationsTab(mockQualificationsTab, mockWorkerQualificationRecords);

      const expectedLine = 10;

      expect(mockQualificationsTab.getCell(`B${expectedLine}`).value).to.equal(null);
      expect(mockQualificationsTab.getCell(`C${expectedLine}`).value).to.equal(null);
      expect(mockQualificationsTab.getCell(`D${expectedLine}`).value).to.equal(null);
      expect(mockQualificationsTab.getCell(`E${expectedLine}`).value).to.equal(null);
      expect(mockQualificationsTab.getCell(`F${expectedLine}`).value).to.equal(null);
      expect(mockQualificationsTab.getCell(`G${expectedLine}`).value).to.equal(null);
    });

    it('should add empty row to table when no data', async () => {
      addContentToQualificationsTab(mockQualificationsTab, []);

      const expectedLine = 7;

      expect(mockQualificationsTab.getCell(`B${expectedLine}`).value).to.equal('');
      expect(mockQualificationsTab.getCell(`C${expectedLine}`).value).to.equal('');
      expect(mockQualificationsTab.getCell(`D${expectedLine}`).value).to.equal('');
      expect(mockQualificationsTab.getCell(`E${expectedLine}`).value).to.equal('');
      expect(mockQualificationsTab.getCell(`F${expectedLine}`).value).to.equal('');
      expect(mockQualificationsTab.getCell(`G${expectedLine}`).value).to.equal('');
    });
  });
});
