const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const {
  addContentToCareCertificateTab,
} = require('../../../../../routes/reports/trainingAndQualifications/careCertificateTab');
const { mockWorkerCareCertificate } = require('../../../mockdata/trainingAndQualifications');

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
    addContentToCareCertificateTab(mockCareCertificateTab, mockWorkerCareCertificate);

    expect(mockCareCertificateTab.getCell('B2').value).to.equal('Care Certificate');
  });

  it('should add tab second title to cell B6', async () => {
    addContentToCareCertificateTab(mockCareCertificateTab, mockWorkerCareCertificate);

    expect(mockCareCertificateTab.getCell('B6').value).to.equal('Have they started or completed the Care Certificate?');
  });

  describe('Care Certificate table', () => {
    it('should add care certificate  records table headings to row 9', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkerCareCertificate);

      expect(mockCareCertificateTab.getCell('B9').value).to.equal('Woker ID');
      expect(mockCareCertificateTab.getCell('C9').value).to.equal('Job role');
      expect(mockCareCertificateTab.getCell('D9').value).to.equal('Status');
    });

    it('should add first worker with care certificate to care certificate table', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkerCareCertificate);

      expect(mockCareCertificateTab.getCell('B10').value).to.equal(mockWorkerCareCertificate[0].workerId);
      expect(mockCareCertificateTab.getCell('C10').value).to.equal(mockWorkerCareCertificate[0].jobRole);
      expect(mockCareCertificateTab.getCell('D10').value).to.equal(mockWorkerCareCertificate[0].status);
    });
  });
});
