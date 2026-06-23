const excelJS = require('exceljs');
const expect = require('chai').expect;

const {
  generateCareCertificateTab,
} = require('../../../../../routes/reports/trainingAndQualifications/careCertificateTab');

const { mockWorkersWithCareCertificateStatus } = require('../../../mockdata/trainingAndQualifications');

describe('CareCertificateTab', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateCareCertificateTab', () => {
    it('should create the worksheet', () => {
      generateCareCertificateTab(workbook, mockWorkersWithCareCertificateStatus);

      const tab = workbook.getWorksheet('Care Certificates');

      expect(tab).to.exist;
    });

    it('should add title to cell B1', () => {
      generateCareCertificateTab(workbook, mockWorkersWithCareCertificateStatus);

      const tab = workbook.getWorksheet('Care Certificates');

      expect(tab.getCell('B1').value).to.equal('Care Certificates');
    });

    it('should add correct table headers', () => {
      generateCareCertificateTab(workbook, mockWorkersWithCareCertificateStatus);

      const tab = workbook.getWorksheet('Care Certificates');

      expect(tab.getCell('B3').value).to.equal('Name or ID number');

      expect(tab.getCell('C3').value).to.equal('Main job role');

      expect(tab.getCell('D3').value).to.equal('Care Certificate');

      expect(tab.getCell('E3').value).to.equal('L2 Adult Social Care Certificate');
    });

    it('should add worker data to the table', () => {
      generateCareCertificateTab(workbook, mockWorkersWithCareCertificateStatus);

      const tab = workbook.getWorksheet('Care Certificates');

      const firstWorker = mockWorkersWithCareCertificateStatus[0];

      expect(tab.getCell('B4').value).to.equal(firstWorker.workerId);

      expect(tab.getCell('C4').value).to.equal(firstWorker.jobRole);

      expect(tab.getCell('D4').value).to.equal(firstWorker.careCertificate);

      expect(tab.getCell('E4').value).to.equal(firstWorker.l2CareCertificate);
    });

    it('should add a blank row when there is no data', () => {
      generateCareCertificateTab(workbook, []);

      const tab = workbook.getWorksheet('Care Certificates');

      expect(tab.getCell('B4').value).to.equal('');
      expect(tab.getCell('C4').value).to.equal('');
      expect(tab.getCell('D4').value).to.equal('');
      expect(tab.getCell('E4').value).to.equal('');
    });

    it('should add footnote text', () => {
      generateCareCertificateTab(workbook, mockWorkersWithCareCertificateStatus);

      const tab = workbook.getWorksheet('Care Certificates');

      const footnoteCell = tab.getCell(`B${tab.lastRow.number}`);

      expect(footnoteCell.value).to.equal(
        'Note, the data displayed in this table has been generated from staff records.',
      );
    });
  });

  describe('Parent report', () => {
    it('should add workplace column when isParent is true', () => {
      generateCareCertificateTab(workbook, mockWorkersWithCareCertificateStatus, true);

      const tab = workbook.getWorksheet('Care Certificates');

      expect(tab.getCell('B3').value).to.equal('Workplace');

      expect(tab.getCell('C3').value).to.equal('Name or ID number');
    });
  });
});
