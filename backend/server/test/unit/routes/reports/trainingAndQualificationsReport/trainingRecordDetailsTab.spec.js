const excelJS = require('exceljs');
const expect = require('chai').expect;

const { mockWorkerTrainingRecords } = require('../../../mockdata/trainingAndQualifications');
const { listAllExistingAndMissingTrainings } = require('../../../../../utils/trainingAndQualificationsUtils');
const {
  generateTrainingRecordDetailsTab,
} = require('../../../../../routes/reports/trainingAndQualifications/trainingRecordDetailsTab');

describe('TrainingRecordDetailsTab', () => {
  let workbook;
  const expectedColumnLabels = [
    'Name or ID number',
    'Main job role',
    'Training category',
    'Training or course name',
    'Mandatory',
    'Validity period',
    'Completion date',
    'Expiry date',
    'Status',
    'Accredited',
    'In-house or external',
    'Provider name',
    'Delivery method',
    'Certificate upload',
    'Long term absence',
  ];

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateTrainingRecordDetailsTab', () => {
    const allTrainingRecordsAndMissingTrainings = listAllExistingAndMissingTrainings(mockWorkerTrainingRecords);
    const allTrainingRecords = allTrainingRecordsAndMissingTrainings.filter(
      (training) => training.status !== 'Missing',
    );
    const mockWorkers = mockWorkerTrainingRecords[0].workerRecords;
    const allMissingMandatoryTrainings = mockWorkers.flatMap((worker) => worker.missingMandatoryTrainings);

    it('should add a worksheet to the excel workbook', () => {
      generateTrainingRecordDetailsTab(workbook, allTrainingRecordsAndMissingTrainings);

      const tab = workbook.getWorksheet('Training record details');
      expect(tab.getCell('B1').value).to.deep.equal('Training record details');

      const headerRow = tab.getRow(3);
      expect(headerRow.values.slice(2)).to.deep.equal(expectedColumnLabels);
    });

    it('should show the training records for every worker', () => {
      generateTrainingRecordDetailsTab(workbook, allTrainingRecordsAndMissingTrainings);

      const tab = workbook.getWorksheet('Training record details');

      const trainingNameColumnNumber = tab.getRow(3).values.indexOf('Training or course name');
      const trainingNameColumn = tab.getColumn(trainingNameColumnNumber);

      allTrainingRecords.forEach((training) => {
        const trainingRowNumber = trainingNameColumn.values.indexOf(training.trainingName);
        const trainingRow = tab.getRow(trainingRowNumber);
        const expectedData = [
          training.workerNameOrId,
          training.mainJobRole,
          training.category,
          training.trainingName,
          training.isMandatory,
          training.validityPeriodInMonth,
          training.dateCompleted,
          training.expiryDate,
          training.status,
          training.accredited,
          training.deliveredBy,
          training.trainingProviderName,
          training.howWasItDelivered,
          training.trainingCertificateUploaded,
          training.isInLongTermAbsence,
        ].map((value) => value ?? '-');

        expect(trainingRow.values.slice(2)).to.deep.equals(expectedData);
      });
    });

    it('should show one empty row if there are no training records at all', () => {
      generateTrainingRecordDetailsTab(workbook, []);

      const tab = workbook.getWorksheet('Training record details');

      expect(tab.getRow(4).values.slice(2)).to.deep.equal(Array(15).fill(''));
    });

    it('should show the missing mandatory trainings for every worker', () => {
      generateTrainingRecordDetailsTab(workbook, allTrainingRecordsAndMissingTrainings);

      const tab = workbook.getWorksheet('Training record details');

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
            worker.workerId,
            worker.jobRole,
            mandatoryTraining.category,
            '-',
            'Yes',
            '-',
            '-',
            '-',
            'Missing',
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
          ]);
        });
      });
    });
  });
});
