const expect = require('chai').expect;
const {
  addDobTrainingMismatchError,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/training/dobTrainingMismatch');

describe('dobTrainingMismatch', () => {
  describe('addDobTrainingMismatchError', () => {
    it('should add error to csvWorkerSchemaErrors with record details', async () => {
      const csvWorkerSchemaErrors = [];

      const trainingRecord = {
        lineNumber: 5,
        localId: 'testWorker',
        uniqueWorkerId: 'testWorker',
      };

      addDobTrainingMismatchError(csvWorkerSchemaErrors, trainingRecord);

      expect(csvWorkerSchemaErrors.length).to.equal(1);
      expect(csvWorkerSchemaErrors[0]).to.deep.equal({
        origin: 'Training',
        lineNumber: trainingRecord.lineNumber,
        errCode: 1080,
        errType: 'WORKER_DOB_TRAINING_WARNING',
        error: "DATECOMPLETED is before staff record's date of birth",
        source: trainingRecord.localId,
        column: 'DATECOMPLETED',
        worker: trainingRecord.uniqueWorkerId,
        name: trainingRecord.localId,
      });
    });
  });
});
