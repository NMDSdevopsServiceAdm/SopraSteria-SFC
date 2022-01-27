const expect = require('chai').expect;
const { createWorkerKey, deleteRecord, csvQuote } = require('../../../utils/bulkUploadUtils');

describe('bulkUploadUtils', () => {
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

  describe('deleteRecord', () => {
    it('should remove worker key/value from myAPIWorkers', async () => {
      const myAPIWorkers = {
        2: {},
        3: {},
      };

      const workerLineNumber = 3;

      deleteRecord(myAPIWorkers, workerLineNumber);

      expect(!myAPIWorkers[workerLineNumber]).to.equal(true);
    });
  });

  describe('csvQuote()', () => {
    it('should add quotes around string with a , ', () => {
      expect(csvQuote('Hello, ')).to.equal('"Hello, "');
    });

    it('should not add quotes around string with out a , ', () => {
      expect(csvQuote('Hello')).to.equal('Hello');
    });
  });
});
