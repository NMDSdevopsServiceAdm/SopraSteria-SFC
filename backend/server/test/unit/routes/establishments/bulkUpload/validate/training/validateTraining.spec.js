const expect = require('chai').expect;
const {
  associateTrainingWithWorker,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/training/validateTraining');
const { Worker } = require('../../../../../../../models/classes/worker');
const { Training } = require('../../../../../../../models/classes/training');

describe('validateTraining', () => {
  describe('associateTrainingWithWorker', () => {
    let allWorkersByKey;
    let myAPIWorkers;
    let APITrainingRecords;
    let trainingRecord;

    beforeEach(() => {
      allWorkersByKey = { bua: '2' };
      myAPIWorkers = {
        2: new Worker(),
      };
      APITrainingRecords = { 2: new Training() };
      trainingRecord = {
        lineNumber: 2,
        uniqueWorkerId: 'a',
      };
    });

    it('should not modify myAPIWorkers when no matching worker found', async () => {
      const workerKey = 'abc';

      const expectedMyAPIWorkers = {
        2: new Worker(),
      };

      associateTrainingWithWorker(allWorkersByKey, workerKey, myAPIWorkers, APITrainingRecords, trainingRecord);

      expect(myAPIWorkers).to.deep.equal(expectedMyAPIWorkers);
    });

    it('should add training to worker in myAPIWorkers when matching key in allWorkersByKey', async () => {
      const workerKey = 'bua';

      const expectedWorker = new Worker();
      expectedWorker.associateTraining(new Training());

      const expectedMyAPIWorkers = {
        2: expectedWorker,
      };

      associateTrainingWithWorker(allWorkersByKey, workerKey, myAPIWorkers, APITrainingRecords, trainingRecord);

      expect(myAPIWorkers).to.deep.equal(expectedMyAPIWorkers);
    });
  });
});
