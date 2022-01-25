const expect = require('chai').expect;
const {
  createKeysForWorkers,
  deleteWorker,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateWorkers');

describe('validateWorkers', () => {
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
