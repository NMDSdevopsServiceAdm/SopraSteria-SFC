const excelJS = require('exceljs');
const expect = require('chai').expect;

const { mockWorkerTrainingRecords } = require('../../../mockdata/trainingAndQualifications');
const {
  generateExpiredTrainingTab,
} = require('../../../../../routes/reports/trainingAndQualifications/expiredTrainingTab');

describe('ExpiredTrainingTab', () => {
  let workbook;
  const expectedColumnLabels = [
    'Training category',
    'Training or course name',
    'Name or ID number',
    'Mandatory',
    'Status',
    'Expiry date',
  ];

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateExpiredTrainingTab', () => {
    const mockWorkers = mockWorkerTrainingRecords[0].workerRecords;
    const allMissingMandatoryTrainings = mockWorkers.flatMap((worker) => worker.missingMandatoryTrainings);

    it('should add a worksheet to the excel workbook', () => {
      generateExpiredTrainingTab(workbook, mockWorkerTrainingRecords);

      const tab = workbook.getWorksheet('Expired training');
      expect(tab.getCell('B1').value).to.deep.equal('Expired and missing training');

      const headerRow = tab.getRow(4);
      expect(headerRow.values.slice(2)).to.deep.equal(expectedColumnLabels);
    });

    it('should list the expired or expiring trainings for each worker', () => {
      generateExpiredTrainingTab(workbook, mockWorkerTrainingRecords);

      const tab = workbook.getWorksheet('Expired training');

      const trainingNameColumnNumber = tab.getRow(4).values.indexOf('Training or course name');
      const trainingNameColumn = tab.getColumn(trainingNameColumnNumber);

      mockWorkers.forEach((worker) => {
        const trainingRecords = worker.trainingRecords;
        trainingRecords.forEach((training) => {
          if (training.status === 'Expired' || training.status === 'Expiring soon') {
            const trainingRowNumber = trainingNameColumn.values.indexOf(training.trainingName);
            const trainingRow = tab.getRow(trainingRowNumber);
            expect(trainingRow.values.slice(2)).to.deep.equals([
              training.category,
              training.trainingName,
              worker.workerId,
              training.isMandatory,
              training.status,
              training.expiryDate,
            ]);
          }
        });
      });
    });

    it('should list the missing mandatory trainings for each worker', () => {
      generateExpiredTrainingTab(workbook, mockWorkerTrainingRecords);

      const tab = workbook.getWorksheet('Expired training');

      const allRowValues = tab.getSheetValues();
      const rowsOfMissingTraining = allRowValues.filter((row) => row?.indexOf('Missing') >= 0);

      expect(rowsOfMissingTraining.length).to.equal(allMissingMandatoryTrainings.length);

      mockWorkers.forEach((worker) => {
        const missingMandatoryTrainings = worker.missingMandatoryTrainings;
        missingMandatoryTrainings.forEach((mandatoryTraining) => {
          const rowFound = rowsOfMissingTraining.find(
            (row) => row.includes(mandatoryTraining.category) && row.includes(worker.workerId),
          );

          expect(rowFound.slice(2)).to.deep.equal([
            mandatoryTraining.category,
            '-',
            worker.workerId,
            'Yes',
            'Missing',
            '-',
          ]);
        });
      });
    });

    it('should not include up-to-date trainings in the table', () => {
      generateExpiredTrainingTab(workbook, mockWorkerTrainingRecords);

      const tab = workbook.getWorksheet('Expired training');

      const statusColumnNumber = tab.getRow(4).values.indexOf('Status');
      const statusColumn = tab.getColumn(statusColumnNumber);

      expect(statusColumn.values).not.to.include('Up-to-date');
    });
  });
});
