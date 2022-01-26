const WorkerCsvValidator =
  require('../../../../../../lambdas/bulkUpload/classes/workerCSVValidator.js').WorkerCsvValidator;
const mappings = require('../../../../../models/BulkImport/BUDI/index.js').mappings;

const {
  crossValidate,
  _crossValidateMainJobRole,
  _isCQCRegulated,
} = require('../../../../../models/BulkImport/csv/crossValidate');
const sinon = require('sinon');
const models = require('../../../../../models');
const expect = require('chai').expect;

describe('crossValidate', () => {
  describe('_crossValidateMainJobRole', () => {
    it('should add error to csvWorkerSchemaErrors if establishment not CQC regulated and main role ID is 4', () => {
      const csvWorkerSchemaErrors = [];

      const worker = new WorkerCsvValidator(null, null, null, mappings);
      const JSONWorker = worker.toJSON();
      JSONWorker.status = 'NEW';
      JSONWorker.mainJobRoleId = 4;

      _crossValidateMainJobRole(csvWorkerSchemaErrors, false, JSONWorker);

      expect(csvWorkerSchemaErrors.length).to.equal(1);
      expect(csvWorkerSchemaErrors[0]).to.deep.equal({
        worker: JSONWorker.uniqueWorkerId,
        name: JSONWorker.localId,
        lineNumber: JSONWorker.lineNumber,
        errCode: 1280,
        errType: 'MAIN_JOB_ROLE_ERROR',
        source: JSONWorker.mainJobRoleId,
        column: 'MAINJOBROLE',
        error:
          'Workers MAINJOBROLE is Registered Manager but you are not providing a CQC regulated service. Please change to another Job Role',
      });
    });

    it('should not add error to csvWorkerSchemaErrors if establishment is CQC regulated and main role ID is 4', () => {
      const csvWorkerSchemaErrors = [];

      const worker = new WorkerCsvValidator(null, null, null, mappings);
      const JSONWorker = worker.toJSON();
      JSONWorker.status = 'NEW';
      JSONWorker.mainJobRoleId = 4;

      _crossValidateMainJobRole(csvWorkerSchemaErrors, true, JSONWorker);

      expect(csvWorkerSchemaErrors.length).to.equal(0);
    });

    it('should not add error to csvWorkerSchemaErrors if establishment is not CQC regulated and main role ID is not 4', () => {
      const csvWorkerSchemaErrors = [];

      const worker = new WorkerCsvValidator(null, null, null, mappings);
      const JSONWorker = worker.toJSON();
      JSONWorker.status = 'NEW';
      JSONWorker.mainJobRoleId = 2;

      _crossValidateMainJobRole(csvWorkerSchemaErrors, true, JSONWorker);

      expect(csvWorkerSchemaErrors.length).to.equal(0);
    });
  });

  describe('crossValidate', () => {
    it('should return false when JSONWorker is UNCHECKED', async () => {
      const worker = new WorkerCsvValidator(null, null, null, mappings);
      const JSONWorker = worker.toJSON();
      JSONWorker.status = 'UNCHECKED';

      const crossValidateOutput = await crossValidate([], [], JSONWorker);

      expect(crossValidateOutput).to.deep.equal(false);
    });
  });

  describe('_isCQCRegulated', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return true when unchecked establishment with matching key is regulated (according to database)', async () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'UNCHECKED',
          key: 'HELLO',
        },
      ];
      const worker = new WorkerCsvValidator(null, null, null, mappings);
      worker._status = 'NEW';
      const JSONWorker = worker.toJSON();
      JSONWorker.establishmentKey = 'HELLO';

      sinon.stub(models.establishment, 'findbyId').returns({ isRegulated: true });

      const isCQCRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

      expect(isCQCRegulated).to.deep.equal(true);
    });

    it('should return false when unchecked establishment with matching key is not regulated (according to database)', async () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'UNCHECKED',
          key: 'HELLO',
        },
      ];
      const worker = new WorkerCsvValidator(null, null, null, mappings);
      worker._status = 'NEW';
      const JSONWorker = worker.toJSON();
      JSONWorker.establishmentKey = 'HELLO';

      sinon.stub(models.establishment, 'findbyId').returns({ isRegulated: false });

      const isCQCRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

      expect(isCQCRegulated).to.deep.equal(false);
    });

    it('should return true when updated establishment with matching key is regulated (according to file)', async () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'UPDATE',
          key: 'HELLO',
          regType: 1,
        },
      ];
      const worker = new WorkerCsvValidator(null, null, null, mappings);
      worker._status = 'NEW';
      const JSONWorker = worker.toJSON();
      JSONWorker.establishmentKey = 'HELLO';

      const isCQCRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

      expect(isCQCRegulated).to.deep.equal(false);
    });

    it('should return false when updated establishment with matching key is not regulated (according to file)', async () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'UPDATE',
          key: 'HELLO',
          regType: 2,
        },
      ];
      const worker = new WorkerCsvValidator(null, null, null, mappings);
      worker._status = 'NEW';
      const JSONWorker = worker.toJSON();
      JSONWorker.establishmentKey = 'HELLO';

      const isCQCRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

      expect(isCQCRegulated).to.deep.equal(true);
    });

    it('should not return anythign if the establishment is not found', async () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'UPDATE',
          key: 'HELLO',
          regType: 2,
        },
      ];
      const worker = new WorkerCsvValidator(null, null, null, mappings);
      worker._status = 'NEW';
      const JSONWorker = worker.toJSON();
      JSONWorker.establishmentKey = 'HELLO1';

      const isCQCRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

      expect(isCQCRegulated).to.not.deep.equal(true);
      expect(isCQCRegulated).to.not.deep.equal(false);
    });
  });
});
