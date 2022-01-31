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
const models = require('../../../../../models');
const { Worker } = require('../../../../../models/BulkImport/csv/workers');

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
        '../../../models': models,
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
            '../../../models': models,
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
            '../../../models': models,
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
            '../../../models': models,
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
            '../../../models': models,
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
              '../../../models': models,
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
              '../../../models': models,
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
                '../../../models': models,
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
              '../../../models': models,
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

    describe('start in sector', () => {
      it("should not emit a warning when STARTINSECT is set to 999(Don't know)", async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
              '../../../models': models,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              STARTINSECT: '999',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();
        const validationErrors = bulkUpload._validationErrors;

        expect(validationErrors.length).to.equal(0);
      });

      it('should emit incorrect formatting warning when STARTINSECT is not a valid number', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
              '../../../models': models,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              STARTINSECT: 'abcd',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();
        const validationErrors = bulkUpload._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: 3200,
            warnType: 'START_INSECT_WARNING',
            warning: 'STARTINSECT is incorrectly formatted and will be ignored',
            source: 'abcd',
            column: 'STARTINSECT',
          },
        ]);
      });

      it('should emit a birthday warning when STARTINSECT is set to within 14 years of birthday', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
              '../../../models': models,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              STARTINSECT: '1993',
              DOB: '10/12/1982',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();
        const validationErrors = bulkUpload._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: 3200,
            warnType: 'START_INSECT_WARNING',
            warning: 'STARTINSECT is before workers 14th birthday and will be ignored',
            source: '1993',
            column: 'STARTINSECT',
          },
        ]);
      });

      it('should emit an after start date warning when STARTINSECT is after STARTDATE', async () => {
        const bulkUpload = new (testUtils.sandBox(filename, {
          locals: {
            require: testUtils.wrapRequire({
              '../BUDI': {
                BUDI,
              },
              moment: moment,
              'lodash/get': get,
              '../../../models': models,
            }),
          },
        }).Worker)(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              STARTINSECT: '2020',
              STARTDATE: '10/12/2019',
            },
          }),
          2,
          [buildEstablishmentRecord(), buildSecondEstablishmentRecord()],
        );

        // Regular validation has to run first for the establishment to populate the internal properties correctly
        await bulkUpload.validate();
        const validationErrors = bulkUpload._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: 3200,
            warnType: 'START_INSECT_WARNING',
            warning: 'STARTINSECT is after STARTDATE and will be ignored',
            source: '2020',
            column: 'STARTINSECT',
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
              '../../../models': models,
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
              '../../../models': models,
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
              '../../../models': models,
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
              '../../../models': models,
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
              '../../../models': models,
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
    describe('otherJobs', () => {
      it('should allow correct other jobs', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              OTHERJOBROLE: '25;17;26;11;34',
              OTHERJRDESC: ';;;;',
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

      it('should allow 0 as an option to say No', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              OTHERJOBROLE: '0',
              OTHERJRDESC: '',
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

      it('should not allow 0 as an option to say No and other roles', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              OTHERJOBROLE: '0;14',
              OTHERJRDESC: ';',
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
        expect(validator._validationErrors).to.deep.equal([
          {
            column: 'OTHERJOBROLE',
            errCode: 1320,
            errType: 'OTHER_JOB_ROLE_ERROR',
            error: 'OTHERJOBROLE is 0 (none) but contains other job roles',
            lineNumber: 2,
            name: 'MARMA',
            source: '0;14',
            worker: '3',
          },
        ]);
        expect(validator._validationErrors.length).to.equal(1);
      });
    });
  });
  // Need to test if nationality is other and no nationality
  describe('toCSV', () => {
    beforeEach(() => {
      sandbox.stub(BUDI, 'ethnicity').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'nationality').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'country').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'recruitment').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'jobRoles').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'nursingSpecialist').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'qualificationLevels').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'qualifications').callsFake((method, value) => value);
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
          it('should return return flu vaccine information ' + value.value, async () => {
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
        it('should return sanitised national insurance number if download-type is workers-sanitise', async () => {
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3, 'workersSanitise');
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal('Admin');
        });
        it('should return blank if no national insurance number', async () => {
          worker.NationalInsuranceNumberValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal('');
        });
        it('should return blank if no national insurance number and if download-type is workers-sanitise', async () => {
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3, 'workersSanitise');
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
        it('should return sanitised dob if download-type is workers-sanitise', async () => {
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3, 'workersSanitise');
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal('Admin');
        });
        it('should return blank if no dob', async () => {
          worker.DateOfBirthValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal('');
        });
        it('eturn blank if no dob and if download-type is workers-sanitise', async () => {
          worker.DateOfBirthValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3, 'workersSanitise');
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
        it('should return the correct ethnicity code', async () => {
          worker.ethnicity = {
            id: '123',
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[9]).to.equal(worker.ethnicity.id);
        });
        it('should be blank if no ethnicity', async () => {
          worker.ethnicity = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[9]).to.equal('');
        });
        [
          {
            name: 'British',
            code: '826',
          },
          {
            name: "Don't know",
            code: '998',
          },
          {
            name: 'Other',
            code: '999',
          },
        ].forEach((nationality) => {
          it('should return the correct code for nationality ' + nationality.name, async () => {
            worker.NationalityValue = nationality.name;
            worker.nationality = null;

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[10]).to.equal(nationality.code);
          });
        });
        it('should return the correct code for nationality with other value', async () => {
          worker.NationalityValue = 'Other';
          worker.nationality = {
            id: '134',
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[10]).to.equal(worker.nationality.id);
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code for british citizenship ' + value.value, async () => {
            worker.BritishCitizenshipValue = value.value;

            let britishCitizenship = '';
            switch (worker.BritishCitizenshipValue) {
              case 'Yes':
                britishCitizenship = '1';
                break;

              case 'No':
                britishCitizenship = '2';
                break;

              case "Don't know":
                britishCitizenship = '999';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[11]).to.equal(britishCitizenship);
          });
        });
        [
          {
            name: 'United Kingdom',
            code: '826',
          },
          {
            name: "Don't know",
            code: '998',
          },
          {
            name: 'Other',
            code: '999',
          },
        ].forEach((country) => {
          it('should return the correct code for country of birth ' + country.name, async () => {
            worker.CountryOfBirthValue = country.name;
            worker.countryOfBirth = null;

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[12]).to.equal(country.code);
          });
        });
        it('should return the correct code for country of birth with other value', async () => {
          worker.CountryOfBirthValue = 'Other';
          worker.countryOfBirth = {
            id: '458',
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[12]).to.equal(worker.countryOfBirth.id);
        });
        it('should return the correct code for year arrived year', async () => {
          worker.YearArrivedValue = 'Yes';
          worker.YearArrivedYear = '1998';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[13]).to.equal(worker.YearArrivedYear);
        });
        it('should not return year if the year arrived is no', async () => {
          worker.YearArrivedValue = 'No';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[13]).to.equal('');
        });
        [
          {
            name: 'Yes',
            code: '1',
          },
          {
            name: 'No',
            code: '0',
          },
          {
            name: 'Undisclosed',
            code: '2',
          },
          {
            name: "Don't know",
            code: '3',
          },
        ].forEach((disability) => {
          it('should return the correct code for disability ' + disability.name, async () => {
            worker.DisabilityValue = disability.name;

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[14]).to.equal(disability.code);
          });
        });
        [
          {
            name: 'Yes, completed',
            code: '1',
          },
          {
            name: 'No',
            code: '2',
          },
          {
            name: 'Yes, in progress or partially completed',
            code: '3',
          },
        ].forEach((careCert) => {
          it('should return the correct code for care certificate ' + careCert.name, async () => {
            worker.CareCertificateValue = careCert.name;

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[15]).to.equal(careCert.code);
          });
        });
        it('should return the correct code for no in recruitment source', async () => {
          worker.RecruitedFromValue = 'No';
          worker.recruitedFrom = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[16]).to.equal('16');
        });
        it('should return the correct code for recruitment source', async () => {
          worker.RecruitedFromValue = 'Yes';
          worker.recruitedFrom = {
            id: '1789',
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[16]).to.equal('1789');
        });
        it('should return start date', async () => {
          const startDateParts = worker.MainJobStartDateValue.split('-');
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[17]).to.equal(`${startDateParts[2]}/${startDateParts[1]}/${startDateParts[0]}`);
        });
        it('should return blank if no start date', async () => {
          worker.MainJobStartDateValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[17]).to.equal('');
        });
        it('should return the correct code for social care start date', async () => {
          worker.SocialCareStartDateValue = 'Yes';
          worker.SocialCareStartDateYear = '1998';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[18]).to.equal(worker.YearArrivedYear);
        });
        it('should not return year if the social care start date is no', async () => {
          worker.SocialCareStartDateValue = 'No';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[18]).to.equal('');
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code for apprenticeship ' + value.value, async () => {
            worker.ApprenticeshipTrainingValue = value.value;

            let apprenticeship = '';
            switch (worker.ApprenticeshipTrainingValue) {
              case 'Yes':
                apprenticeship = '1';
                break;

              case 'No':
                apprenticeship = '2';
                break;

              case "Don't know":
                apprenticeship = '999';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[19]).to.equal(apprenticeship);
          });
        });
        [
          {
            name: 'Permanent',
            code: '1',
          },
          {
            name: 'Temporary',
            code: '2',
          },
          {
            name: 'Pool/Bank',
            code: '3',
          },
          {
            name: 'Agency',
            code: '4',
          },
          {
            name: 'Other',
            code: '7',
          },
        ].forEach((empStatus) => {
          it('should return employment status ' + empStatus.name, async () => {
            worker.ContractValue = empStatus.name;

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[20]).to.equal(empStatus.code);
          });
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code for zero hours ' + value.value, async () => {
            worker.ZeroHoursContractValue = value.value;

            let zeroHours = '';
            switch (worker.ZeroHoursContractValue) {
              case 'Yes':
                zeroHours = '1';
                break;

              case 'No':
                zeroHours = '2';
                break;

              case "Don't know":
                zeroHours = '999';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[21]).to.equal(zeroHours);
          });
        });
        it('should return the correct number of sick days if Yes', async () => {
          worker.DaysSickValue = 'Yes';
          worker.DaysSickDays = '4';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[22]).to.equal(worker.DaysSickDays);
        });
        it('should not return days if the sick value is no', async () => {
          worker.SocialCareStartDateValue = 'No';
          worker.DaysSickDays = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[22]).to.equal('');
        });
        it('should return hourly value and rate', async () => {
          worker.AnnualHourlyPayValue = 'Hourly';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[23]).to.equal('3');
          expect(csvAsArray[24]).to.equal('');
          expect(csvAsArray[25]).to.equal(String(worker.AnnualHourlyPayRate));
        });
        it('should return annual value and rate', async () => {
          worker.AnnualHourlyPayValue = 'Annually';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[23]).to.equal('1');
          expect(csvAsArray[24]).to.equal(String(worker.AnnualHourlyPayRate));
          expect(csvAsArray[25]).to.equal('');
        });
        it('should not return annual/hourly value or rate', async () => {
          worker.AnnualHourlyPayValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[23]).to.equal('');
          expect(csvAsArray[24]).to.equal('');
          expect(csvAsArray[25]).to.equal('');
        });
        it('should return main job id', async () => {
          worker.mainJob = {
            id: '987',
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[26]).to.equal(worker.mainJob.id);
        });
        it('should not return main job id', async () => {
          worker.mainJob = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[26]).to.equal('');
        });
        it('should return main job other value', async () => {
          worker.mainJob = {
            other: true,
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[27]).to.equal(worker.MainJobFkOther);
        });
        it('should not return main job other value', async () => {
          worker.mainJob = {
            other: false,
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[27]).to.equal('');
        });
        it('should not return main job other value', async () => {
          worker.mainJob = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[27]).to.equal('');
        });
        ['Permanent', 'Temporary'].forEach((contract) => {
          it('should return contracted hours if the contract is ' + contract, async () => {
            worker.ContractValue = contract;
            worker.WeeklyHoursContractedValue = 'Yes';
            worker.ZeroHoursContractValue = 'No';

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[28]).to.equal(String(worker.WeeklyHoursContractedHours));
          });
        });
        it('should not return contracted hours if the contract is Agency', async () => {
          worker.ContractValue = 'Agency';
          worker.WeeklyHoursContractedValue = 'No';
          worker.ZeroHoursContractValue = 'Yes';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[28]).to.equal('');
        });
        ['Pool/Bank', 'Agency', 'Other'].forEach((contract) => {
          it('should return average hours if the contract is ' + contract, async () => {
            worker.ContractValue = contract;
            worker.WeeklyHoursAverageValue = 'Yes';
            worker.ZeroHoursContractValue = 'Yes';

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[29]).to.equal(String(worker.WeeklyHoursAverageHours));
          });
        });
        it('should not return average hours if the contract is Temporary', async () => {
          worker.ContractValue = 'Temporary';
          worker.WeeklyHoursAverageValue = null;
          worker.ZeroHoursContractValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[29]).to.equal('');
        });
        it('should return other jobs if other jobs value is Yes', async () => {
          worker.OtherJobsValue = 'Yes';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[30]).to.equal(String(worker.otherJobs[0].id));
        });
        it('should not return other jobs if other jobs value is No', async () => {
          worker.OtherJobsValue = 'No';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[30]).to.equal('');
        });
        it('should not return other jobs if other jobs value is null', async () => {
          worker.OtherJobsValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[30]).to.equal('');
        });
        it('should return other jobs desc if other jobs value is Yes and is an other value', async () => {
          worker.OtherJobsValue = 'Yes';
          worker.otherJobs[0].other = true;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[31]).to.equal(worker.otherJobs[0].workerJobs.other);
        });
        it('should not return other jobs desc if other jobs value is No', async () => {
          worker.OtherJobsValue = 'No';

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[31]).to.equal('');
        });
        it('should not return other jobs desc if other jobs value is null', async () => {
          worker.OtherJobsValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[31]).to.equal('');
        });
        [
          {
            name: 'Adult Nurse',
            code: '01',
          },
          {
            name: 'Mental Health Nurse',
            code: '02',
          },
          {
            name: 'Learning Disabilities Nurse',
            code: '03',
          },
          {
            name: "Children's Nurse",
            code: '04',
          },
          {
            name: 'Enrolled Nurse',
            code: '05',
          },
        ].forEach((regNurse) => {
          it(
            'should return registered nurse value if main job is nurse and they have registered value of ' +
              regNurse.name,
            async () => {
              worker.RegisteredNurseValue = regNurse.name;
              worker.mainJob = {
                id: 23,
              };

              const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
              const csvAsArray = csv.split(',');

              expect(csvAsArray[32]).to.equal(regNurse.code);
            },
          );
        });
        it("should not return registered nurse value if main job is nurse and they don't have reg value", async () => {
          worker.RegisteredNurseValue = null;
          worker.mainJob = {
            id: 23,
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[32]).to.equal('');
        });
        it("should return reistered nurse value if main job is nurse and they don't have reg value", async () => {
          worker.RegisteredNurseValue = 'Adult Nurse';
          worker.mainJob = {
            id: 24,
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[32]).to.equal('');
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code nurse specialism ' + value.value, async () => {
            worker.mainJob = {
              id: 23,
            };
            worker.NurseSpecialismsValue = value.value;
            worker.nurseSpecialisms = [
              {
                id: '138',
              },
              {
                id: '23',
              },
            ];
            let nurseSpec = '';
            switch (worker.NurseSpecialismsValue) {
              case 'Yes':
                nurseSpec = `${worker.nurseSpecialisms[0].id};${worker.nurseSpecialisms[1].id}`;
                break;

              case 'No':
                nurseSpec = '7';
                break;

              case "Don't know":
                nurseSpec = '8';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[33]).to.equal(nurseSpec);
          });
        });
        it('should not return a code for nurse specialism if not a nurse', async () => {
          worker.NurseSpecialismsValue = 'No';
          worker.mainJob = {
            id: 24,
          };

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[33]).to.equal('');
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code for approved mental health worker ' + value.value, async () => {
            worker.ApprovedMentalHealthWorkerValue = value.value;

            let amhp = '';
            switch (worker.ApprovedMentalHealthWorkerValue) {
              case 'Yes':
                amhp = '1';
                break;

              case 'No':
                amhp = '2';
                break;

              case "Don't know":
                amhp = '999';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[34]).to.equal(amhp);
          });
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code sc qual ' + value.value, async () => {
            worker.QualificationInSocialCareValue = value.value;
            worker.socialCareQualification = [
              {
                id: '239',
              },
            ];
            let scqual = '';
            switch (worker.QualificationInSocialCareValue) {
              case 'Yes':
                scqual = `1;${worker.socialCareQualification.id}`;
                break;
              case 'No':
                scqual = '2';
                break;

              case "Don't know":
                scqual = '999';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[35]).to.equal(scqual);
          });
          it('should not return the correct code sc qual ' + value.value, async () => {
            worker.QualificationInSocialCareValue = value.value;
            worker.socialCareQualification = null;
            let scqual = '';
            switch (worker.QualificationInSocialCareValue) {
              case 'Yes':
                scqual = '1';
                break;
              case 'No':
                scqual = '2';
                break;

              case "Don't know":
                scqual = '999';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[35]).to.equal(scqual);
          });
        });
        it('should not return the correct code sc qual', async () => {
          worker.QualificationInSocialCareValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[35]).to.equal('');
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code non sc qual ' + value.value, async () => {
            worker.OtherQualificationsValue = value.value;
            worker.highestQualification = [
              {
                id: '239',
              },
            ];
            let nonscqual = '';
            switch (worker.OtherQualificationsValue) {
              case 'Yes':
                nonscqual = `1;${worker.highestQualification.id}`;
                break;
              case 'No':
                nonscqual = '2';
                break;

              case "Don't know":
                nonscqual = '999';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[36]).to.equal(nonscqual);
          });
          it('should not return the correct code non sc qual ' + value.value, async () => {
            worker.OtherQualificationsValue = value.value;
            worker.highestQualification = null;
            let nonscqual = '';
            switch (worker.OtherQualificationsValue) {
              case 'Yes':
                nonscqual = '1';
                break;
              case 'No':
                nonscqual = '2';
                break;

              case "Don't know":
                nonscqual = '999';
                break;
            }

            const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[36]).to.equal(nonscqual);
          });
        });
        it('should not return the correct code non sc qual', async () => {
          worker.OtherQualificationsValue = null;

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[36]).to.equal('');
        });
        it('should return the correct code and year for qual 01', async () => {
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[37]).to.equal(
            `${worker.qualifications[0].qualification.id};${worker.qualifications[0].year}`,
          );
        });
        it('should return the correct notes for qual 01 notes', async () => {
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[38]).to.equal(worker.qualifications[0].notes);
        });
        it('should return the unescaped notes for qual 01 notes', async () => {
          worker.qualifications[0].notes = '%EA%E9';
          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[38]).to.equal('êé');
        });
        it('should return the correct code and year for qual 01', async () => {
          worker.qualifications = [];

          const csv = WorkerCsvValidator.toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[37]).to.equal('');
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

  describe('crossValidate()', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should set establishmentRegType to true if status is UNCHECKED but establishment is regulated in database', () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'UNCHECKED',
          key: null,
        },
      ];
      const worker = new Worker();
      worker._status = 'NEW';

      sinon.stub(models.establishment, 'findbyId').returns({ isRegulated: true });
      const crossValidateStub = sinon.stub(worker, '_crossValidateMainJobRole');

      worker.crossValidate({ csvWorkerSchemaErrors: [], myEstablishments }).then(() => {
        crossValidateStub.should.have.been.calledWith([], true);
      });
    });

    it('should set establishmentRegType to true if status is NOCHANGE but establishment is regulated in database', () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'NOCHANGE',
          key: null,
        },
      ];
      const worker = new Worker();
      worker._status = 'NEW';

      sinon.stub(models.establishment, 'findbyId').returns({ isRegulated: true });
      const crossValidateStub = sinon.stub(worker, '_crossValidateMainJobRole');

      worker.crossValidate({ csvWorkerSchemaErrors: [], myEstablishments }).then(() => {
        crossValidateStub.should.have.been.calledWith([], true);
      });
    });

    it('should set establishmentRegType to false if status is UNCHECKED and establishment is not regulated in database', () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'UNCHECKED',
          key: null,
        },
      ];
      const worker = new Worker();
      worker._status = 'NEW';

      sinon.stub(models.establishment, 'findbyId').returns({ isRegulated: false });
      const crossValidateStub = sinon.stub(worker, '_crossValidateMainJobRole');

      worker.crossValidate({ csvWorkerSchemaErrors: [], myEstablishments }).then(() => {
        crossValidateStub.should.have.been.calledWith([], false);
      });
    });

    it('should set establishmentRegType to false if status is NOCHANGE and establishment is not regulated in database', () => {
      const myEstablishments = [
        {
          id: 1,
          status: 'NOCHANGE',
          key: null,
        },
      ];
      const worker = new Worker();
      worker._status = 'NEW';

      sinon.stub(models.establishment, 'findbyId').returns({ isRegulated: false });
      const crossValidateStub = sinon.stub(worker, '_crossValidateMainJobRole');

      worker.crossValidate({ csvWorkerSchemaErrors: [], myEstablishments }).then(() => {
        crossValidateStub.should.have.been.calledWith([], false);
      });
    });
  });
});
