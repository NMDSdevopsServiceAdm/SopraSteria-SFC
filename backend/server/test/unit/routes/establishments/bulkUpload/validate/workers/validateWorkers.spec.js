const expect = require('chai').expect;
const sinon = require('sinon');

const {
  createKeysForWorkers,
  associateWorkerWithEstablishment,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateWorkers');
const { Worker } = require('../../../../../../../models/classes/worker');
const { Establishment } = require('../../../../../../../models/classes/establishment');

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

  describe('associateWorkerWithEstablishment', () => {
    let myAPIEstablishments;
    let myAPIWorkers;
    let thisWorker;

    beforeEach(() => {
      myAPIEstablishments = {
        bu: new Establishment(),
      };

      thisWorker = {
        lineNumber: 2,
        uniqueWorkerId: 'a',
      };

      const worker = new Worker();
      sinon.stub(worker, 'key').get(() => 'a');
      myAPIWorkers = {
        2: worker,
      };
    });

    it('should not modify myAPIEstablishments when no matching establishment found', async () => {
      const establishmentKey = 'abc';

      const expectedMyAPIEstablishments = {
        bu: new Establishment(),
      };

      associateWorkerWithEstablishment(myAPIEstablishments, establishmentKey, myAPIWorkers, thisWorker);

      expect(myAPIEstablishments).to.deep.equal(expectedMyAPIEstablishments);
    });

    it('should add worker to myAPIEstablishments when matching key in myAPIEstablishments', async () => {
      const establishmentKey = 'bu';

      const expectedEstablishment = new Establishment();

      expectedEstablishment.associateWorker('a', new Worker());

      const expectedMyAPIEstablishments = {
        bu: expectedEstablishment,
      };

      associateWorkerWithEstablishment(myAPIEstablishments, establishmentKey, myAPIWorkers, thisWorker);

      expect(myAPIEstablishments).to.deep.equal(expectedMyAPIEstablishments);
    });
  });
});
