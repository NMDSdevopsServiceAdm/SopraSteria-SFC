const expect = require('chai').expect;
const {
  createKeysForWorkers,
  createWorkerKey,
  establishmentNotFoundInFile,
  addNoEstablishmentError,
  deleteWorker,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateWorkers');

describe('validateWorkers', () => {
  describe('createWorkerKey', () => {
    it('should return key with localId and uniqueWorkerId concatenated', async () => {
      const worker = { localId: 'mockWorkplace', uniqueWorkerId: 'testUser' };

      const workerKey = createWorkerKey(worker.localId, worker.uniqueWorkerId);

      expect(workerKey).to.equal('mockWorkplacetestUser');
    });

    it('should return key with localId and uniqueWorkerId concatenated with whitespace removed', async () => {
      const worker = { localId: 'Workplace With Spaces', uniqueWorkerId: 'Test User' };

      const workerKey = createWorkerKey(worker.localId, worker.uniqueWorkerId);

      expect(workerKey).to.equal('WorkplaceWithSpacesTestUser');
    });
  });

  describe('createKeysForWorkers', () => {
    it('should return array of keys with localId and uniqueWorkerId concatenated', async () => {
      const workers = [
        { localId: 'Another Test Workplace', uniqueWorkerId: 'User 1' },
        { localId: 'The Place', uniqueWorkerId: 'User 2' },
      ];

      const workerKeys = createKeysForWorkers(workers);

      expect(workerKeys[0]).to.equal('AnotherTestWorkplaceUser1');
      expect(workerKeys[1]).to.equal('ThePlaceUser2');
    });
  });

  describe('establishmentNotFoundInFile', () => {
    it('should return true if no object with given key in allEstablishmentsByKey', async () => {
      const allEstablishmentsByKey = {
        establishment1: {},
        establishment2: {},
      };
      const establishmentKey = 'unknownEstablishment';

      const result = establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey);

      expect(result).to.equal(true);
    });

    it('should return false if object with given key in allEstablishmentsByKey', async () => {
      const allEstablishmentsByKey = {
        establishment1: {},
        establishment2: {},
      };
      const establishmentKey = 'establishment2';

      const result = establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey);

      expect(result).to.equal(false);
    });
  });

  describe('addNoEstablishmentError', () => {
    it('should add error to csvWorkerSchemaErrors with worker details', async () => {
      const csvWorkerSchemaErrors = [];

      const thisWorker = {
        lineNumber: 5,
        localId: 'testEstablishment',
        uniqueWorkerId: 'testWorker',
      };

      addNoEstablishmentError(csvWorkerSchemaErrors, thisWorker);

      expect(csvWorkerSchemaErrors.length).to.equal(1);
      expect(csvWorkerSchemaErrors[0]).to.deep.equal({
        origin: 'Workers',
        lineNumber: thisWorker.lineNumber,
        errCode: 997,
        errType: 'UNCHECKED_ESTABLISHMENT_ERROR',
        error: 'LOCALESTID does not exist in Workplace file',
        source: thisWorker.localId,
        column: 'LOCALESTID',
        worker: thisWorker.uniqueWorkerId,
        name: thisWorker.localId,
      });
    });
  });

  describe('deleteWorker', () => {
    it('should remove worker key/value from myAPIWorkers', async () => {
      const myAPIWorkers = {
        2: {},
        3: {},
      };

      const workerLineNumber = 3;

      deleteWorker(myAPIWorkers, workerLineNumber);

      expect(!myAPIWorkers[workerLineNumber]).to.equal(true);
    });
  });
});
