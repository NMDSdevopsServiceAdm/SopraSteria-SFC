const expect = require('chai').expect;
const {
  establishmentNotFoundInFile,
  addNoAssociatedEstablishmentError,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/shared/noAssociatedEstablishment');

describe('noAssociatedEstablishment', () => {
  describe('establishmentNotFoundInFile', () => {
    it('should return true if no object with given key in allEstablishmentsByKey', async () => {
      const allEstablishmentsByKey = {
        establishment1: {},
        establishment2: {},
      };
      const establishmentKey = 'unknownEstablishment';

      const result = establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey);

      expect(result).to.equal(true);
    });

    it('should return false if object with given key in allEstablishmentsByKey', async () => {
      const allEstablishmentsByKey = {
        establishment1: {},
        establishment2: {},
      };
      const establishmentKey = 'establishment2';

      const result = establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey);

      expect(result).to.equal(false);
    });
  });

  describe('addNoAssociatedEstablishmentError', () => {
    it('should add error to csvWorkerSchemaErrors with worker details', async () => {
      const csvWorkerSchemaErrors = [];

      const thisWorker = {
        lineNumber: 5,
        localId: 'testEstablishment',
        uniqueWorkerId: 'testWorker',
      };

      addNoAssociatedEstablishmentError(csvWorkerSchemaErrors, thisWorker, 'Workers');

      expect(csvWorkerSchemaErrors.length).to.equal(1);
      expect(csvWorkerSchemaErrors[0]).to.deep.equal({
        origin: 'Workers',
        lineNumber: thisWorker.lineNumber,
        errCode: 997,
        errType: 'NO_ASSOCIATED_ESTABLISHMENT_ERROR',
        error: 'LOCALESTID does not exist in Workplace file',
        source: thisWorker.localId,
        column: 'LOCALESTID',
        worker: thisWorker.uniqueWorkerId,
        name: thisWorker.localId,
      });
    });

    it('should add error to csvTrainingSchemaErrors with origin set to Training when passed in', async () => {
      const csvTrainingSchemaErrors = [];

      const thisTraining = {
        lineNumber: 5,
        localId: 'testEstablishment',
        uniqueWorkerId: 'testWorker',
      };

      addNoAssociatedEstablishmentError(csvTrainingSchemaErrors, thisTraining, 'Training');

      expect(csvTrainingSchemaErrors[0].origin).to.deep.equal('Training');
    });
  });
});
