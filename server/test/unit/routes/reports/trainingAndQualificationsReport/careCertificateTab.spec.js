const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const {
  addContentToCareCertificateTab,
} = require('../../../../../routes/reports/trainingAndQualifications/careCertificateTab');
const {
  mockWorkersWithCareCertificateStatus,
  secondMockWorkersWithCareCertificateStatus,
} = require('../../../mockdata/trainingAndQualifications');

describe('generateCareCertificateTab', () => {
  let mockCareCertificateTab;

  beforeEach(() => {
    mockCareCertificateTab = new excelJS.Workbook().addWorksheet('Care Certificate', {
      views: [{ showGridLines: false }],
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Workplace Report', () => {
    const mockWorkplaceWorkersWithCareCertificateStatus = [
      {
        establishmentName: 'Care Home',
        workers: mockWorkersWithCareCertificateStatus,
      },
    ];

    it('should add tab title to cell B2', async () => {
      addContentToCareCertificateTab(mockCareCertificateTab, mockWorkplaceWorkersWithCareCertificateStatus);

      expect(mockCareCertificateTab.getCell('B2').value).to.equal('Care Certificate');
    });

    describe('Care Certificate table', () => {
      it('should add care certificate  records table headings to row 6', async () => {
        addContentToCareCertificateTab(mockCareCertificateTab, mockWorkplaceWorkersWithCareCertificateStatus);

        expect(mockCareCertificateTab.getCell('B6').value).to.equal('Worker ID');
        expect(mockCareCertificateTab.getCell('C6').value).to.equal('Job role');
        expect(mockCareCertificateTab.getCell('D6').value).to.equal('Status');
      });

      it('should add first worker with care certificate to care certificate table', async () => {
        addContentToCareCertificateTab(mockCareCertificateTab, mockWorkplaceWorkersWithCareCertificateStatus);

        expect(mockCareCertificateTab.getCell('B7').value).to.equal(mockWorkersWithCareCertificateStatus[0].workerId);
        expect(mockCareCertificateTab.getCell('C7').value).to.equal(mockWorkersWithCareCertificateStatus[0].jobRole);
        expect(mockCareCertificateTab.getCell('D7').value).to.equal(mockWorkersWithCareCertificateStatus[0].status);
      });

      it('should add second worker with care certificate to care certificate table', async () => {
        addContentToCareCertificateTab(mockCareCertificateTab, mockWorkplaceWorkersWithCareCertificateStatus);

        expect(mockCareCertificateTab.getCell('B8').value).to.equal(mockWorkersWithCareCertificateStatus[1].workerId);
        expect(mockCareCertificateTab.getCell('C8').value).to.equal(mockWorkersWithCareCertificateStatus[1].jobRole);
        expect(mockCareCertificateTab.getCell('D8').value).to.equal(mockWorkersWithCareCertificateStatus[1].status);
      });

      describe('Adding blank row to empty table', async () => {
        it('should not add empty row to end of table when there is data', async () => {
          addContentToCareCertificateTab(mockCareCertificateTab, mockWorkplaceWorkersWithCareCertificateStatus);

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

  describe('Parent report', () => {
    const isParent = true;
    const mockParentWorkplaceWorkersWithCareCerticateStatus = [
      {
        establishmentName: 'Care Home 1',
        workers: mockWorkersWithCareCertificateStatus,
      },
      {
        establishmentName: 'Care Home 2',
        workers: secondMockWorkersWithCareCertificateStatus,
      },
    ];

    it('should add tab title to cell B2', async () => {
      addContentToCareCertificateTab(
        mockCareCertificateTab,
        mockParentWorkplaceWorkersWithCareCerticateStatus,
        isParent,
      );

      expect(mockCareCertificateTab.getCell('B2').value).to.equal('Care Certificate');
    });

    describe('Care Certificate table', () => {
      it('should add care certificate records table headings to row 6', async () => {
        addContentToCareCertificateTab(
          mockCareCertificateTab,
          mockParentWorkplaceWorkersWithCareCerticateStatus,
          isParent,
        );

        expect(mockCareCertificateTab.getCell('B6').value).to.equal('Workplace');
        expect(mockCareCertificateTab.getCell('C6').value).to.equal('Worker ID');
        expect(mockCareCertificateTab.getCell('D6').value).to.equal('Job role');
        expect(mockCareCertificateTab.getCell('E6').value).to.equal('Status');
      });

      it('should add first worker with care certificate and workplace for first workplace to care certificate table', async () => {
        addContentToCareCertificateTab(
          mockCareCertificateTab,
          mockParentWorkplaceWorkersWithCareCerticateStatus,
          isParent,
        );

        expect(mockCareCertificateTab.getCell('B7').value).to.equal(
          mockParentWorkplaceWorkersWithCareCerticateStatus[0].establishmentName,
        );
        expect(mockCareCertificateTab.getCell('C7').value).to.equal(mockWorkersWithCareCertificateStatus[0].workerId);
        expect(mockCareCertificateTab.getCell('D7').value).to.equal(mockWorkersWithCareCertificateStatus[0].jobRole);
        expect(mockCareCertificateTab.getCell('E7').value).to.equal(mockWorkersWithCareCertificateStatus[0].status);
      });

      it('should add second worker with care certificate and workplace for first workplace to care certificate table', async () => {
        addContentToCareCertificateTab(
          mockCareCertificateTab,
          mockParentWorkplaceWorkersWithCareCerticateStatus,
          isParent,
        );

        expect(mockCareCertificateTab.getCell('B8').value).to.equal(
          mockParentWorkplaceWorkersWithCareCerticateStatus[0].establishmentName,
        );
        expect(mockCareCertificateTab.getCell('C8').value).to.equal(mockWorkersWithCareCertificateStatus[1].workerId);
        expect(mockCareCertificateTab.getCell('D8').value).to.equal(mockWorkersWithCareCertificateStatus[1].jobRole);
        expect(mockCareCertificateTab.getCell('E8').value).to.equal(mockWorkersWithCareCertificateStatus[1].status);
      });

      it('should add first worker with care certificate and workplace for second workplace to care certificate table', async () => {
        addContentToCareCertificateTab(
          mockCareCertificateTab,
          mockParentWorkplaceWorkersWithCareCerticateStatus,
          isParent,
        );

        expect(mockCareCertificateTab.getCell('B9').value).to.equal(
          mockParentWorkplaceWorkersWithCareCerticateStatus[1].establishmentName,
        );
        expect(mockCareCertificateTab.getCell('C9').value).to.equal(
          secondMockWorkersWithCareCertificateStatus[0].workerId,
        );
        expect(mockCareCertificateTab.getCell('D9').value).to.equal(
          secondMockWorkersWithCareCertificateStatus[0].jobRole,
        );
        expect(mockCareCertificateTab.getCell('E9').value).to.equal(
          secondMockWorkersWithCareCertificateStatus[0].status,
        );
      });

      it('should add second worker with care certificate and workplace for second workplace to care certificate table', async () => {
        addContentToCareCertificateTab(
          mockCareCertificateTab,
          mockParentWorkplaceWorkersWithCareCerticateStatus,
          isParent,
        );

        expect(mockCareCertificateTab.getCell('B10').value).to.equal(
          mockParentWorkplaceWorkersWithCareCerticateStatus[1].establishmentName,
        );
        expect(mockCareCertificateTab.getCell('C10').value).to.equal(
          secondMockWorkersWithCareCertificateStatus[1].workerId,
        );
        expect(mockCareCertificateTab.getCell('D10').value).to.equal(
          secondMockWorkersWithCareCertificateStatus[1].jobRole,
        );
        expect(mockCareCertificateTab.getCell('E10').value).to.equal(
          secondMockWorkersWithCareCertificateStatus[1].status,
        );
      });

      describe('Adding blank row to empty table', async () => {
        it('should not add empty row to end of table when there is data', async () => {
          addContentToCareCertificateTab(
            mockCareCertificateTab,
            mockParentWorkplaceWorkersWithCareCerticateStatus,
            isParent,
          );

          const expectedLine = 11;

          expect(mockCareCertificateTab.getCell(`B${expectedLine}`).value).to.equal(null);
          expect(mockCareCertificateTab.getCell(`C${expectedLine}`).value).to.equal(null);
          expect(mockCareCertificateTab.getCell(`D${expectedLine}`).value).to.equal(null);
        });

        it('should add empty row to table when no data', async () => {
          addContentToCareCertificateTab(mockCareCertificateTab, [], isParent);

          const expectedLine = 7;

          expect(mockCareCertificateTab.getCell(`B${expectedLine}`).value).to.equal('');
          expect(mockCareCertificateTab.getCell(`C${expectedLine}`).value).to.equal('');
          expect(mockCareCertificateTab.getCell(`D${expectedLine}`).value).to.equal('');
        });
      });
    });
  });
});
