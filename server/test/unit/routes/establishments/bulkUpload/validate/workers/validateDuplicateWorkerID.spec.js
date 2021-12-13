const {
  validateDuplicateWorkerID,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateDuplicateWorkerID');
const buildWorkerCSV = require('../../../../../../../test/factories/worker/csv');
const WorkerCsvValidator = require('../../../../../../../models/BulkImport/csv/workers');
const expect = require('chai').expect;

describe('validateDuplicateWorkerID()', () => {
  it('errors when CHGUNIQUEWRKID is not unique', async () => {
    const csvWorkerSchemaErrors = [];
    const allWorkersByKey = {};
    const myAPIWorkers = [];
    const myWorkers = [
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'Worker 1',
        },
      }),
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'Worker 2',
          CHGUNIQUEWRKID: 'Worker 1',
        },
      }),
    ].map((currentLine, currentLineNumber) => {
      const worker = new WorkerCsvValidator.Worker(currentLine, currentLineNumber, []);

      worker.validate();

      return worker;
    });

    const allKeys = myWorkers.map((worker) => (worker.local + worker.uniqueWorker).replace(/\s/g, ''));

    myWorkers.forEach((thisWorker) => {
      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = (thisWorker.local + thisWorker.uniqueWorker).replace(/\s/g, '');
      const changeKeyNoWhitespace = thisWorker.changeUniqueWorker
        ? (thisWorker.local + thisWorker.changeUniqueWorker).replace(/\s/g, '')
        : null;

      if (
        validateDuplicateWorkerID(
          myWorkers[1],
          allKeys,
          changeKeyNoWhitespace,
          keyNoWhitespace,
          allWorkersByKey,
          myAPIWorkers,
          csvWorkerSchemaErrors,
        )
      ) {
        allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;

        // to prevent subsequent Worker duplicates, add also the change worker id if CHGUNIQUEWORKERID is given
        if (changeKeyNoWhitespace) {
          allWorkersByKey[changeKeyNoWhitespace] = thisWorker.lineNumber;
        }
      }
    });

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
});
