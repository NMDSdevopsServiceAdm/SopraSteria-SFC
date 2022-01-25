const expect = require('chai').expect;
const {
  createKeysForWorkers,
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
});
