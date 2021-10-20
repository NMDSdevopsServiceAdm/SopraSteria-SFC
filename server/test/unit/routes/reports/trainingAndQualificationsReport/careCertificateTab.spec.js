const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const {
  addContentToCareCertificateTab,
} = require('../../../../../routes/reports/trainingAndQualifications/careCertificateTab');
const { mockWorkersWithCareCertificateStatus } = require('../../../mockdata/trainingAndQualifications');

describe('generateTrainingAndQualificationsReport', () => {
  let mockCareCertificateTab;

  beforeEach(() => {
    mockCareCertificateTab = new excelJS.Workbook().addWorksheet('Care Certificate', {
      views: [{ showGridLines: false }],
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title to cell B2', async () => {
    addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

    expect(mockCareCertificateTab.getCell('B2').value).to.equal('Care Certificate');
  });

  describe('Care Certificate table', () => {
    it('should add care certificate  records table headings to row 6', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

      expect(mockCareCertificateTab.getCell('B6').value).to.equal('Worker ID');
      expect(mockCareCertificateTab.getCell('C6').value).to.equal('Job role');
      expect(mockCareCertificateTab.getCell('D6').value).to.equal('Status');
    });

    it('should add first worker with care certificate to care certificate table', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

      expect(mockCareCertificateTab.getCell('B7').value).to.equal(mockWorkersWithCareCertificateStatus[0].workerId);
      expect(mockCareCertificateTab.getCell('C7').value).to.equal(mockWorkersWithCareCertificateStatus[0].jobRole);
      expect(mockCareCertificateTab.getCell('D7').value).to.equal(mockWorkersWithCareCertificateStatus[0].status);
    });

    it('should add second worker with care certificate to care certificate table', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

      expect(mockCareCertificateTab.getCell('B8').value).to.equal(mockWorkersWithCareCertificateStatus[1].workerId);
      expect(mockCareCertificateTab.getCell('C8').value).to.equal(mockWorkersWithCareCertificateStatus[1].jobRole);
      expect(mockCareCertificateTab.getCell('D8').value).to.equal(mockWorkersWithCareCertificateStatus[1].status);
    });

    describe('Adding blank row to empty table', async () => {
      it('should not add empty row to end of table when there is data', async () => {
        addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

        const expectedLine = 9;

        expect(mockCareCertificateTab.getCell(`B${expectedLine}`).value).to.equal(null);
        expect(mockCareCertificateTab.getCell(`C${expectedLine}`).value).to.equal(null);
        expect(mockCareCertificateTab.getCell(`D${expectedLine}`).value).to.equal(null);
      });

      it('should add empty row to table when no data', async () => {
        addContentToCareCertificateTab(mockCareCertificateTab, []);

        const expectedLine = 7;

        expect(mockCareCertificateTab.getCell(`B${expectedLine}`).value).to.equal('');
        expect(mockCareCertificateTab.getCell(`C${expectedLine}`).value).to.equal('');
        expect(mockCareCertificateTab.getCell(`D${expectedLine}`).value).to.equal('');
      });
    });
  });
});
