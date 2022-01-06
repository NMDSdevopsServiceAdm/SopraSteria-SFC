const expect = require('chai').expect;
const maxquals = require('../../../mockdata/workers').maxquals;
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
const get = require('lodash/get');
const models = require('../../../../../models');

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
        }).Worker)(buildWorkerCsv(), 2, {
          daysSick: {
            currentValue: {
              value: 'Yes',
              days: 1,
            },
            lastSaved: moment().add(-1, 'days'),
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
            null,
          );

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
          null,
        );

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
          null,
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
          null,
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
          null,
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
          null,
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
          null,
        );

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
          null,
        );

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
          null,
        );

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
          null,
        );

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
          null,
        );

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
          null,
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
          null,
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
          null,
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
          null,
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
          null,
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
