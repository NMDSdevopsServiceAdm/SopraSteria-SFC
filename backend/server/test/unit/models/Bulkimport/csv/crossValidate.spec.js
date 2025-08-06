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
  crossValidateDelegatedHealthcareActivities,
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
    const buildMockJSONWorker = (override) => {
      const worker = new WorkerCsvValidator(null, null, null, mappings);
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

    it("should add an error to csvWorkerSchemaErrors if the worker's unique worker id is already in the new workplace in file", async () => {
      const movingWorker = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        localId: 'workplace A',
      });

      const existingWorkerInWorkplace = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        status: 'UPDATE',
        transferStaffRecord: null,
        localId: 'target workplace',
      });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        movingWorker,
        existingWorkerInWorkplace,
      ]);

      const expectedError = {
        column: 'UNIQUEWORKERID',
        errCode: 1402,
        errType: 'TRANSFERSTAFFRECORD_ERROR',
        error:
          "The UNIQUEWORKERID already exists in the LOCALESTID given in TRANSFERSTAFFRECORD. Use CHGUNIQUEWRKID to change this worker's UNIQUEWORKERID",
        worker: movingWorker.uniqueWorkerId,
        name: movingWorker.localId,
        lineNumber: movingWorker.lineNumber,
        source: movingWorker.uniqueWorkerId,
      };

      expect(csvWorkerSchemaErrors).to.deep.equal([expectedError]);
    });

    it("should add an error to csvWorkerSchemaErrors if the worker's unique worker id is not in file but is found in database", async () => {
      stubWorkerFindOneWithLocalRef.returns({
        id: 123,
        NameOrIdValue: 'Mock Worker',
        LocalIdentifierValue: 'mock_worker_ref',
      });

      const movingWorker = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        localId: 'workplace A',
      });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        movingWorker,
      ]);

      const expectedError = {
        column: 'UNIQUEWORKERID',
        errCode: 1402,
        errType: 'TRANSFERSTAFFRECORD_ERROR',
        error:
          "The UNIQUEWORKERID already exists in the LOCALESTID given in TRANSFERSTAFFRECORD. Use CHGUNIQUEWRKID to change this worker's UNIQUEWORKERID",
        worker: movingWorker.uniqueWorkerId,
        name: movingWorker.localId,
        lineNumber: movingWorker.lineNumber,
        source: movingWorker.uniqueWorkerId,
      };

      expect(stubWorkerFindOneWithLocalRef).to.have.been.calledWith(789, 'mock_worker_ref');
      expect(csvWorkerSchemaErrors).to.deep.equal([expectedError]);
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

    it("should add an error to csvWorkerSchemaErrors if transferring worker to workplace with worker with same ref, even if the worker's ID is being changed", async () => {
      const movingWorker = buildMockJSONWorker({ uniqueWorkerId: 'mock_worker_ref', localId: 'workplace A' });
      const existingWorkerInWorkplace = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        status: 'UPDATE',
        changeUniqueWorker: 'new_unique_worker_ref',
        transferStaffRecord: null,
        localId: 'target workplace',
      });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        movingWorker,
        existingWorkerInWorkplace,
      ]);

      const expectedError = {
        column: 'UNIQUEWORKERID',
        errCode: 1402,
        errType: 'TRANSFERSTAFFRECORD_ERROR',
        error:
          "The UNIQUEWORKERID already exists in the LOCALESTID given in TRANSFERSTAFFRECORD. Use CHGUNIQUEWRKID to change this worker's UNIQUEWORKERID",
        worker: movingWorker.uniqueWorkerId,
        name: movingWorker.localId,
        lineNumber: movingWorker.lineNumber,
        source: movingWorker.uniqueWorkerId,
      };

      expect(csvWorkerSchemaErrors).to.deep.equal([expectedError]);
    });

    it("should not add an error to csvWorkerSchemaErrors and add newWorkplaceId to worker entity if transferring worker to workplace with worker with same ref but moving worker's ID is being changed", async () => {
      const movingWorker = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        localId: 'workplace A',
        changeUniqueWorker: 'new_unique_worker_ref',
      });

      const existingWorkerInWorkplace = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        status: 'UPDATE',
        transferStaffRecord: null,
        localId: 'target workplace',
      });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        movingWorker,
        existingWorkerInWorkplace,
      ]);

      expect(csvWorkerSchemaErrors).to.be.empty;

      const workerEntity = myAPIEstablishments['workplaceA']._workerEntities['mock_worker_ref'];
      expect(workerEntity._newWorkplaceId).to.equal(789);
      expect(stubWorkerFindOneWithLocalRef).to.have.been.calledWith(789, 'new_unique_worker_ref');
    });

    it("should add an error to csvWorkerSchemaErrors if transferring worker to workplace with worker with same ref and moving worker's ID is being changed to existing ref", async () => {
      const movingWorker = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        localId: 'workplace A',
        changeUniqueWorker: 'changed_but_still_duplicate_worker_ref',
      });

      const existingWorkerInWorkplace = buildMockJSONWorker({
        uniqueWorkerId: 'mock_worker_ref',
        status: 'UPDATE',
        transferStaffRecord: null,
        localId: 'target workplace',
      });

      const existingWorker2InWorkplace = buildMockJSONWorker({
        uniqueWorkerId: 'changed_but_still_duplicate_worker_ref',
        status: 'UPDATE',
        transferStaffRecord: null,
        localId: 'target workplace',
      });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        movingWorker,
        existingWorkerInWorkplace,
        existingWorker2InWorkplace,
      ]);

      const expectedError = {
        column: 'UNIQUEWORKERID',
        errCode: 1402,
        errType: 'TRANSFERSTAFFRECORD_ERROR',
        error:
          "The UNIQUEWORKERID already exists in the LOCALESTID given in TRANSFERSTAFFRECORD. Use CHGUNIQUEWRKID to change this worker's UNIQUEWORKERID",
        worker: movingWorker.uniqueWorkerId,
        name: movingWorker.localId,
        lineNumber: movingWorker.lineNumber,
        source: movingWorker.uniqueWorkerId,
      };

      expect(csvWorkerSchemaErrors).to.deep.equal([expectedError]);
    });

    it('should add newWorkplaceId to the worker entity if all validations pass for worker with transferStaffRecord', async () => {
      const JSONWorker = buildMockJSONWorker({ localId: 'workplace A', uniqueWorkerId: 'mock_worker_ref' });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        JSONWorker,
      ]);

      expect(csvWorkerSchemaErrors).to.be.empty;

      const workerEntity = myAPIEstablishments['workplaceA']._workerEntities['mock_worker_ref'];
      expect(workerEntity._newWorkplaceId).to.equal(789);
    });

    it('should not add errors if no workers with transferStaffRecord', async () => {
      const buildMockJSONWorkerWithoutTransferStaffRecord = (override) => {
        const worker = new WorkerCsvValidator(null, null, null, mappings);
        return {
          ...worker.toJSON(),
          status: 'UPDATE',
          transferStaffRecord: null,
          uniqueWorkerId: 'mock_worker_ref',
          lineNumber: 3,
          ...override,
        };
      };

      const worker1 = buildMockJSONWorkerWithoutTransferStaffRecord({
        localId: 'workplace A',
        uniqueWorkerId: 'mock_worker_ref',
      });
      const worker2 = buildMockJSONWorkerWithoutTransferStaffRecord({
        localId: 'workplace B',
        uniqueWorkerId: 'mock_worker_ref',
      });
      const worker3 = buildMockJSONWorkerWithoutTransferStaffRecord({
        localId: 'workplace A',
        uniqueWorkerId: 'mock_worker_ref2',
      });

      const csvWorkerSchemaErrors = [];

      await crossValidateTransferStaffRecord(csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments, [
        worker1,
        worker2,
        worker3,
      ]);

      expect(csvWorkerSchemaErrors).to.be.empty;
    });
  });

  describe('crossValidateDelegatedHealthcareActivities', () => {
    let stubWorkerMainJob;
    let stubWorkplaceMainService;
    let stubWorkplaceFromDatabase;

    beforeEach(() => {
      stubWorkerMainJob = sinon.stub(models.job, 'findByPk');
      stubWorkplaceMainService = sinon.stub(models.services, 'findByPk');
      stubWorkplaceFromDatabase = sinon.stub(models.establishment, 'findByPk');
    });

    afterEach(() => {
      sinon.restore();
    });

    const createMockEstablishments = (overrides = {}) => {
      const establishment = {
        id: 1,
        status: 'UNCHECKED',
        key: 'workplaceKey',
        staffDoDelegatedHealthcareActivities: 'Yes',
        mainService: { id: 10 },
      };
      Object.assign(establishment, overrides);
      return [establishment];
    };

    const createJSONWorker = (overrides = {}) => {
      const worker = new WorkerCsvValidator(null, 2, null, mappings);
      const JSONWorker = worker.toJSON();
      Object.assign(JSONWorker, {
        uniqueWorkerId: 'worker ref id',
        localId: 'establishment ref id',
        lineNumber: 2,
        status: 'NEW',
        carryOutDelegatedHealthcareActivities: 'Yes',
        establishmentKey: 'workplaceKey',
        mainJob: { role: 36 },
        ...overrides,
      });

      return JSONWorker;
    };

    it('should add a warning if main job role cannot do DHA', async () => {
      stubWorkerMainJob.resolves({ canDoDelegatedHealthcareActivities: false });

      const csvWorkerSchemaErrors = [];
      const myEstablishments = createMockEstablishments();
      const JSONWorker = createJSONWorker({ carryOutDelegatedHealthcareActivities: 'Yes' });

      await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
      expect(csvWorkerSchemaErrors.length).to.equal(1);
      expect(csvWorkerSchemaErrors[0].warning).to.deep.equal(
        "Value entered for DHA will be ignored as worker's MAINJOBROLE cannot carry out delegated healthcare activities",
      );
    });

    describe('when workplace status is NEW or UPDATE', () => {
      beforeEach(() => {
        stubWorkerMainJob.resolves({ canDoDelegatedHealthcareActivities: true });
      });

      it('should add a warning if workplace answered "No" for staffDoDHA', async () => {
        const csvWorkerSchemaErrors = [];
        const myEstablishments = createMockEstablishments({
          status: 'NEW',
          staffDoDelegatedHealthcareActivities: 'No',
        });
        const JSONWorker = createJSONWorker();

        await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
        expect(csvWorkerSchemaErrors.length).to.equal(1);
        expect(csvWorkerSchemaErrors[0].warning).to.deep.equal(
          "Value entered for DHA will be ignored as worker's workplace has answered No for DHA",
        );
      });

      it('should add a warning if workplace main service does not do DHA', async () => {
        stubWorkplaceMainService.resolves({ canDoDelegatedHealthcareActivities: false });

        const csvWorkerSchemaErrors = [];
        const myEstablishments = createMockEstablishments({
          status: 'NEW',
          mainService: { id: 16 },
        });
        const JSONWorker = createJSONWorker();

        await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
        expect(csvWorkerSchemaErrors.length).to.equal(1);
        expect(csvWorkerSchemaErrors[0].warning).to.deep.equal(
          "Value entered for DHA will be ignored as MAINSERVICE of worker's workplace cannot do delegated healthcare activities",
        );
      });

      it('should give no warnings if worker main job role, workplace main service and staffDoDHA answer are all compatible with DHA', async () => {
        stubWorkplaceMainService.resolves({ canDoDelegatedHealthcareActivities: true });

        const csvWorkerSchemaErrors = [];
        const myEstablishments = createMockEstablishments({
          status: 'NEW',
          mainService: { id: 6 },
          staffDoDelegatedHealthcareActivities: 'Yes',
        });
        const JSONWorker = createJSONWorker();

        await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
        expect(csvWorkerSchemaErrors).to.deep.equal([]);
      });

      it('should give no warnings if did not answer CarryOutDelegatedHealthcareActivities for worker, even if all other values not compatible with DHA', async () => {
        stubWorkerMainJob.resolves({ canDoDelegatedHealthcareActivities: false });
        stubWorkplaceMainService.resolves({ canDoDelegatedHealthcareActivities: false });

        const csvWorkerSchemaErrors = [];
        const myEstablishments = createMockEstablishments({
          status: 'NEW',
          mainService: { id: 16 },
          staffDoDelegatedHealthcareActivities: 'No',
        });
        const JSONWorker = createJSONWorker({ carryOutDelegatedHealthcareActivities: null });

        await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
        expect(csvWorkerSchemaErrors).to.deep.equal([]);
      });
    });

    describe('when workplace status is UNCHECKED or NOCHANGE', () => {
      beforeEach(() => {
        stubWorkerMainJob.resolves({ canDoDelegatedHealthcareActivities: true });
      });

      it('should add a warning if workplace answered "No" for staffDoDHA', async () => {
        stubWorkplaceFromDatabase.resolves({
          staffDoDelegatedHealthcareActivities: 'No',
          'mainService.canDoDelegatedHealthcareActivities': true,
        });

        const csvWorkerSchemaErrors = [];
        const myEstablishments = createMockEstablishments({ status: 'UNCHECKED' });
        const JSONWorker = createJSONWorker();

        await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
        expect(csvWorkerSchemaErrors.length).to.equal(1);
        expect(csvWorkerSchemaErrors[0].warning).to.deep.equal(
          "Value entered for DHA will be ignored as worker's workplace has answered No for DHA",
        );
      });

      it('should add a warning if workplace main service does not do DHA', async () => {
        stubWorkplaceFromDatabase.resolves({
          staffDoDelegatedHealthcareActivities: 'Yes',
          'mainService.canDoDelegatedHealthcareActivities': false,
        });

        const csvWorkerSchemaErrors = [];
        const myEstablishments = createMockEstablishments({ status: 'UNCHECKED' });
        const JSONWorker = createJSONWorker();

        await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
        expect(csvWorkerSchemaErrors.length).to.equal(1);
        expect(csvWorkerSchemaErrors[0].warning).to.deep.equal(
          "Value entered for DHA will be ignored as MAINSERVICE of worker's workplace cannot do delegated healthcare activities",
        );
      });

      it('should give no warnings if worker main job role, workplace main service and staffDoDHA answer are all compatible with DHA', async () => {
        stubWorkplaceFromDatabase.resolves({
          staffDoDelegatedHealthcareActivities: 'Yes',
          'mainService.canDoDelegatedHealthcareActivities': true,
        });

        const csvWorkerSchemaErrors = [];
        const myEstablishments = createMockEstablishments({ status: 'UNCHECKED' });
        const JSONWorker = createJSONWorker();

        await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
        expect(csvWorkerSchemaErrors).to.deep.equal([]);
      });

      it('should give no warnings if did not answer CarryOutDelegatedHealthcareActivities for worker, even if all other values not compatible with DHA', async () => {
        stubWorkerMainJob.resolves({ canDoDelegatedHealthcareActivities: false });
        stubWorkplaceFromDatabase.resolves({
          staffDoDelegatedHealthcareActivities: 'No',
          'mainService.canDoDelegatedHealthcareActivities': false,
        });

        const csvWorkerSchemaErrors = [];
        const myEstablishments = createMockEstablishments({ status: 'UNCHECKED' });
        const JSONWorker = createJSONWorker({ carryOutDelegatedHealthcareActivities: null });

        await crossValidateDelegatedHealthcareActivities(csvWorkerSchemaErrors, myEstablishments, JSONWorker);
        expect(csvWorkerSchemaErrors).to.deep.equal([]);
      });
    });
  });
});
