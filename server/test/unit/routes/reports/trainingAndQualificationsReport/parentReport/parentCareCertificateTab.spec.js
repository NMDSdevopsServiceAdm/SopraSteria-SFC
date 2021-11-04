const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const {
  addContentToCareCertificateTab,
} = require('../../../../../../routes/reports/trainingAndQualifications/parentReport/parentCareCertificateTab');
const { mockWorkersWithCareCertificateStatus } = require('../../../../mockdata/trainingAndQualifications');

describe.only('generateParentTrainingAndQualificationsReportCareCertificate', () => {
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

  it('should add question to cell B6', async () => {
    addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);
    const question = 'Have they started or completed the Care Certificate?';
    expect(mockCareCertificateTab.getCell('B6').value).to.equal(question);
  })

  describe('Care Certificate table', () => {
    it('should add care certificate records table headings to row 9', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

      expect(mockCareCertificateTab.getCell('B9').value).to.equal('Workplace');
      expect(mockCareCertificateTab.getCell('C9').value).to.equal('Worker ID');
      expect(mockCareCertificateTab.getCell('D9').value).to.equal('Job role');
      expect(mockCareCertificateTab.getCell('E9').value).to.equal('Status');
    });

    xit('should add first worker with care certificate to care certificate table', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

      expect(mockCareCertificateTab.getCell('B7').value).to.equal(mockWorkersWithCareCertificateStatus[0].workerId);
      expect(mockCareCertificateTab.getCell('C7').value).to.equal(mockWorkersWithCareCertificateStatus[0].jobRole);
      expect(mockCareCertificateTab.getCell('D7').value).to.equal(mockWorkersWithCareCertificateStatus[0].status);
    });

    xit('should add second worker with care certificate to care certificate table', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

      expect(mockCareCertificateTab.getCell('B8').value).to.equal(mockWorkersWithCareCertificateStatus[1].workerId);
      expect(mockCareCertificateTab.getCell('C8').value).to.equal(mockWorkersWithCareCertificateStatus[1].jobRole);
      expect(mockCareCertificateTab.getCell('D8').value).to.equal(mockWorkersWithCareCertificateStatus[1].status);
    });

    xdescribe('Adding blank row to empty table', async () => {
      xit('should not add empty row to end of table when there is data', async () => {
        addContentToCareCertificateTab(mockCareCertificateTab, mockWorkersWithCareCertificateStatus);

        const expectedLine = 9;

        expect(mockCareCertificateTab.getCell(`B${expectedLine}`).value).to.equal(null);
        expect(mockCareCertificateTab.getCell(`C${expectedLine}`).value).to.equal(null);
        expect(mockCareCertificateTab.getCell(`D${expectedLine}`).value).to.equal(null);
      });

      xit('should add empty row to table when no data', async () => {
        addContentToCareCertificateTab(mockCareCertificateTab, []);

        const expectedLine = 7;

        expect(mockCareCertificateTab.getCell(`B${expectedLine}`).value).to.equal('');
        expect(mockCareCertificateTab.getCell(`C${expectedLine}`).value).to.equal('');
        expect(mockCareCertificateTab.getCell(`D${expectedLine}`).value).to.equal('');
      });
    });
  });
});
