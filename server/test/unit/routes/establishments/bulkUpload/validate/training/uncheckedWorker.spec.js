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
    it('should add error to csvWorkerSchemaErrors with worker details', async () => {
      const csvWorkerSchemaErrors = [];

      const thisWorker = {
        lineNumber: 5,
        localId: 'testWorker',
        uniqueWorkerId: 'testWorker',
      };

      addNoWorkerError(csvWorkerSchemaErrors, thisWorker);

      expect(csvWorkerSchemaErrors.length).to.equal(1);
      expect(csvWorkerSchemaErrors[0]).to.deep.equal({
        origin: 'Workers',
        lineNumber: thisWorker.lineNumber,
        errCode: 996,
        errType: 'UNCHECKED_WORKER_ERROR',
        error: 'UNIQUEWORKERID has not been supplied',
        source: thisWorker.localId,
        column: 'UNIQUEWORKERID',
        worker: thisWorker.uniqueWorkerId,
        name: thisWorker.localId,
      });
    });
  });
});
