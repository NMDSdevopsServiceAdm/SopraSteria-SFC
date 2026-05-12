const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const models = require('../../../../../models');

const {
  generateQualificationRecordDetailsTab,
} = require('../../../../../routes/reports/trainingAndQualifications/qualificationRecordDetailsTab');
const { mockEstablishmentsQualificationsResponse } = require('../../../mockdata/trainingAndQualifications');

describe('QualificationRecordDetailsTab', () => {
  let workbook;

  const expectedColumnLabels = [
    'Name or ID number',
    'Main job role',
    'Qualification type',
    'Qualification name',
    'Level',
    'Year achieved',
    'Certificate upload',
  ];

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('generateQualificationRecordDetailsTab', () => {
    const mockData = mockEstablishmentsQualificationsResponse;
    const workers = mockData[0].workers;

    beforeEach(() => {
      workbook = new excelJS.Workbook();
      sinon.stub(models.establishment, 'getWorkerQualifications').resolves(mockData);
    });

    it('should add a worksheet to the excel workbook', async () => {
      await generateQualificationRecordDetailsTab(workbook, 'mock-establishment-id');

      const tab = workbook.getWorksheet('Qualification record details');
      expect(tab.getCell('B1').value).to.deep.equal('Qualification record details');

      const headerRow = tab.getRow(3);
      expect(headerRow.values.slice(2)).to.deep.equal(expectedColumnLabels);
    });

    it('should list the qualification records for each worker', async () => {
      await generateQualificationRecordDetailsTab(workbook, 'mock-establishment-id');

      const tab = workbook.getWorksheet('Qualification record details');
      const qualificationNameColumnNumber = tab.getRow(3).values.indexOf('Qualification name');
      const qualificationNameColumn = tab.getColumn(qualificationNameColumnNumber);

      workers.forEach((worker) => {
        worker.qualifications.forEach((qualification) => {
          const rowNumber = qualificationNameColumn.values.indexOf(qualification.qualification.title);
          const row = tab.getRow(rowNumber);

          const expectedData = [
            worker.NameOrIdValue,
            worker.mainJob.title,
            qualification.qualification.group,
            qualification.qualification.title,
            Number(qualification.qualification.level),
            qualification.year,
            qualification.qualificationCertificatesCount > 0 ? 'Yes' : 'No',
          ];

          expect(row.values.slice(2)).to.deep.equal(expectedData);
        });
      });
    });
  });
});
