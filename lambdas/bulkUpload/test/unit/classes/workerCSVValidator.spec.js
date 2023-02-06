const expect = require('chai').expect;
const moment = require('moment');
const WorkerCsvValidator = require('../../../classes/workerCSVValidator').WorkerCsvValidator;
const { build } = require('@jackfranklin/test-data-bot');
const mappings = require('../../../../../reference/BUDIMappings').mappings;

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
    NINUMBER: 'JA622112A',
    NMCREG: '',
    NONSCQUAL: '2',
    NURSESPEC: '',
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

describe('/lambdas/bulkUpload/classes/workerCSVValidator', async () => {
  describe('validations', () => {
    describe('days sick', () => {
      it('should emit a warning when days sick not already changed today', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv(),
          2,
          {
            daysSick: {
              currentValue: {
                value: 'Yes',
                days: 1,
              },
              lastSaved: moment().add(-1, 'days'),
            },
          },
          mappings,
        );

        await validator.validate();

        expect(validator.validationErrors.map((err) => err.warning)).to.include(
          'DAYSSICK in the last 12 months has not changed please check this is correct',
        );
      });

      it('should not emit a warning when days sick already changed today', async () => {
        const validator = new WorkerCsvValidator(buildWorkerCsv(), 2, null, mappings);

        validator._currentWorker = buildWorkerRecord();

        await validator.validate();

        expect(validator.validationErrors.map((err) => err.warning)).not.to.include(
          'DAYSSICK in the last 12 months has not changed please check this is correct',
        );
      });
    });

    describe('start in sector', () => {
      it("should not emit a warning when STARTINSECT is set to 999(Don't know)", async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              STARTINSECT: '999',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator.validate();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(0);
      });

      it('should emit incorrect formatting warning when STARTINSECT is not a valid number', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              STARTINSECT: 'abcd',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator.validate();
        const validationErrors = validator._validationErrors;

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
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              STARTINSECT: '1993',
              DOB: '10/12/1982',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator.validate();
        const validationErrors = validator._validationErrors;

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
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              STARTINSECT: '2020',
              STARTDATE: '10/12/2019',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator.validate();
        const validationErrors = validator._validationErrors;

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
        const validator = new WorkerCsvValidator(
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
          mappings,
        );

        await validator.validate();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(0);
      });

      it('should not emit a warning when either specialism 7 or 8', async () => {
        const validator = new WorkerCsvValidator(
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
          mappings,
        );

        await validator.validate();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(0);
      });

      it('should emit a warning when any combination of specialisms 1-6 along with either 7 or 8', async () => {
        const validator = new WorkerCsvValidator(
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
          mappings,
        );

        await validator.validate();
        const validationErrors = validator._validationErrors;

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
        const validator = new WorkerCsvValidator(
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
          mappings,
        );

        await validator.validate();
        const validationErrors = validator._validationErrors;

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
        const validator = new WorkerCsvValidator(
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
          mappings,
        );

        await validator.validate();
        await validator.transform();

        const validationErrors = validator._validationErrors;

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
          mappings,
        );

        await validator.validate();
        await validator.transform();

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
          mappings,
        );

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._validationErrors.length).to.equal(0);
      });
    });

    describe('_validateContractType()', () => {
      it('should allow valid EMPLSTATUS', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              EMPLSTATUS: '1',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator.validate();

        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._validationErrors.length).to.equal(0);
      });

      it('should add contract type error when EMPLSTATUS is empty', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
          },
        });
        worker.EMPLSTATUS = ''; // cannot override with empty string

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();

        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          {
            worker: worker.UNIQUEWORKERID,
            name: worker.LOCALESTID,
            lineNumber: 2,
            errCode: WorkerCsvValidator.CONTRACT_TYPE_ERROR,
            errType: 'CONTRACT_TYPE_ERROR',
            error: 'EMPLSTATUS has not been supplied',
            source: worker.EMPLSTATUS,
            column: 'EMPLSTATUS',
          },
        ]);
        expect(validator._validationErrors.length).to.equal(1);
      });

      it('should add contract type error when EMPLSTATUS is not a number', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              EMPLSTATUS: 'Spoilers',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator.validate();

        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.CONTRACT_TYPE_ERROR,
            errType: 'CONTRACT_TYPE_ERROR',
            error: 'EMPLSTATUS has not been supplied',
            source: 'Spoilers',
            column: 'EMPLSTATUS',
          },
        ]);
        expect(validator._validationErrors.length).to.equal(1);
      });
    });

    describe('_validationQualificationRecords', () => {
      it('should not emit a warning if the qualification year and ID are valid', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: '314;2020',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(0);
      });

      it('should emit a error if the qualification ID not a number', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: 'qualification;2020',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_ERROR,
            errType: 'QUAL_ACH01_ERROR',
            error: 'The code you have entered for (QUALACH01) is incorrect',
            source: 'qualification;2020',
            column: 'QUALACH01',
          },
        ]);
      });

      it('should emit a warning if the year is null', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: '314;',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: WorkerCsvValidator.QUAL_ACH01_ERROR,
            warnType: 'QUAL_ACH01_ERROR',
            warning: 'Year achieved for QUALACH01 is blank',
            source: '314;',
            column: 'QUALACH01',
          },
        ]);
      });

      it('should emit an error if the year is not a number', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: '314;happy',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_ERROR,
            errType: 'QUAL_ACH01_ERROR',
            error: 'The year in (QUALACH01) is invalid',
            source: '314;happy',
            column: 'QUALACH01',
          },
        ]);
      });

      it('should emit an error if the year is invalid', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: '314;happy',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_ERROR,
            errType: 'QUAL_ACH01_ERROR',
            error: 'The year in (QUALACH01) is invalid',
            source: '314;happy',
            column: 'QUALACH01',
          },
        ]);
      });

      it('should emit an error if the qualification year is over 100 years ago', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: '314;1900',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_ERROR,
            errType: 'QUAL_ACH01_ERROR',
            error: 'The year in (QUALACH01) is invalid',
            source: '314;1900',
            column: 'QUALACH01',
          },
        ]);
      });

      it('should emit an error if the qualification year is in the future', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: '314;5000',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_ERROR,
            errType: 'QUAL_ACH01_ERROR',
            error: 'The year in (QUALACH01) is invalid',
            source: '314;5000',
            column: 'QUALACH01',
          },
        ]);
      });

      it('should emit a warning if the qualification description is greater than 120 characters', async () => {
        const longstring =
          'thisisalongstringthisisalongstringthisisalongstringthisisalongstringthisisalongstringthisisalongstringthisisalongstringthis';
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: '314;2015',
              QUALACH01NOTES: longstring,
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(1);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: WorkerCsvValidator.QUAL_ACH01_NOTES_ERROR,
            warnType: 'QUAL_ACH01_NOTES_ERROR',
            warning: 'The notes you have entered for (QUALACH01NOTES) are over 120 characters and will be ignored',
            source: longstring,
            column: 'QUALACH01NOTES',
          },
        ]);
      });
    });

    describe('_validateLocalId()', () => {
      it('should allow valid LOCALESTID', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              LOCALESTID: 'ValidWorkplaceID',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator.validate();

        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._validationErrors.length).to.equal(0);
      });

      it('should add LOCAL_ID_ERROR error when LOCALESTID is empty', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
          },
        });
        worker.LOCALESTID = ''; // cannot override with empty string

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();

        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: WorkerCsvValidator.LOCAL_ID_ERROR,
            errType: 'LOCAL_ID_ERROR',
            error: 'LOCALESTID has not been supplied',
            source: worker.LOCALESTID,
            column: 'LOCALESTID',
          },
        ]);
        expect(validator._validationErrors.length).to.equal(1);
      });

      it('should add LOCAL_ID_ERROR error when LOCALESTID is over 50 characters', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            LOCALESTID:
              'ReallyLongWorkplaceIDReallyLongWorkplaceIDReallyLongWorkplaceIDReallyLongWorkplaceIDReallyLongWorkplaceID',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();

        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: WorkerCsvValidator.LOCAL_ID_ERROR,
            errType: 'LOCAL_ID_ERROR',
            error: 'LOCALESTID is longer than 50 characters',
            source: worker.LOCALESTID,
            column: 'LOCALESTID',
          },
        ]);
        expect(validator._validationErrors.length).to.equal(1);
      });
    });

    describe('_validateSalary()', () => {
      it('should not error when the worker is not a senior manager and the salary is between £500 and £200000', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARY: '20000',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._validationErrors.length).to.equal(0);
      });

      it('should not error when the worker is a senior manager and the salary entered is over £200000 and under £250000', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARY: '240000',
            MAINJOBROLE: '1',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._validationErrors.length).to.equal(0);
      });

      it('should error when salary entered is below £500', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARY: '300',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: WorkerCsvValidator.SALARY_ERROR,
            errType: 'SALARY_ERROR',
            error: 'SALARY must be between £500 and £200000',
            source: worker.SALARY,
            column: 'SALARY',
            name: 'MARMA',
            worker: '3',
          },
        ]);
        expect(validator._validationErrors.length).to.equal(1);
      });

      it('should error when worker is not a senior manager and salary is over £200000', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARY: '250000',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: WorkerCsvValidator.SALARY_ERROR,
            errType: 'SALARY_ERROR',
            error: 'SALARY must be between £500 and £200000',
            source: worker.SALARY,
            column: 'SALARY',
            name: 'MARMA',
            worker: '3',
          },
        ]);
        expect(validator._validationErrors.length).to.equal(1);
      });

      it('should error when the worker is a senior manager and the salary entered is over £250000', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARY: '260000',
            MAINJOBROLE: '1',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: WorkerCsvValidator.SALARY_ERROR,
            errType: 'SALARY_ERROR',
            error: 'SALARY must be between £500 and £250000',
            source: worker.SALARY,
            column: 'SALARY',
            name: 'MARMA',
            worker: '3',
          },
        ]);
        expect(validator._validationErrors.length).to.equal(1);
      });
    });
  });
});
