const expect = require('chai').expect;
const {
  createKeysForWorkers,
  createWorkerKey,
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
