const expect = require('chai').expect;

const {
  createWorkerKey,
  deleteRecord,
  csvQuote,
  createEstablishmentKey,
  dateFormatter,
} = require('../../../utils/bulkUploadUtils');

describe('bulkUploadUtils', () => {
  describe('dateFormatter', () => {
    it('should return the date correctly formatted when a date is passed', () => {
      expect(dateFormatter('1998-02-03')).to.equal('03/02/1998');
    });
    it('should return am empty string if no date is given', () => {
      expect(dateFormatter(null)).to.equal('');
    });
    it('should return an empty string if an empty string is given', () => {
      expect(dateFormatter('')).to.equal('');
    });
  });

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

  describe('createEstablishmentKey', () => {
    it('should return empty string if null passed in', async () => {
      const establishmentKey = createEstablishmentKey(null);

      expect(establishmentKey).to.equal('');
    });

    it('should return string establishmentId as is if no spaces', async () => {
      const establishmentKey = createEstablishmentKey('Workplace');

      expect(establishmentKey).to.equal('Workplace');
    });

    it('should return establishmentId with whitespace removed', async () => {
      const establishmentKey = createEstablishmentKey('Workplace With Spaces');

      expect(establishmentKey).to.equal('WorkplaceWithSpaces');
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
