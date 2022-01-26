const expect = require('chai').expect;
const moment = require('moment');

const {
  addDobTrainingMismatchError,
  trainingCompletedBeforeAgeFourteen,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/training/dobTrainingMismatch');

describe('dobTrainingMismatch', () => {
  describe('trainingCompletedBeforeAgeFourteen', () => {
    let trainingRecord;
    beforeEach(() => {
      trainingRecord = {
        completed: moment('2020-01-01'),
      };
    });

    it('should return false if no worker with matching key in workersKeyed', async () => {
      const workersKeyed = {
        worker1: {},
      };
      const workerKey = 'unknownWorker';

      const result = trainingCompletedBeforeAgeFourteen(trainingRecord, workersKeyed, workerKey);

      expect(result).to.equal(false);
    });

    it('should return false if worker DOB is invalid', async () => {
      const workersKeyed = {
        worker1: {
          DOB: 'invalidDate',
        },
      };
      const workerKey = 'worker1';

      const result = trainingCompletedBeforeAgeFourteen(trainingRecord, workersKeyed, workerKey);

      expect(result).to.equal(false);
    });

    it('should return false if worker DOB is more than 14 years before training date', async () => {
      const workersKeyed = {
        worker1: {
          DOB: moment('2000-01-01'),
        },
      };
      const workerKey = 'worker1';

      const result = trainingCompletedBeforeAgeFourteen(trainingRecord, workersKeyed, workerKey);

      expect(result).to.equal(false);
    });

    it('should return true if matched worker has DOB less than 14 years before training date', async () => {
      const workersKeyed = {
        worker1: {
          DOB: moment('2007-01-01'),
        },
      };
      const workerKey = 'worker1';

      const result = trainingCompletedBeforeAgeFourteen(trainingRecord, workersKeyed, workerKey);

      expect(result).to.equal(true);
    });
  });

  describe('addDobTrainingMismatchError', () => {
    it('should add error to csvWorkerSchemaErrors with record details', async () => {
      const csvWorkerSchemaErrors = [];

      const trainingRecord = {
        lineNumber: 5,
        localId: 'testWorker',
        uniqueWorkerId: 'testWorker',
      };

      addDobTrainingMismatchError(csvWorkerSchemaErrors, trainingRecord);

      expect(csvWorkerSchemaErrors.length).to.equal(1);
      expect(csvWorkerSchemaErrors[0]).to.deep.equal({
        origin: 'Training',
        lineNumber: trainingRecord.lineNumber,
        errCode: 1080,
        errType: 'WORKER_DOB_TRAINING_WARNING',
        error: "DATECOMPLETED is within 14 years of staff record's date of birth",
        source: trainingRecord.localId,
        column: 'DATECOMPLETED',
        worker: trainingRecord.uniqueWorkerId,
        name: trainingRecord.localId,
      });
    });
  });
});
