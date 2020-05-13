'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const rfr = require('rfr');

const dbmodels = rfr('server/models');
sinon.stub(dbmodels.status, 'ready').value(false);

const bulkUpload = rfr('server/routes/establishments/bulkUpload');
const EstablishmentCsvValidator = rfr('server/models/BulkImport/csv/establishments');
const WorkerCsvValidator = rfr('server/models/BulkImport/csv/workers');
const { Establishment } = rfr('server/models/classes/establishment');
const buildEstablishmentCSV = rfr('server/test/factories/establishment/csv');
const buildWorkerCSV = rfr('server/test/factories/worker/csv');

describe('/server/routes/establishment/bulkUpload.js', () => {
  describe('checkDuplicateLocations', () => {
    it('can check for duplicate location IDs', async () => {
      const csvEstablishmentSchemaErrors = [];
      const myEstablishments = [
        buildEstablishmentCSV({
          overrides: {
            LOCALESTID: 'Workplace 1',
            LOCATIONID: '1-12345678',
          },
        }),
        buildEstablishmentCSV({
          overrides: {
            LOCALESTID: 'Workplace 2',
            LOCATIONID: '1-12345678',
          },
        }),
      ].map((currentLine, currentLineNumber) => {
        return new EstablishmentCsvValidator.Establishment(
          currentLine,
          currentLineNumber,
        );
      });

      await bulkUpload.checkDuplicateLocations(
        myEstablishments,
        csvEstablishmentSchemaErrors,
      );

      expect(csvEstablishmentSchemaErrors.length).equals(1);
      expect(csvEstablishmentSchemaErrors[0]).to.eql({
        origin: 'Establishments',
        lineNumber: 1,
        errCode: 998,
        errType: 'DUPLICATE_ERROR',
        error: 'LOCATIONID is not unique',
        source: '1-12345678',
        name: 'Workplace 2',
      });
    });
  });

  describe('checkDuplicateWorkerID()', () => {
    it('errors when CHGUNIQUEWRKID is not unique', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {};
      const myAPIWorkers = [];
      const myWorkers = [
        buildWorkerCSV({
          overrides: {
            LOCALESTID: 'foo',
            UNIQUEWORKERID: 'Worker 1'
          },
        }),
        buildWorkerCSV({
          overrides: {
            LOCALESTID: 'foo',
            UNIQUEWORKERID: 'Worker 2',
            CHGUNIQUEWRKID: 'Worker 1'
          },
        }),
      ].map((currentLine, currentLineNumber) => {
        return new WorkerCsvValidator.Worker(
          currentLine,
          currentLineNumber,
          []
        );
      });

      const allKeys = [];
      myWorkers.map(worker => {
        worker.validate();
        const id = (worker.local + worker.uniqueWorker).replace(/\s/g, '');
        allKeys.push(id);
      });

      myWorkers.forEach(thisWorker => {
        // uniquness for a worker is across both the establishment and the worker
        const keyNoWhitespace = (thisWorker.local + thisWorker.uniqueWorker).replace(/\s/g, '');
        const changeKeyNoWhitespace = thisWorker.changeUniqueWorker ? (thisWorker.local + thisWorker.changeUniqueWorker).replace(/\s/g, '') : null;

        if (bulkUpload.checkDuplicateWorkerID(
          myWorkers[1], allKeys, changeKeyNoWhitespace, keyNoWhitespace, allWorkersByKey, myAPIWorkers, csvWorkerSchemaErrors
        )) {
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
        error: 'CHGUNIQUEWORKERID Worker 1 is not unique',
        name: 'foo',
        source: 'Worker 2',
        worker: 'Worker 2'
      });
    });

    it('errors when UNIQUEWORKERID is not unique', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {};
      const myAPIWorkers = [];
      const myWorkers = [
        buildWorkerCSV({
          overrides: {
            LOCALESTID: 'foo',
            UNIQUEWORKERID: 'Worker 1'
          },
        }),
        buildWorkerCSV({
          overrides: {
            LOCALESTID: 'foo',
            UNIQUEWORKERID: 'Worker 1'
          },
        }),
      ].map((currentLine, currentLineNumber) => {
        return new WorkerCsvValidator.Worker(
          currentLine,
          currentLineNumber,
          []
        );
      });

      const allKeys = [];
      myWorkers.map(worker => {
        worker.validate();
        const id = (worker.local + worker.uniqueWorker).replace(/\s/g, '');
        allKeys.push(id);
      });

      myWorkers.forEach(thisWorker => {
        // uniquness for a worker is across both the establishment and the worker
        const keyNoWhitespace = (thisWorker.local + thisWorker.uniqueWorker).replace(/\s/g, '');
        const changeKeyNoWhitespace = thisWorker.changeUniqueWorker ? (thisWorker.local + thisWorker.changeUniqueWorker).replace(/\s/g, '') : null;

        if (bulkUpload.checkDuplicateWorkerID(
          thisWorker, allKeys, changeKeyNoWhitespace, keyNoWhitespace, allWorkersByKey, myAPIWorkers, csvWorkerSchemaErrors
        )) {
          allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;

          // to prevent subsequent Worker duplicates, add also the change worker id if CHGUNIQUEWORKERID is given
          if (changeKeyNoWhitespace) {
            allWorkersByKey[changeKeyNoWhitespace] = thisWorker.lineNumber;
          }
        }
      });
      ;

      expect(csvWorkerSchemaErrors.length).equals(1);
      expect(csvWorkerSchemaErrors[0]).to.eql({
        origin: 'Workers',
        lineNumber: 1,
        errCode: 998,
        errType: 'DUPLICATE_ERROR',
        error: 'UNIQUEWORKERID Worker 1 is not unique',
        name: 'foo',
        source: 'Worker 1',
        worker: 'Worker 1'
      });
    });

    it('passes when CHGUNIQUEWRKID is unique', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {};
      const myAPIWorkers = [];
      const myWorkers = [
        buildWorkerCSV({
          overrides: {
            LOCALESTID: 'foo',
            UNIQUEWORKERID: 'Worker 1'
          },
        }),
        buildWorkerCSV({
          overrides: {
            LOCALESTID: 'foo',
            UNIQUEWORKERID: 'Worker 2',
            CHGUNIQUEWRKID: 'Worker 3'
          },
        }),
      ].map((currentLine, currentLineNumber) => {
        return new WorkerCsvValidator.Worker(
          currentLine,
          currentLineNumber,
          []
        );
      });

      const allKeys = [];
      myWorkers.map(worker => {
        worker.validate();
        const id = (worker.local + worker.uniqueWorker).replace(/\s/g, '');
        allKeys.push(id);
      });

      myWorkers.forEach(thisWorker => {
        // uniquness for a worker is across both the establishment and the worker
        const keyNoWhitespace = (thisWorker.local + thisWorker.uniqueWorker).replace(/\s/g, '');
        const changeKeyNoWhitespace = thisWorker.changeUniqueWorker ? (thisWorker.local + thisWorker.changeUniqueWorker).replace(/\s/g, '') : null;

        if (bulkUpload.checkDuplicateWorkerID(
          myWorkers[1], allKeys, changeKeyNoWhitespace, keyNoWhitespace, allWorkersByKey, myAPIWorkers, csvWorkerSchemaErrors
        )) {
          allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;

          // to prevent subsequent Worker duplicates, add also the change worker id if CHGUNIQUEWORKERID is given
          if (changeKeyNoWhitespace) {
            allWorkersByKey[changeKeyNoWhitespace] = thisWorker.lineNumber;
          }
        }
      });

      expect(csvWorkerSchemaErrors.length).equals(0);
    });

  });

  describe('validateEstablishmentCsv()', () => {
    it('should validate each line of the establishments CSV', async () => {
      const workplace = { Address1: 'First Line',
        Address2: 'Second Line',
        Address3: '',
        Town: 'My Town',
        Postcode: 'LN11 9JG',
        LocationId: '1-12345678',
        ProvId: '1-12345678',
        IsCQCRegulated: true,
        reasonsForLeaving: '',
        status: null,
        name: 'WOZiTech, with even more care',
        localIdentifier: 'omar3',
        isRegulated: false,
        employerType: { value: null, other: undefined },
        localAuthorities: [],
        mainService: null,
        services: [],
        serviceUsers: [],
        numberOfStaff: null,
        vacancies: 'None',
        starters: 'None',
        leavers: 'None',
        share: { enabled: false },
        capacities: []
      };
      sinon.stub(EstablishmentCsvValidator.Establishment.prototype, 'validate').resolves();
      sinon.stub(EstablishmentCsvValidator.Establishment.prototype, 'transform').resolves({});
      sinon.stub(Establishment.prototype, 'initialise').callsFake((Address1, Address2, Address3, Town, test, LocationId, ProvId, Postcode, IsCQCRegulated)  => {
        expect(Address1).to.deep.equal(workplace.Address1);
        expect(Address2).to.deep.equal(workplace.Address2);
        expect(Address3).to.deep.equal(workplace.Address3);
        expect(Town).to.deep.equal(workplace.Town);
        expect(test).to.deep.equal(null);
        expect(LocationId).to.deep.equal(workplace.LocationId);
        expect(ProvId).to.deep.equal(workplace.ProvId);
        expect(Postcode).to.deep.equal(workplace.Postcode);
        expect(IsCQCRegulated).to.deep.equal(workplace.IsCQCRegulated);
      });
      sinon.stub(EstablishmentCsvValidator.Establishment.prototype, 'toAPI').callsFake(() => {
        return workplace;
      });
      sinon.stub(Establishment.prototype, 'load').callsFake(args => {
        expect(args).to.deep.equal(workplace);
      });
      sinon.stub(Establishment.prototype, 'validate').resolves({});
      sinon.stub(Establishment.prototype, 'key').get(() =>{
        return 'omar3';
      });

      await bulkUpload.validateEstablishmentCsv({
        LOCALESTID: 'omar3',
        STATUS: 'NEW',
        ESTNAME: 'WOZiTech, with even more care',
        ADDRESS1: 'First Line',
        ADDRESS2: 'Second Line',
        ADDRESS3: '',
        POSTTOWN: 'My Town',
        POSTCODE: 'LN11 9JG',
        ESTTYPE: '6',
        OTHERTYPE: '',
        PERMCQC: '1',
        PERMLA: '1',
        SHARELA: '708;721;720',
        REGTYPE: '2',
        PROVNUM: '1-12345678',
        LOCATIONID: '1-12345678',
        MAINSERVICE: '8',
      ALLSERVICES: '12;13',
        CAPACITY: '0;0',
        UTILISATION: '0;0',
        SERVICEDESC: '1;1',
        SERVICEUSERS: '',
        OTHERUSERDESC: '',
        TOTALPERMTEMP: '1',
        ALLJOBROLES: '34;8;4',
        STARTERS: '0;0;0',
        LEAVERS: '999;0;0',
        VACANCIES: '999;333;1',
        REASONS: '',
        REASONNOS: ''
      },
      2,
      [],
      [],
      [
        {
          _validations: [],
          _username: 'aylingw',
          _id: 479,
          _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
          _ustatus: null,
          _created: '2019-03-15T09:54:10.562Z',
          _updated: '2019-10-04T15:46:16.158Z',
          _updatedBy: 'aylingw',
          _auditEvents: null,
          _name: 'WOZiTech, with even more care',
          _address1: 'First Line',
          _address2: 'Second Line',
          _address3: '',
          _town: 'My Town',
          _county: '',
          _locationId: null,
          _provId: null,
          _postcode: 'LN11 9JG',
          _isRegulated: false,
          _mainService: { id: 16, name: 'Head office services' },
          _nmdsId: 'G1001114',
          _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
          _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
          _establishmentWdfEligibility: null,
          _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
          _isParent: true,
          _parentUid: null,
          _parentId: null,
          _parentName: null,
          _dataOwner: 'Workplace',
          _dataPermissions: 'None',
          _archived: false,
          _dataOwnershipRequested: null,
          _reasonsForLeaving: '',
          _properties: {
            _properties: [Object],
            _propertyTypes: [Array],
            _auditEvents: null,
            _modifiedProperties: [],
            _additionalModels: null
          },
          _isNew: false,
          _workerEntities: {
          },
          _readyForDeletionWorkers: null,
          _status: 'NEW',
          _logLevel: 300
        },
        {
          _validations: [],
          _username: 'aylingw',
          _id: 1446,
          _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
          _ustatus: null,
          _created: '2019-07-31T15:09:57.405Z',
          _updated: '2019-10-04T15:46:16.797Z',
          _updatedBy: 'aylingw',
          _auditEvents: null,
          _name: 'WOZiTech Cares Sub 100',
          _address1: 'Number 1',
          _address2: 'My street',
          _address3: '',
          _town: 'My Town',
          _county: '',
          _locationId: '1-888777666',
          _provId: '1-999888777',
          _postcode: 'LN11 9JG',
          _isRegulated: true,
          _mainService: { id: 1, name: 'Carers support' },
          _nmdsId: 'G1002110',
          _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
          _overallWdfEligibility: null,
          _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
          _staffWdfEligibility: null,
          _isParent: false,
          _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
          _parentId: 479,
          _parentName: null,
          _dataOwner: 'Parent',
          _dataPermissions: 'None',
          _archived: false,
          _dataOwnershipRequested: null,
          _reasonsForLeaving: '',
          _properties: {
            _properties: [Object],
            _propertyTypes: [Array],
            _auditEvents: null,
            _modifiedProperties: [],
            _additionalModels: null
          },
          _isNew: false,
          _workerEntities: {},
          _readyForDeletionWorkers: null,
          _status: 'COMPLETE',
          _logLevel: 300
        }
      ]);
    });
  });
});
