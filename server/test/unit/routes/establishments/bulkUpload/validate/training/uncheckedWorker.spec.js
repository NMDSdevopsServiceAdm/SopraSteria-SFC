const expect = require('chai').expect;
const {
  workerNotFoundInFile,
  addNoWorkerError,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/training/uncheckedWorker');

describe('uncheckedWorker', () => {
  describe('workerNotFoundInFile', () => {
    it('should return true if no object with given key in allWorkersByKey', async () => {
      const allWorkersByKey = {
        worker1: {},
        worker2: {},
      };
      const workerKey = 'unknownWorker';

      const result = workerNotFoundInFile(allWorkersByKey, workerKey);

      expect(result).to.equal(true);
    });

    it('should return false if object with given key in allWorkersByKey', async () => {
      const allWorkersByKey = {
        worker1: {},
        worker2: {},
      };
      const workerKey = 'worker2';

      const result = workerNotFoundInFile(allWorkersByKey, workerKey);

      expect(result).to.equal(false);
    });
  });

  describe('addNoWorkerError', () => {
    it('should add error to csvWorkerSchemaErrors with record details', async () => {
      const csvWorkerSchemaErrors = [];

      const trainingRecord = {
        lineNumber: 5,
        localId: 'testWorker',
        uniqueWorkerId: 'testWorker',
      };

      addNoWorkerError(csvWorkerSchemaErrors, trainingRecord);

      expect(csvWorkerSchemaErrors.length).to.equal(1);
      expect(csvWorkerSchemaErrors[0]).to.deep.equal({
        origin: 'Training',
        lineNumber: trainingRecord.lineNumber,
        errCode: 996,
        errType: 'UNCHECKED_WORKER_ERROR',
        error: 'UNIQUEWORKERID has not been supplied',
        source: trainingRecord.localId,
        column: 'UNIQUEWORKERID',
        worker: trainingRecord.uniqueWorkerId,
        name: trainingRecord.localId,
      });
    });
  });
});
