const {
  validateDuplicateWorkerID,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateDuplicateWorkerID');
const {
  createWorkerKey,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateWorkers');
const expect = require('chai').expect;

describe('validateDuplicateWorkerID()', () => {
  describe('changeUniqueWorker', () => {
    it('adds error to csvWorkerSchemaErrors when changeUniqueWorker is not unique when already in allKeys object', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {};
      const myAPIWorkers = [];
      const thisWorker = {
        localId: 'foo',
        uniqueWorkerId: 'Worker 2',
        changeUniqueWorker: 'Worker 1',
        lineNumber: 1,
      };

      const allKeys = ['fooWorker1', 'fooWorker2'];

      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = thisWorker.changeUniqueWorker
        ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
        : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

      validateDuplicateWorkerID(
        thisWorker,
        allKeys,
        keyNoWhitespace,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      );

      expect(csvWorkerSchemaErrors.length).equals(1);
      expect(csvWorkerSchemaErrors[0]).to.eql({
        origin: 'Workers',
        lineNumber: 1,
        errCode: 998,
        errType: 'DUPLICATE_ERROR',
        error: 'CHGUNIQUEWRKID Worker 1 is not unique',
        name: 'foo',
        source: 'Worker 2',
        worker: 'Worker 2',
        column: 'CHGUNIQUEWRKID',
      });
    });

    it('adds error to csvWorkerSchemaErrors when changeUniqueWorker is not unique when key found in allWorkersByKey', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {
        fooWorker1: 1,
      };
      const myAPIWorkers = [];
      const thisWorker = {
        localId: 'foo',
        uniqueWorkerId: 'Worker 2',
        changeUniqueWorker: 'Worker 1',
        lineNumber: 1,
      };

      const allKeys = [];

      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = thisWorker.changeUniqueWorker
        ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
        : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

      validateDuplicateWorkerID(
        thisWorker,
        allKeys,
        keyNoWhitespace,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      );

      expect(csvWorkerSchemaErrors.length).equals(1);
      expect(csvWorkerSchemaErrors[0]).to.eql({
        origin: 'Workers',
        lineNumber: 1,
        errCode: 998,
        errType: 'DUPLICATE_ERROR',
        error: 'CHGUNIQUEWRKID Worker 1 is not unique',
        name: 'foo',
        source: 'Worker 2',
        worker: 'Worker 2',
        column: 'CHGUNIQUEWRKID',
      });
    });

    it('should delete worker from myAPIWorkers when changeUniqueWorker is duplicate', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {
        fooWorker1: 1,
      };
      const myAPIWorkers = {
        1: {
          uniqueWorkerId: 'Worker 2',
        },
      };
      const thisWorker = {
        localId: 'foo',
        uniqueWorkerId: 'Worker 2',
        changeUniqueWorker: 'Worker 1',
        lineNumber: 1,
      };

      const allKeys = ['fooWorker1', 'fooWorker2'];

      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = thisWorker.changeUniqueWorker
        ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
        : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

      validateDuplicateWorkerID(
        thisWorker,
        allKeys,
        keyNoWhitespace,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      );

      expect(myAPIWorkers).to.deep.equal({});
    });

    it('should return false when changeUniqueWorker is duplicate', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {
        fooWorker1: 1,
      };
      const myAPIWorkers = {};
      const thisWorker = {
        localId: 'foo',
        uniqueWorkerId: 'Worker 2',
        changeUniqueWorker: 'Worker 1',
        lineNumber: 1,
      };

      const allKeys = ['fooWorker1', 'fooWorker2'];

      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = thisWorker.changeUniqueWorker
        ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
        : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

      const response = validateDuplicateWorkerID(
        thisWorker,
        allKeys,
        keyNoWhitespace,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      );

      expect(response).to.be.false;
    });
  });

  describe('uniqueWorkerId', () => {
    it('adds error to csvWorkerSchemaErrors when uniqueWorkerId is not unique when already in allWorkersByKey object', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {
        fooWorker1: 1,
      };
      const myAPIWorkers = [];
      const thisWorker = {
        localId: 'foo',
        uniqueWorkerId: 'Worker 1',
        lineNumber: 1,
      };

      const allKeys = [];

      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = thisWorker.changeUniqueWorker
        ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
        : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

      validateDuplicateWorkerID(
        thisWorker,
        allKeys,
        keyNoWhitespace,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      );

      expect(csvWorkerSchemaErrors.length).equals(1);
      expect(csvWorkerSchemaErrors[0]).to.eql({
        origin: 'Workers',
        lineNumber: 1,
        errCode: 998,
        errType: 'DUPLICATE_ERROR',
        error: 'UNIQUEWORKERID Worker 1 is not unique',
        name: 'foo',
        source: 'Worker 1',
        worker: 'Worker 1',
        column: 'UNIQUEWORKERID',
      });
    });

    it('should delete worker from myAPIWorkers when uniqueWorkerId is duplicate', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {
        fooWorker1: 1,
      };
      const myAPIWorkers = {
        1: {
          uniqueWorkerId: 'Worker 1',
        },
      };
      const thisWorker = {
        localId: 'foo',
        uniqueWorkerId: 'Worker 1',
        lineNumber: 1,
      };

      const allKeys = ['fooWorker1', 'fooWorker2'];

      const keyNoWhitespace = thisWorker.changeUniqueWorker
        ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
        : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

      validateDuplicateWorkerID(
        thisWorker,
        allKeys,
        keyNoWhitespace,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      );

      expect(myAPIWorkers).to.deep.equal({});
    });

    it('should return false when uniqueWorkerId is duplicate', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {
        fooWorker1: 1,
      };
      const myAPIWorkers = {};
      const thisWorker = {
        localId: 'foo',
        uniqueWorkerId: 'Worker 1',
        lineNumber: 1,
      };

      const allKeys = ['fooWorker1', 'fooWorker2'];

      const keyNoWhitespace = thisWorker.changeUniqueWorker
        ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
        : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

      const response = validateDuplicateWorkerID(
        thisWorker,
        allKeys,
        keyNoWhitespace,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      );

      expect(response).to.be.false;
    });
  });

  it('should return true when no duplicate is found', async () => {
    const csvWorkerSchemaErrors = [];
    const allWorkersByKey = {
      fooWorker2: 1,
    };
    const myAPIWorkers = {};
    const thisWorker = {
      localId: 'foo',
      uniqueWorkerId: 'Worker 1',
      lineNumber: 1,
    };

    const allKeys = ['fooWorker1', 'fooWorker2'];

    const keyNoWhitespace = thisWorker.changeUniqueWorker
      ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
      : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

    const response = validateDuplicateWorkerID(
      thisWorker,
      allKeys,
      keyNoWhitespace,
      allWorkersByKey,
      myAPIWorkers,
      csvWorkerSchemaErrors,
    );

    expect(response).to.be.true;
  });
});
