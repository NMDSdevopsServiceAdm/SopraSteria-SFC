const expect = require('chai').expect;
const {
  createKeysForWorkers,
  createWorkerKey,
} = require('../../../../../../routes/establishments/bulkUpload/validate/validateBulkUploadFiles');

describe('validateBulkUploadFiles', () => {
  describe('createWorkerKey', () => {
    it('should return key with local and uniqueWorker concatenated', async () => {
      const worker = { local: 'mockWorkplace', uniqueWorker: 'testUser' };

      const workerKey = createWorkerKey(worker.local, worker.uniqueWorker);

      expect(workerKey).to.equal('mockWorkplacetestUser');
    });

    it('should return key with local and uniqueWorker concatenated with whitespace removed', async () => {
      const worker = { local: 'Workplace With Spaces', uniqueWorker: 'Test User' };

      const workerKey = createWorkerKey(worker.local, worker.uniqueWorker);

      expect(workerKey).to.equal('WorkplaceWithSpacesTestUser');
    });
  });

  describe('createKeysForWorkers', () => {
    it('should return array of keys with local and uniqueWorker concatenated', async () => {
      const workers = [
        { local: 'Another Test Workplace', uniqueWorker: 'User 1' },
        { local: 'The Place', uniqueWorker: 'User 2' },
      ];

      const workerKeys = createKeysForWorkers(workers);

      expect(workerKeys[0]).to.equal('AnotherTestWorkplaceUser1');
      expect(workerKeys[1]).to.equal('ThePlaceUser2');
    });
  });
});
