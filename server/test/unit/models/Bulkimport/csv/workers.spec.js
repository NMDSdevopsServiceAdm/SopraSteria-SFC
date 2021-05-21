const expect = require('chai').expect;
const maxquals = require('../../../mockdata/workers').maxquals;
const yesNoDontKnow = require('../../../mockdata/workers').yesNoDontKnow;
const knownHeaders = require('../../../mockdata/workers').knownHeaders;
const moment = require('moment');
const filename = 'server/models/BulkImport/csv/workers.js';
const sinon = require('sinon');
const dbmodels = require('../../../../../models');
sinon.stub(dbmodels.status, 'ready').value(false);
const BUDI = require('../../../../../models/BulkImport/BUDI').BUDI;
const WorkerCsvValidator = require('../../../../../models/BulkImport/csv/workers').Worker;
const testUtils = require('../../../../../utils/testUtils');
const { build } = require('@jackfranklin/test-data-bot');
const { apiWorkerBuilder } = require('../../../../integration/utils/worker');
const get = require('lodash/get');

const sandbox = require('sinon').createSandbox();

const establishment = {
  id: 123,
  LocalIdentifierValue: 'Test McTestface',
};
const workers = [apiWorkerBuilder(), apiWorkerBuilder(), apiWorkerBuilder()];

const buildWorkerCsv = build('WorkerCSV', {
  fields: {
    AMHP: '',
    APPRENTICE: '2',
    AVGHOURS: '',
    BRITISHCITIZENSHIP: '',
    CARECERT: '3',
    CONTHOURS: '23',
    COUNTRYOFBIRTH: '826',
    DAYSSICK: '1',
    DISABLED: '0',
    DISPLAYID: 'Aaron Russell',
    DOB: '10/12/1982',
    EMPLSTATUS: '1',
    ETHNICITY: '41',
    GENDER: '1',
    HOURLYRATE: '',
    LOCALESTID: 'MARMA',
    MAINJOBROLE: '4',
    MAINJRDESC: '',
    NATIONALITY: '826',
    FLUVAC: '',
    NINUMBER: 'JA622112A',
    NMCREG: '',
    NONSCQUAL: '2',
    NURSESPEC: '',
    OTHERJOBROLE: '10',
    OTHERJRDESC: '',
    POSTCODE: 'LS1 1AA',
    QUALACH01: '',
    QUALACH01NOTES: '',
    QUALACH02: '',
    QUALACH02NOTES: '',
    QUALACH03: '',
    QUALACH03NOTES: '',
    RECSOURCE: '16',
    SALARY: '20000',
    SALARYINT: '1',
    SCQUAL: '2',
    STARTDATE: '12/11/2001',
    STARTINSECT: '2001',
    STATUS: 'UPDATE',
    UNIQUEWORKERID: '3',
    YEAROFENTRY: '',
    ZEROHRCONT: '2',
  },
});

const buildWorkerRecord = build('WorkerRecord', {
  fields: {
    _properties: {
      get() {
        return { changedAt: moment() };
      },
    },
    daysSick: {
      days: 1,
    },
  },
});

const buildEstablishmentRecord = build('EstablishmentRecord', {
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
  _locationId: 'A-328849599',
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
    _additionalModels: null,
  },
  _isNew: false,
  _workerEntities: {},
  _readyForDeletionWorkers: null,
  _status: 'NEW',
  _logLevel: 300,
  daysSick: {
    days: 1,
  },
});

const buildSecondEstablishmentRecord = () =>
  buildEstablishmentRecord({
    overrides: {
      _id: 1446,
      _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
      _isRegulated: true,
      _status: 'COMPLETE',
      _parentId: 479,
      _dataOwner: 'Parent',
    },
  });

const getUnitInstance = () => {
  const bulkUpload = testUtils.sandBox(filename, {
    locals: {
      require: testUtils.wrapRequire({
        '../BUDI': {
          BUDI,
        },
        moment: {
          moment,
        },
        'lodash/get': get,
      }),
    },
  });

  expect(bulkUpload).to.have.property('Worker');

  expect(bulkUpload.Worker).to.be.a('function');

  return new bulkUpload.Worker();
};
describe('/server/models/Bulkimport/csv/workers.js', () => {
  describe('get headers', () => {
    it('should return a string of headers seperated by a comma', () => {
      const bulkUpload = getUnitInstance();

      expect(bulkUpload).to.have.property('headers');

      const columnHeaders = bulkUpload.headers;

      expect(columnHeaders).to.be.a('function');

      const result = columnHeaders(maxquals);

      expect(result).to.be.a('string');

      expect(result.split(',')).to.deep.equal(knownHeaders);
    });
  });

  describe('validations', () => {
    it('should emit an error if REGTYPE is not 2 (CQC) but worker has registered manager main job role', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            moment: moment,
            'lodash/get': get,
          }),
        },
      }).Worker)(buildWorkerCsv(), 2, [buildEstablishmentRecord(), buildSecondEstablishmentRecord()]);

      expect(bulkUpload).to.have.property('crossValidate');

      const csvWorkerSchemaErrors = [];

      const myEstablishments = [
        {
          key: 'MARMA',
          status: 'UPDATE',
          regtype: 1,
        },
      ];

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await bulkUpload.validate();

      // call the method
      await bulkUpload.crossValidate({
        csvWorkerSchemaErrors,
        myEstablishments,
      });

      // assert a error was returned
      expect(csvWorkerSchemaErrors.length).to.equal(1);

      expect(csvWorkerSchemaErrors[0]).to.deep.equal({
        lineNumber: 2,
        name: 'MARMA',
        source: '4',
        column: 'MAINJOBROLE',
        worker: '3',
        errCode: 1280,
        errType: 'MAIN_JOB_ROLE_ERROR',
        error:
          'Workers MAINJOBROLE is Registered Manager but you are not providing a CQC regulated service. Please change to another Job Role',
      });
    });
    it('should not emit an error if REGTYPE is 2 (CQC) but worker has registered manager main job role', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            moment: moment,
            'lodash/get': get,
          }),
        },
      }).Worker)(buildWorkerCsv(), 2, [
        buildEstablishmentRecord({
          overrides: {
            _isRegulated: true,
          },
        }),
        buildSecondEstablishmentRecord(),
      ]);

      expect(bulkUpload).to.have.property('crossValidate');

      const csvWorkerSchemaErrors = [];

      const myEstablishments = [
        {
          key: 'MARMA',
          status: 'UPDATE',
          regType: 2,
        },
      ];

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await bulkUpload.validate();

      // call the method
      await bulkUpload.crossValidate({
        csvWorkerSchemaErrors,
        myEstablishments,
      });

      // assert a error was returned
      expect(csvWorkerSchemaErrors.length).to.equal(0);

      expect(csvWorkerSchemaErrors).to.deep.equal([]);
    });
    it('should not emit an error if REGTYPE is 2 (CQC) but worker has registered manager main job role', async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            moment: moment,
            'lodash/get': get,
          }),
        },
      }).Worker)(buildWorkerCsv(), 2, [
        buildEstablishmentRecord({
          overrides: {
            _isRegulated: true,
          },
        }),
        buildSecondEstablishmentRecord(),
      ]);

      expect(bulkUpload).to.have.property('crossValidate');

      const csvWorkerSchemaErrors = [];

      const myEstablishments = [
        {
          key: 'MARMA',
          status: 'UPDATE',
          regType: 2,
        },
      ];

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await bulkUpload.validate();

      // call the method
      await bulkUpload.crossValidate({
        csvWorkerSchemaErrors,
        myEstablishments,
      });

      // assert a error was returned
      expect(csvWorkerSchemaErrors.length).to.equal(0);

      expect(csvWorkerSchemaErrors).to.deep.equal([]);
    });
    it("should not emit an error if REGTYPE is 2 (CQC) but worker doesn't have registered manager main job role", async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            moment: moment,
            'lodash/get': get,
          }),
        },
      }).Worker)(
        buildWorkerCsv({
          overrides: {
            MAINJOBROLE: '3',
          },
        }),
        2,
        [
          buildEstablishmentRecord({
            overrides: {
              _isRegulated: true,
            },
          }),
          buildSecondEstablishmentRecord(),
        ],
      );

      expect(bulkUpload).to.have.property('crossValidate');

      const csvWorkerSchemaErrors = [];

      const myEstablishments = [
        {
          key: 'MARMA',
          status: 'UPDATE',
          regType: 2,
        },
      ];

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await bulkUpload.validate();

      // call the method
      await bulkUpload.crossValidate({
        csvWorkerSchemaErrors,
        myEstablishments,
      });

      // assert a error was returned
      expect(csvWorkerSchemaErrors.length).to.equal(0);

      expect(csvWorkerSchemaErrors).to.deep.equal([]);
    });
    it("should not emit an error if REGTYPE is not 2 (CQC) but worker doesn't have registered manager main job role", async () => {
      const bulkUpload = new (testUtils.sandBox(filename, {
        locals: {
          require: testUtils.wrapRequire({
            '../BUDI': {
              BUDI,
            },
            moment: moment,
            'lodash/get': get,
          }),
        },
      }).Worker)(
        buildWorkerCsv({
          overrides: {
            MAINJOBROLE: '3',
          },
        }),
        2,
        [
          buildEstablishmentRecord({
            overrides: {
              _isRegulated: true,
            },
          }),
          buildSecondEstablishmentRecord(),
        ],
      );

      expect(bulkUpload).to.have.property('crossValidate');

      const csvWorkerSchemaErrors = [];

      const myEstablishments = [
        {
          key: 'MARMA',
          status: 'UPDATE',
          regType: 1,
        },
      ];

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await bulkUpload.validate();

      // call the method
      await bulkUpload.crossValidate({
        csvWorkerSchemaErrors,
        myEstablishments,
      });

      // assert a error was returned
      expect(csvWorkerSchemaErrors.length).to.equal(0);

      expect(csvWorkerSchemaErrors).to.deep.equal([]);
    });

    describe('days sick', () => {
      it('should emit a warning when days sick not already changed today', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
            }),
          },
        }).Worker)(buildWorkerCsv(), 2, [buildEstablishmentRecord()]);

        bulkUpload._currentWorker = buildWorkerRecord({
          overrides: {
            _properties: {
              get() {
                return { savedAt: moment().add(-1, 'days') };
              },
            },
          },
        });

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        // assert a error was returned
        expect(bulkUpload.validationErrors.map((err) => err.warning)).to.include(
          'DAYSSICK in the last 12 months has not changed please check this is correct',
        );
      });

      it('should not emit a warning when days sick already changed today', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
            }),
          },
        }).Worker)(buildWorkerCsv(), 2, [buildEstablishmentRecord()]);

        bulkUpload._currentWorker = buildWorkerRecord();

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        // assert a error was returned
        expect(bulkUpload.validationErrors.map((err) => err.warning)).not.to.include(
          'DAYSSICK in the last 12 months has not changed please check this is correct',
        );
      });
    });
    describe('flu jab', () => {
      const codesToTest = ['1', '2', '999'];
      codesToTest.forEach((code) => {
        it('should not emit an warning if FLUVAC is not ' + code, async () => {
          const bulkUpload = new (testUtils.sandBox(filename, {
            locals: {
              require: testUtils.wrapRequire({
                '../BUDI': {
                  BUDI,
                },
                moment: moment,
                'lodash/get': get,
              }),
            },
          }).Worker)(
            buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                FLUVAC: code,
              },
            }),
            2,
            [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
          );

          expect(bulkUpload).to.have.property('crossValidate');

          // Regular validation has to run first for the establishment to populate the internal properties correctly
          await bulkUpload.validate();

          const validationErrors = bulkUpload._validationErrors;

          // assert a error was returned
          expect(validationErrors.length).to.equal(0);
        });
      });
      it('should emit an warning if FLUVAC is not in 1, 2, 999, null', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              FLUVAC: '8',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        expect(bulkUpload).to.have.property('crossValidate');

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        const validationErrors = bulkUpload._validationErrors;

        // assert a error was returned
        expect(validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: 3055,
            warnType: 'WORKER_FLUVAC_WARNING',
            warning: 'FLUVAC the code you have selected has not been recognised and will be ignored',
            source: '8',
            column: 'FLUVAC',
          },
        ]);
      });
    });

    describe('nurse specialisms', () => {
      it('should not emit a warning for any combination of specialisms 1-6', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              MAINJOBROLE: '16',
              NMCREG: '1',
              NURSESPEC: '1;2;3;4;5;6',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        expect(bulkUpload).to.have.property('crossValidate');

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        const validationErrors = bulkUpload._validationErrors;

        // assert a error was returned
        expect(validationErrors.length).to.equal(0);
      });

      it('should not emit a warning when either specialism 7 or 8', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              MAINJOBROLE: '16',
              NMCREG: '1',
              NURSESPEC: '7',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        expect(bulkUpload).to.have.property('crossValidate');

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        const validationErrors = bulkUpload._validationErrors;

        // assert a error was returned
        expect(validationErrors.length).to.equal(0);
      });

      it('should emit a warning when any combination of specialisms 1-6 along with either 7 or 8', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              MAINJOBROLE: '16',
              NMCREG: '1',
              NURSESPEC: '1;2;3;8',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        expect(bulkUpload).to.have.property('crossValidate');

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        const validationErrors = bulkUpload._validationErrors;

        // assert a error was returned
        expect(validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: 3350,
            warnType: 'NURSE_SPEC_WARNING',
            warning:
              'NURSESPEC it is not possible to use code 7 (not applicable) and code 8 (not known) with codes 1 to 6. Code 7 and 8 will be ignored',
            source: '1;2;3;8',
            column: 'NURSESPEC',
          },
        ]);
      });

      it('should emit a warning when both specialisms 7 and 8', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              MAINJOBROLE: '16',
              NMCREG: '1',
              NURSESPEC: '7;8',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        expect(bulkUpload).to.have.property('crossValidate');

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        const validationErrors = bulkUpload._validationErrors;

        // assert a error was returned
        expect(validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: 3350,
            warnType: 'NURSE_SPEC_WARNING',
            warning:
              'NURSESPEC it is not possible to use codes 7 (not applicable) with code 8 (not know). These will be ignored',
            source: '7;8',
            column: 'NURSESPEC',
          },
        ]);
      });

      it('should emit a warning when specialism is not any of 1-8', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              MAINJOBROLE: '16',
              NMCREG: '1',
              NURSESPEC: '1;2;9',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        expect(bulkUpload).to.have.property('crossValidate');

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();

        await bulkUpload.transform();

        const validationErrors = bulkUpload._validationErrors;

        // assert a error was returned
        expect(validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: 3350,
            warnType: 'NURSE_SPEC_WARNING',
            warning: 'NURSESPEC the code 9 you have entered has not been recognised and will be ignored',
            source: '1;2;9',
            column: 'NURSESPEC',
          },
        ]);
      });
    });

    const countryCodesToTest = [262, 418, 995];
    countryCodesToTest.forEach((countryCode) => {
      it('should validate for COUNTRYOFBIRTH ' + countryCode, async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              MAINJOBROLE: '3',
              COUNTRYOFBIRTH: `${countryCode}`,
              NATIONALITY: '862',
              STATUS: 'NEW',
            },
          }),
          2,
          [],
        );

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await validator.validate();

        // call the method
        await validator.transform();

        // assert a error was returned
        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._validationErrors.length).to.equal(0);
      });

      it('should validate for NATIONALITY ' + countryCode, async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              MAINJOBROLE: '3',
              COUNTRYOFBIRTH: '826',
              NATIONALITY: `${countryCode}`,
              STATUS: 'NEW',
            },
          }),
          2,
          [],
        );

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await validator.validate();

        // call the method
        await validator.transform();

        // assert a error was returned
        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._validationErrors.length).to.equal(0);
      });
    });
  });
  // Need to test if nationality is other and no nationality
  describe('toCSV', () => {
    beforeEach(() => {
      sandbox.stub(BUDI, 'ethnicity').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'nationality').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'country').callsFake((method, value) => value);
    });
    afterEach(() => {
      sandbox.restore();
    });

    workers.forEach((worker, index) => {
      describe('worker' + index, () => {
        it('should return basic CSV info in expected order', async () => {
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[0]).to.equal(establishment.LocalIdentifierValue);
          expect(csvAsArray[1]).to.equal(worker.LocalIdentifierValue);
          expect(csvAsArray[2]).to.equal('UNCHECKED');
          expect(csvAsArray[3]).to.equal(worker.NameOrIdValue);
        });
        yesNoDontKnow.forEach((value) => {
          it('should return return flu vaccine information', async () => {
            let fluvac = '';
            worker.FluJabValue = value.value;
            switch (worker.FluJabValue) {
              case 'Yes':
                fluvac = '1';
                break;

              case 'No':
                fluvac = '2';
                break;

              case "Don't know":
                fluvac = '999';
                break;
            }
            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[4]).to.equal(fluvac);
          });
        });
        it('should return national insurance number', async () => {
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal(worker.NationalInsuranceNumberValue);
        });
        it('should return blank if no national insurance number', async () => {
          worker.NationalInsuranceNumberValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal('');
        });
        it('should return postcode', async () => {
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[6]).to.equal(worker.PostcodeValue);
        });
        it('should return dob', async () => {
          const dobParts = worker.DateOfBirthValue.split('-');
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal(`${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`);
        });
        it('should return blank if no dob', async () => {
          worker.DateOfBirthValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal('');
        });
        [
          {
            name: 'Female',
            code: '2',
          },
          {
            name: 'Male',
            code: '1',
          },
          {
            name: 'Other',
            code: '4',
          },
          {
            name: "Don't know",
            code: '3',
          },
        ].forEach((value) => {
          it('should return correct gender for ' + value.name, async () => {
            worker.GenderValue = value.name;

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[8]).to.equal(value.code);
          });
        });
      });
    });
  });
  describe('isContent()', () => {
    it('return true when headings match with CHGUNIQUEWRKID', async () => {
      const header = 'LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DI';
      expect(WorkerCsvValidator.isContent(header)).to.deep.equal(true);
    });
    it('return true when headings match without CHGUNIQUEWRKID', async () => {
      const header = 'LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,FLUVAC,';
      expect(WorkerCsvValidator.isContent(header)).to.deep.equal(true);
    });
    it("return false when headings don't match", async () => {
      const header = 'NOTATALLWHATWEEXPECT,HOWCOULDYOUUPLOADTHISFILE,';
      expect(WorkerCsvValidator.isContent(header)).to.deep.equal(false);
    });
  });
});
