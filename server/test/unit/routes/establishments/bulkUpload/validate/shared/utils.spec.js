const expect = require('chai').expect;
const { createWorkerKey } = require('../../../../../../../routes/establishments/bulkUpload/validate/shared/utils');

describe('utils', () => {
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

    it('should return key with just localId (with whitespace removed) if uniqueWorkerId is null', async () => {
      const worker = { localId: 'Workplace With Spaces', uniqueWorkerId: null };

      const workerKey = createWorkerKey(worker.localId, worker.uniqueWorkerId);

      expect(workerKey).to.equal('WorkplaceWithSpaces');
    });
  });
});
