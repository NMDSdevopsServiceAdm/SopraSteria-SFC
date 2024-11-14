const sinon = require('sinon');
const expect = require('chai').expect;

const WorkerCsvValidator =
  require('../../../../../../../lambdas/bulkUpload/classes/workerCSVValidator.js').WorkerCsvValidator;
const mappings = require('../../../../../models/BulkImport/BUDI/index.js').mappings;

const {
  crossValidate,
  _crossValidateMainJobRole,
  _isCQCRegulated,
  crossValidateTransferStaffRecord,
} = require('../../../../../models/BulkImport/csv/crossValidate');
const models = require('../../../../../models');
const { Establishment } = require('../../../../../models/classes/establishment.js');

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

    const newWorker = (establishmentKey = 'HELLO') => {
      const worker = new WorkerCsvValidator(null, null, null, mappings);
      worker._status = 'NEW';
      const JSONWorker = worker.toJSON();
      JSONWorker.establishmentKey = establishmentKey;
      return JSONWorker;
    };

    const transferringWorker = (establishmentKey = 'HELLO') => {
      const worker = new WorkerCsvValidator(null, null, null, mappings);
      worker._status = 'UPDATE';
      worker._transferStaffRecord = establishmentKey;
      const JSONWorker = worker.toJSON();
      return JSONWorker;
    };

    const testCases = [
      { workertype: 'New worker', workerBuilder: newWorker },
      { workertype: 'Transferring worker', workerBuilder: transferringWorker },
    ];

    testCases.forEach(({ workertype, workerBuilder }) => {
      describe(`Case of ${workertype}`, () => {
        it('should return true when unchecked establishment with matching key is regulated (according to database)', async () => {
          const myEstablishments = [
            {
              id: 1,
              status: 'UNCHECKED',
              key: 'HELLO',
            },
          ];
          const JSONWorker = workerBuilder();

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
          const JSONWorker = workerBuilder();

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
          const JSONWorker = workerBuilder();

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
          const JSONWorker = workerBuilder();

          const isCQCRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

          expect(isCQCRegulated).to.deep.equal(true);
        });

        it('should not return anything if the establishment is set to DELETE', async () => {
          const myEstablishments = [
            {
              id: 1,
              status: 'DELETE',
              key: 'HELLO',
              regType: 2,
            },
          ];
          const JSONWorker = workerBuilder();

          const isCQCRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

          expect(isCQCRegulated).to.not.deep.equal(true);
          expect(isCQCRegulated).to.not.deep.equal(false);
        });

        it('should not return anything if the establishment is not found', async () => {
          const myEstablishments = [
            {
              id: 1,
              status: 'UPDATE',
              key: 'HELLO',
              regType: 2,
            },
          ];
          const JSONWorker = workerBuilder('HELLO1');

          const isCQCRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

          expect(isCQCRegulated).to.not.deep.equal(true);
          expect(isCQCRegulated).to.not.deep.equal(false);
        });
      });
    });
  });

  describe('crossValidateTransferStaffRecord', () => {
    const worker = new WorkerCsvValidator(null, null, null, mappings);
    const buildMockJSONWorker = (override) => {
      return {
        ...worker.toJSON(),
        status: 'UPDATE',
        transferStaffRecord: 'target workplace',
        uniqueWorkerId: 'mock_worker_ref',
        lineNumber: 3,
        ...override,
      };
    };
    const myEstablishments = [
      { name: 'workplace A', id: 123 },
      { name: 'workplace B', id: 456 },
      { name: 'target workplace', id: 789 },
    ];

    let stubEstablishmentFindOne;
    let stubWorkerFindOneWithLocalRef;
    let myAPIEstablishments;

    beforeEach(() => {
      stubEstablishmentFindOne = sinon.stub(models.establishment, 'findOne');
      stubEstablishmentFindOne.returns(myEstablishments[2]);

      stubWorkerFindOneWithLocalRef = sinon.stub(models.worker, 'findOneWithConflictingLocalRef');
      stubWorkerFindOneWithLocalRef.returns(null);

      myAPIEstablishments = {
        workplaceA: new Establishment(),
        workplaceB: new Establishment(),
        targetworkplace: new Establishment(),
      };
      myAPIEstablishments.workplaceA.associateWorker('mock_worker_ref', {});
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should add an error to csvWorkerSchemaErrors if the new workplace cannot be found', async () => {
      stubEstablishmentFindOne.returns(null);

      const JSONWorker = buildMockJSONWorker({ transferStaffRecord: 'non_exist_workplace' });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        JSONWorker,
      ]);

      const expectedError = {
        column: 'TRANSFERSTAFFRECORD',
        errCode: 1401,
        errType: 'TRANSFERSTAFFRECORD_ERROR',
        error: 'The LOCALESTID in TRANSFERSTAFFRECORD does not exist',
        worker: JSONWorker.uniqueWorkerId,
        name: JSONWorker.localId,
        lineNumber: JSONWorker.lineNumber,
        source: JSONWorker.transferStaffRecord,
      };

      expect(csvWorkerSchemaErrors).to.deep.equal([expectedError]);
      expect(stubEstablishmentFindOne).to.have.been.calledWith({
        where: { LocalIdentifierValue: 'non_exist_workplace', id: [123, 456, 789] },
      });
    });

    it("should add an error to csvWorkerSchemaErrors if the worker's unique worker id is already used in the new workplace", async () => {
      stubWorkerFindOneWithLocalRef.returns({
        NameOrIdValue: 'another worker',
        LocalIdentifierValue: 'mock_worker_ref',
      });

      const JSONWorker = buildMockJSONWorker({ uniqueWorkerId: 'mock_worker_ref' });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        JSONWorker,
      ]);

      const expectedError = {
        column: 'UNIQUEWORKERID',
        errCode: 1402,
        errType: 'TRANSFERSTAFFRECORD_ERROR',
        error: 'The UNIQUEWORKERID already exists in the LOCALESTID given in TRANSFERSTAFFRECORD',
        worker: JSONWorker.uniqueWorkerId,
        name: JSONWorker.localId,
        lineNumber: JSONWorker.lineNumber,
        source: JSONWorker.uniqueWorkerId,
      };

      expect(csvWorkerSchemaErrors).to.deep.equal([expectedError]);
      expect(stubWorkerFindOneWithLocalRef).to.have.been.calledWith(789, 'mock_worker_ref');
    });

    it('should add an error to csvWorkerSchemaErrors if two workers with the same unique worker id are transferring into the same new workplace', async () => {
      const JSONWorkerA = buildMockJSONWorker({ localId: 'workplace A', lineNumber: 3 });
      const JSONWorkerB = buildMockJSONWorker({ localId: 'workplace B', lineNumber: 4 });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        JSONWorkerA,
        JSONWorkerB,
      ]);

      const expectedError = {
        column: 'UNIQUEWORKERID',
        errCode: 1403,
        errType: 'TRANSFERSTAFFRECORD_ERROR',
        error: 'Duplicate UNIQUEWORKERID’s are being moved to the same LOCALESTID in TRANSFERSTAFFRECORD',
        worker: JSONWorkerB.uniqueWorkerId,
        name: JSONWorkerB.localId,
        lineNumber: JSONWorkerB.lineNumber,
        source: JSONWorkerB.uniqueWorkerId,
      };
      expect(csvWorkerSchemaErrors).to.deep.equal([expectedError]);
    });

    it('should add an error to csvWorkerSchemaErrors if a NEW worker and a transferring worker with the same ref are coming into the same new workplace', async () => {
      const movingWorker = buildMockJSONWorker({ uniqueWorkerId: 'mock_worker_ref' });
      const newWorker = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        status: 'NEW',
        transferStaffRecord: null,
        localId: 'target workplace',
      });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        movingWorker,
        newWorker,
      ]);

      const expectedError = {
        column: 'UNIQUEWORKERID',
        errCode: 1403,
        errType: 'TRANSFERSTAFFRECORD_ERROR',
        error: 'Duplicate UNIQUEWORKERID’s are being moved to the same LOCALESTID in TRANSFERSTAFFRECORD',
        worker: movingWorker.uniqueWorkerId,
        name: movingWorker.localId,
        lineNumber: movingWorker.lineNumber,
        source: movingWorker.uniqueWorkerId,
      };

      expect(csvWorkerSchemaErrors).to.deep.equal([expectedError]);
    });

    it('should add newWorkplaceId to the worker entity if all validations passed', async () => {
      const JSONWorker = buildMockJSONWorker({ localId: 'workplace A', uniqueWorkerId: 'mock_worker_ref' });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        JSONWorker,
      ]);

      expect(csvWorkerSchemaErrors).to.be.empty;

      const workerEntity = myAPIEstablishments['workplaceA']._workerEntities['mock_worker_ref'];
      expect(workerEntity._newWorkplaceId).to.equal(789);
    });
  });
});
