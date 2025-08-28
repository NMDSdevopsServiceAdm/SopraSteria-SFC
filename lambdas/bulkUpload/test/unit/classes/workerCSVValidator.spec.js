const expect = require('chai').expect;
const { before, after } = require('mocha');
const moment = require('moment');
const sinon = require('sinon');
const WorkerCsvValidator = require('../../../classes/workerCSVValidator').WorkerCsvValidator;
const { build } = require('@jackfranklin/test-data-bot');
const mappings = require('../../../../../backend/reference/BUDIMappings').mappings;

const buildWorkerCsv = build('WorkerCSV', {
  fields: {
    AMHP: '',
    APPRENTICE: '2',
    AVGHOURS: '',
    BRITISHCITIZENSHIP: '',
    CARECERT: '3',
    L2CARECERT: '3',
    CONTHOURS: '23',
    COUNTRYOFBIRTH: '826',
    DAYSSICK: '1',
    DISABLED: '0',
    DISPLAYID: 'Aaron Russell',
    DOB: '10/12/1982',
    DHA: '1',
    EMPLSTATUS: '1',
    ETHNICITY: '41',
    GENDER: '1',
    HANDCVISA: '',
    HOURLYRATE: '',
    INOUTUK: '',
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
    CWPCATEGORY: '1',
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

    describe('_validateCarryOutDelegatedHealthcareActivities', () => {
      const validInputs = ['1', '2', '999'];
      const databaseValues = ['Yes', 'No', "Don't know"];

      validInputs.forEach((bulkUploadValue, i) => {
        it(`should not add a warning for valid input ${bulkUploadValue}`, async () => {
          const validator = new WorkerCsvValidator(
            buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                DHA: bulkUploadValue,
              },
            }),
            2,
            null,
            mappings,
          );

          validator.validate();
          expect(validator._validationErrors).to.deep.equal([]);

          expect(validator._carryOutDelegatedHealthcareActivities).to.deep.equal(databaseValues[i]);
        });
      });

      it(`should not add a warning when the input is an empty string`, async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              DHA: '',
            },
          }),
          2,
          null,
          mappings,
        );

        validator.validate();
        expect(validator._validationErrors).to.deep.equal([]);

        expect(validator._carryOutDelegatedHealthcareActivities).to.deep.equal(null);
      });

      it('should add a warning for invalid input', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              DHA: '100',
            },
          }),
          2,
          null,
          mappings,
        );

        validator.validate();
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: 5660,
            warnType: 'DHA_WARNING',
            warning: 'The code for DHA is incorrect and will be ignored',
            source: '100',
            column: 'DHA',
          },
        ]);
        expect(validator._carryOutDelegatedHealthcareActivities).to.deep.equal(null);
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

    it('should emit an error if the country of birth is not valid', async () => {
      const validator = new WorkerCsvValidator(
        buildWorkerCsv({
          overrides: {
            MAINJOBROLE: '3',
            COUNTRYOFBIRTH: 'z',
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

      expect(validator._validationErrors).to.deep.equal([
        {
          worker: '3',
          name: 'MARMA',
          lineNumber: 2,
          errCode: WorkerCsvValidator.COUNTRY_OF_BIRTH_ERROR,
          errType: 'COUNTRY_OF_BIRTH_ERROR',
          error: 'Country of Birth (COUNTRYOFBIRTH) must be an integer',
          source: 'z',
          column: 'COUNTRYOFBIRTH',
        },
      ]);
      expect(validator._validationErrors.length).to.equal(1);
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

    describe('_validateHealthAndCareVisa()', () => {
      const healthAndCareVisaWarning = (warning, source) => {
        return {
          column: 'HANDCVISA',
          lineNumber: 2,
          name: 'MARMA',
          source,
          warnCode: WorkerCsvValidator.HANDCVISA_WARNING,
          warnType: 'HANDCVISA_WARNING',
          warning,
          worker: '3',
        };
      };

      [
        { buNumber: '1', mapping: 'Yes' },
        { buNumber: '2', mapping: 'No' },
        { buNumber: '999', mapping: "Don't know" },
      ].forEach((answer) => {
        it(`should not add warning when valid (${answer.buNumber}) health and care visa provided and worker from other nation and unknown citizenship`, async () => {
          const worker = buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              NATIONALITY: '418',
              BRITISHCITIZENSHIP: '999',
              HANDCVISA: answer.buNumber,
            },
          });

          const validator = new WorkerCsvValidator(worker, 2, null, mappings);

          await validator.validate();
          await validator.transform();

          expect(validator._validationErrors).to.deep.equal([]);
          expect(validator._validationErrors.length).to.equal(0);
        });

        it(`should not add warning when valid (${answer.buNumber}) health and care visa provided, worker does not have British citizenship and don't know nationality`, async () => {
          const worker = buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              NATIONALITY: '998',
              BRITISHCITIZENSHIP: '2',
              HANDCVISA: answer.buNumber,
            },
          });

          const validator = new WorkerCsvValidator(worker, 2, null, mappings);

          await validator.validate();
          await validator.transform();

          expect(validator._validationErrors).to.deep.equal([]);
          expect(validator._validationErrors.length).to.equal(0);
        });

        it(`should set healthAndCareVisa field with database mapping (${answer.mapping}) when valid (${answer.buNumber}) health and care visa provided and worker does not have British citizenship`, async () => {
          const worker = buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              NATIONALITY: '418',
              BRITISHCITIZENSHIP: '2',
              HANDCVISA: answer.buNumber,
            },
          });

          const validator = new WorkerCsvValidator(worker, 2, null, mappings);

          await validator.validate();
          await validator.transform();

          expect(validator._healthAndCareVisa).to.equal(answer.mapping);
        });
      });

      it('should add warning when health and care visa provided but worker has British citizenship', async () => {
        const healthAndCareVisaValue = '1';
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            NATIONALITY: '418',
            BRITISHCITIZENSHIP: '1',
            HANDCVISA: healthAndCareVisaValue,
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          healthAndCareVisaWarning(
            'HANDCVISA not required when worker is British or has British citizenship',
            healthAndCareVisaValue,
          ),
        ]);
        expect(validator._validationErrors.length).to.equal(1);
        expect(validator._healthAndCareVisa).to.equal(null);
      });

      it('should add warning when health and care visa provided but worker is British', async () => {
        const healthAndCareVisaValue = '1';
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            NATIONALITY: '826', // British code
            BRITISHCITIZENSHIP: '',
            HANDCVISA: healthAndCareVisaValue,
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          healthAndCareVisaWarning(
            'HANDCVISA not required when worker is British or has British citizenship',
            healthAndCareVisaValue,
          ),
        ]);
        expect(validator._validationErrors.length).to.equal(1);
        expect(validator._healthAndCareVisa).to.equal(null);
      });

      it('should add warning when health and care visa invalid', async () => {
        const healthAndCareVisaValue = '12345';
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            NATIONALITY: '418',
            BRITISHCITIZENSHIP: '2',
            HANDCVISA: healthAndCareVisaValue,
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          healthAndCareVisaWarning('HANDCVISA is incorrectly formatted and will be ignored', healthAndCareVisaValue),
        ]);
        expect(validator._validationErrors.length).to.equal(1);
        expect(validator._healthAndCareVisa).to.equal(null);
      });
    });

    describe('_validateEmployedFromOutsideUk()', () => {
      const employedFromOutsideUkWarning = (warning, source) => {
        return {
          column: 'INOUTUK',
          lineNumber: 2,
          name: 'MARMA',
          source,
          warnCode: WorkerCsvValidator.INOUTUK_WARNING,
          warnType: 'INOUTUK_WARNING',
          warning,
          worker: '3',
        };
      };

      [
        { buNumber: '1', mapping: 'Yes' },
        { buNumber: '2', mapping: 'No' },
        { buNumber: '999', mapping: "Don't know" },
      ].forEach((answer) => {
        it(`should not add warning when health and care visa is Yes (1) and valid value for INOUTUK (${answer.buNumber})`, async () => {
          const worker = buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              NATIONALITY: '418',
              BRITISHCITIZENSHIP: '2',
              HANDCVISA: '1',
              INOUTUK: answer.buNumber,
            },
          });

          const validator = new WorkerCsvValidator(worker, 2, null, mappings);

          await validator.validate();
          await validator.transform();

          expect(validator._validationErrors).to.deep.equal([]);
          expect(validator._validationErrors.length).to.equal(0);
        });

        it(`should set employedFromOutsideUk field with database mapping (${answer.mapping}) when health and care visa Yes and valid value for INOUTUK (${answer.buNumber})`, async () => {
          const worker = buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              NATIONALITY: '418',
              BRITISHCITIZENSHIP: '2',
              HANDCVISA: '1',
              INOUTUK: answer.buNumber,
            },
          });

          const validator = new WorkerCsvValidator(worker, 2, null, mappings);

          await validator.validate();
          await validator.transform();

          expect(validator._employedFromOutsideUk).to.equal(answer.mapping);
        });
      });

      it('should add warning when health and care visa is not Yes (No - 2) and INOUTUK is filled in', async () => {
        const employedFromOutsideUkValue = '2';
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            NATIONALITY: '418',
            BRITISHCITIZENSHIP: '2',
            HANDCVISA: '2',
            INOUTUK: employedFromOutsideUkValue,
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          employedFromOutsideUkWarning(
            'INOUTUK not required when worker does not have a Health and Care visa',
            employedFromOutsideUkValue,
          ),
        ]);
        expect(validator._validationErrors.length).to.equal(1);
        expect(validator._employedFromOutsideUk).to.equal(null);
      });

      it('should add warning when employed from inside or outside is invalid value', async () => {
        const employedFromOutsideUkValue = '12345';
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            NATIONALITY: '418',
            BRITISHCITIZENSHIP: '2',
            HANDCVISA: '1',
            INOUTUK: employedFromOutsideUkValue,
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors).to.deep.equal([
          employedFromOutsideUkWarning(
            'INOUTUK is incorrectly formatted and will be ignored',
            employedFromOutsideUkValue,
          ),
        ]);
        expect(validator._validationErrors.length).to.equal(1);
        expect(validator._employedFromOutsideUk).to.equal(null);
      });

      it('should add warning when health and care visa is Yes(1) but invalid and INOUTUK is filled in', async () => {
        const employedFromOutsideUkValue = '2';
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            NATIONALITY: '826', // British code
            HANDCVISA: '1',
            INOUTUK: employedFromOutsideUkValue,
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        await validator.validate();
        await validator.transform();

        expect(validator._validationErrors[1]).to.deep.equal(
          employedFromOutsideUkWarning(
            'INOUTUK not required when worker does not have a Health and Care visa',
            employedFromOutsideUkValue,
          ),
        );
        expect(validator._validationErrors.length).to.equal(2);
        expect(validator._employedFromOutsideUk).to.equal(null);
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

    describe('_validateZeroHourContract', () => {
      it('should emit a warning if contract hours has been entered but there is no answer for zero contract hours', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              CONTHOURS: 27.5,
              ZEROHRCONT: null,
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validateZeroHourContract();
        const validationErrors = validator._validationErrors;

        expect(validator._validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: WorkerCsvValidator.ZERO_HRCONT_WARNING,
            warnType: 'ZERO_HRCONT_WARNING',
            warning: 'You have entered contracted hours but have not said this worker is not on a zero hours contract',
            source: null,
            column: 'ZEROHRCONT',
          },
        ]);
      });

      it('should emit a warning if contract hours has been entered but there is no answer for zero contract hours', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              CONTHOURS: 27.5,
              ZEROHRCONT: 'zero',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validateZeroHourContract();
        const validationErrors = validator._validationErrors;

        expect(validator._validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.ZERO_HRCONT_ERROR,
            errType: 'ZEROHRCONT_ERROR',
            error: 'The code you have entered for ZEROHRCONT is incorrect',
            source: 'zero',
            column: 'ZEROHRCONT',
          },
        ]);
      });

      it('should emit an error if contract hours has been entered but zero contract hours is not know', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              CONTHOURS: 27.5,
              ZEROHRCONT: 999,
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validateZeroHourContract();
        const validationErrors = validator._validationErrors;

        expect(validator._validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.ZERO_HRCONT_ERROR,
            errType: 'ZEROHRCONT_ERROR',
            error:
              'The value entered for CONTHOURS in conjunction with the value for ZEROHRCONT fails our validation checks',
            source: 999,
            column: 'CONTHOURS/ZEROHRCONT',
          },
        ]);
      });

      it('should emit an error if contract hours has been entered but zero contract hours is "Yes"', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              CONTHOURS: 27.5,
              ZEROHRCONT: 1,
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validateZeroHourContract();
        const validationErrors = validator._validationErrors;

        expect(validator._validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.ZERO_HRCONT_ERROR,
            errType: 'ZEROHRCONT_ERROR',
            error:
              'The value entered for CONTHOURS in conjunction with the value for ZEROHRCONT fails our validation checks',
            source: 1,
            column: 'CONTHOURS/ZEROHRCONT',
          },
        ]);
      });

      it('should emit a warning if contract hours has been entered but zero contract hours is "No"', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              CONTHOURS: 0,
              ZEROHRCONT: 2,
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validateZeroHourContract();
        const validationErrors = validator._validationErrors;

        expect(validator._validationErrors.length).to.equal(1);
        expect(validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            warnCode: WorkerCsvValidator.ZERO_HRCONT_WARNING,
            warnType: 'ZERO_HRCONT_WARNING',
            warning: 'You have entered “0” in CONTHOURS but not entered “Yes” to the ZEROHRCONT question',
            source: 2,
            column: 'CONTHOURS/ZEROHRCONT',
          },
        ]);
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
            errCode: WorkerCsvValidator.QUAL_ACH01_CODE_ERROR,
            errType: 'QUAL_ACH01_CODE_ERROR',
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
            warnCode: WorkerCsvValidator.QUAL_ACH01_YEAR_ERROR,
            warnType: 'QUAL_ACH01_YEAR_ERROR',
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
            errCode: WorkerCsvValidator.QUAL_ACH01_YEAR_ERROR,
            errType: 'QUAL_ACH01_YEAR_ERROR',
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
            errCode: WorkerCsvValidator.QUAL_ACH01_YEAR_ERROR,
            errType: 'QUAL_ACH01_YEAR_ERROR',
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
            errCode: WorkerCsvValidator.QUAL_ACH01_YEAR_ERROR,
            errType: 'QUAL_ACH01_YEAR_ERROR',
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
            errCode: WorkerCsvValidator.QUAL_ACH01_YEAR_ERROR,
            errType: 'QUAL_ACH01_YEAR_ERROR',
            error: 'The year in (QUALACH01) is invalid',
            source: '314;5000',
            column: 'QUALACH01',
          },
        ]);
      });

      it('should emit errors if the if the qualification year is in the future and the ID is unknown', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: '800;5000',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        await validator._transformQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(2);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_YEAR_ERROR,
            errType: 'QUAL_ACH01_YEAR_ERROR',
            error: 'The year in (QUALACH01) is invalid',
            source: '800;5000',
            column: 'QUALACH01',
          },
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_CODE_ERROR,
            errType: 'QUAL_ACH01_CODE_ERROR',
            error: 'Qualification (QUALACH01): 800 is unknown',
            source: '800;5000',
            column: 'QUALACH01',
          },
        ]);
      });

      it('should emit errors if the if the qualification year is in the future and the ID is not a number', async () => {
        const validator = new WorkerCsvValidator(
          buildWorkerCsv({
            overrides: {
              QUALACH01: 'qualification;5000',
            },
          }),
          2,
          null,
          mappings,
        );

        await validator._validationQualificationRecords();
        const validationErrors = validator._validationErrors;

        expect(validationErrors.length).to.equal(2);
        expect(validator._validationErrors).to.deep.equal([
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_CODE_ERROR,
            errType: 'QUAL_ACH01_CODE_ERROR',
            error: 'The code you have entered for (QUALACH01) is incorrect',
            source: 'qualification;5000',
            column: 'QUALACH01',
          },
          {
            worker: '3',
            name: 'MARMA',
            lineNumber: 2,
            errCode: WorkerCsvValidator.QUAL_ACH01_YEAR_ERROR,
            errType: 'QUAL_ACH01_YEAR_ERROR',
            error: 'The year in (QUALACH01) is invalid',
            source: 'qualification;5000',
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

    describe('_validateSalaryInt()', () => {
      it(`should set _salaryInt as "Annually" when SalaryInt was given as "1"`, async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '1',
            SALARY: '20000',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._salaryInt).to.equal('Annually');
      });

      it(`should set _salaryInt as "Hourly" when SalaryInt was given as "3"`, async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '3',
            SALARY: '',
            HOURLYRATE: '10.00',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._salaryInt).to.equal('Hourly');
      });

      it(`should set _salaryInt as "Don't know" when SalaryInt was given as "999"`, async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '999',
            SALARY: '',
            HOURLYRATE: '',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._salaryInt).to.equal("Don't know");
      });

      it('should not error when SalaryInt was empty', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '',
            SALARY: '',
            HOURLYRATE: '',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._salaryInt).to.equal(null);
      });

      it('should error when SalaryInt was given with an incorrect code', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '2',
            SALARY: '',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors[0]).to.include({
          lineNumber: 2,
          errCode: WorkerCsvValidator.SALARY_INT_ERROR,
          errType: 'SALARY_INT_ERROR',
          error: 'The code you have entered for SALARYINT is incorrect',
          source: worker.SALARYINT,
          column: 'SALARYINT',
          name: 'MARMA',
          worker: '3',
        });
        expect(validator._salaryInt).to.equal(null);
      });

      it('should error when SalaryInt was given with a non integer value', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: 'apple',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors[0]).to.include({
          lineNumber: 2,
          errCode: WorkerCsvValidator.SALARY_INT_ERROR,
          errType: 'SALARY_INT_ERROR',
          error: 'Salary Int (SALARYINT) must be an integer',
          source: worker.SALARYINT,
          column: 'SALARYINT',
          name: 'MARMA',
          worker: '3',
        });
        expect(validator._salaryInt).to.equal(null);
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

      it(`should give a warning when SalaryInt was "Don't know" and Salary column was filled`, async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '999',
            SALARY: '30000',
            HOURLYRATE: '',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedWarning = {
          lineNumber: 2,
          warnCode: WorkerCsvValidator.SALARY_WARNING,
          warnType: 'SALARY_WARNING',
          warning: `SALARY will be ignored as SALARYINT is 999`,
          source: `SALARYINT (${worker.SALARYINT}) - SALARY (${worker.SALARY})`,
          column: 'SALARY',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.equal([expectedWarning]);
        expect(validator._salaryInt).to.equal("Don't know");
        expect(validator._salary).to.equal(null);
      });

      it('should give an error if SalaryInt was "Hourly" and Salary column was filled', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '3',
            SALARY: '30000',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedError = {
          lineNumber: 2,
          errCode: WorkerCsvValidator.SALARY_INT_NOT_MATCH_SALARY_ERROR,
          errType: 'SALARY_INT_ERROR',
          error: 'The code you have entered for SALARYINT does not match SALARY',
          source: `SALARYINT (${worker.SALARYINT}) - SALARY (${worker.SALARY})`,
          column: 'SALARYINT/SALARY',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.equal([expectedError]);
      });

      it('should not add a duplicated error if already got SALARY_INT_ERROR and Salary column was filled', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '2',
            SALARY: '30000',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedError = {
          lineNumber: 2,
          errCode: WorkerCsvValidator.SALARY_INT_ERROR,
          errType: 'SALARY_INT_ERROR',
          error: 'The code you have entered for SALARYINT is incorrect',
          source: worker.SALARYINT,
          column: 'SALARYINT',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.equal([expectedError]);
      });
    });

    describe('_validateHourlyRate()', () => {
      describe('should set the hourly rate when SalaryInt was "3" and Hourly rate column was given a decimal number', () => {
        const test_cases = ['15.53', '0.53', '3', '3.00'];
        const expected_results = [15.53, 0.53, 3, 3];

        test_cases.forEach((input_hourly_rate, index) => {
          it(`hourly rate = ${input_hourly_rate}`, async () => {
            const worker = buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                SALARYINT: '3',
                SALARY: '',
                HOURLYRATE: input_hourly_rate,
              },
            });

            const validator = new WorkerCsvValidator(worker, 2, null, mappings);

            validator.validate();
            validator.transform();

            const expected_hourly_rate = expected_results[index];

            expect(validator._validationErrors).to.deep.equal([]);
            expect(validator._salaryInt).to.equal('Hourly');
            expect(validator._hourlyRate).to.equal(expected_hourly_rate);
          });
        });
      });

      it('should give an error if SalaryInt was "Annual" and Hourly rate column was filled', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '1',
            SALARY: '',
            HOURLYRATE: '15',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedError = {
          lineNumber: 2,
          errCode: WorkerCsvValidator.SALARY_INT_NOT_MATCH_HOURLY_RATE_ERROR,
          errType: 'SALARY_INT_ERROR',
          error: 'The code you have entered for SALARYINT does not match HOURLYRATE',
          source: `SALARYINT (${worker.SALARYINT}) - HOURLYRATE (${worker.HOURLYRATE})`,
          column: 'SALARYINT/HOURLYRATE',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.equal([expectedError]);
      });

      it('should give an error if SalaryInt was empty and Hourly rate column was filled', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '',
            SALARY: '',
            HOURLYRATE: '15',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedError = {
          lineNumber: 2,
          errCode: WorkerCsvValidator.SALARY_INT_NOT_MATCH_HOURLY_RATE_ERROR,
          errType: 'SALARY_INT_ERROR',
          error: 'The code you have entered for SALARYINT does not match HOURLYRATE',
          source: `SALARYINT (${worker.SALARYINT}) - HOURLYRATE (${worker.HOURLYRATE})`,
          column: 'SALARYINT/HOURLYRATE',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.equal([expectedError]);
      });

      it('should not add a duplicated error if already got SALARY_INT_ERROR and Hourly rate column was filled', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '2',
            SALARY: '',
            HOURLYRATE: '15',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedWarning = {
          lineNumber: 2,
          errCode: WorkerCsvValidator.SALARY_INT_ERROR,
          errType: 'SALARY_INT_ERROR',
          error: 'The code you have entered for SALARYINT is incorrect',
          source: worker.SALARYINT,
          column: 'SALARYINT',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.includes(expectedWarning);
        expect(validator._validationErrors.length).to.equal(1);

        expect(validator._salaryInt).to.equal(null);
        expect(validator._hourlyRate).to.equal(null);
      });

      it('should give an error if Hourly rate column was filled with invalid value', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '3',
            SALARY: '',
            HOURLYRATE: 'a banana',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedWarning = {
          lineNumber: 2,
          errCode: WorkerCsvValidator.HOURLY_RATE_ERROR,
          errType: 'HOURLY_RATE_ERROR',
          error: 'The code you have entered for HOURLYRATE is incorrect',
          source: worker.HOURLYRATE,
          column: 'HOURLYRATE',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.equal([expectedWarning]);
        expect(validator._salaryInt).to.equal('Hourly');
        expect(validator._hourlyRate).to.equal(null);
      });

      it(`should give a warning if SalaryInt was "Don't know" and Hourly rate column was filled`, async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            SALARYINT: '999',
            SALARY: '',
            HOURLYRATE: '15',
          },
        });

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedWarning = {
          lineNumber: 2,
          warnCode: WorkerCsvValidator.HOURLY_RATE_WARNING,
          warnType: 'HOURLY_RATE_WARNING',
          warning: `HOURLYRATE will be ignored as SALARYINT is 999`,
          source: `SALARYINT (${worker.SALARYINT}) - HOURLYRATE (${worker.HOURLYRATE})`,
          column: 'HOURLYRATE',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.equal([expectedWarning]);
        expect(validator._salaryInt).to.equal("Don't know");
        expect(validator._hourlyRate).to.equal(null);
      });
    });

    describe('_validateLevel2CareCert()', () => {
      let clock;
      before(() => {
        // stub current year as 2025 to test behavior related to year in future
        clock = sinon.useFakeTimers(new Date(2025, 1, 1));
      });
      after(() => {
        clock.restore();
      });

      describe('Valid inputs', () => {
        [
          { l2CareCert: '1;', mapping: { value: 'Yes, completed', year: null } },
          { l2CareCert: '1;2024', mapping: { value: 'Yes, completed', year: 2024 } },
          { l2CareCert: '1;2025', mapping: { value: 'Yes, completed', year: 2025 } },
          { l2CareCert: '2;', mapping: { value: 'Yes, started', year: null } },
          { l2CareCert: '3;', mapping: { value: 'No', year: null } },
          { l2CareCert: '1', mapping: { value: 'Yes, completed', year: null } },
          { l2CareCert: '2', mapping: { value: 'Yes, started', year: null } },
          { l2CareCert: '3', mapping: { value: 'No', year: null } },
        ].forEach((answer) => {
          it(`should not add warning when valid (${answer.l2CareCert}) level 2 care certificate value provided`, async () => {
            const worker = buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                L2CARECERT: answer.l2CareCert,
              },
            });
            const validator = new WorkerCsvValidator(worker, 2, null, mappings);

            validator.validate();
            validator.transform();

            expect(validator._validationErrors).to.deep.equal([]);
            expect(validator._validationErrors.length).to.equal(0);
          });

          it(`should set level 2 care certificate value field with database mapping (${JSON.stringify(
            answer.mapping,
          )}) when valid (${answer.l2CareCert}) L2CARECERT provided`, () => {
            const worker = buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                L2CARECERT: answer.l2CareCert,
              },
            });
            const validator = new WorkerCsvValidator(worker, 2, null, mappings);

            validator.validate();
            validator.transform();

            expect(validator._level2CareCert).to.deep.equal(answer.mapping);
          });
        });
      });

      describe('Partially accepted inputs', () => {
        const warningMessages = {
          yearBefore2024: 'The year achieved for L2CARECERT cannot be before 2024. The year value will be ignored',
          yearInFuture: 'The year achieved for L2CARECERT cannot be in the future. The year value will be ignored',
          otherCase: 'The year achieved for L2CARECERT is invalid. The year value will be ignored',
        };
        const warnTypes = {
          yearBefore2024: 'L2CARECERT_WARNING_YEAR_BEFORE_2024',
          yearInFuture: 'L2CARECERT_WARNING_YEAR_IN_FUTURE',
          otherCase: 'L2CARECERT_WARNING_YEAR_INVALID',
        };

        const testCasesWithInvalidYears = [
          {
            l2CareCertInput: '1;2000',
            warningMessage: warningMessages.yearBefore2024,
            warnType: warnTypes.yearBefore2024,
          },
          {
            l2CareCertInput: '1;2023',
            warningMessage: warningMessages.yearBefore2024,
            warnType: warnTypes.yearBefore2024,
          },
          {
            l2CareCertInput: '1;2099',
            warningMessage: warningMessages.yearInFuture,
            warnType: warnTypes.yearInFuture,
          },
          {
            l2CareCertInput: '1;2026',
            warningMessage: warningMessages.yearInFuture,
            warnType: warnTypes.yearInFuture,
          },
          { l2CareCertInput: '1;abc', warningMessage: warningMessages.otherCase, warnType: warnTypes.otherCase },
        ];
        testCasesWithInvalidYears.forEach(({ l2CareCertInput, warningMessage, warnType }) => {
          it(`given a valid value but incorrect year: (${l2CareCertInput}), ignore the year`, () => {
            const expected = { value: 'Yes, completed', year: null };

            const worker = buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                L2CARECERT: l2CareCertInput,
              },
            });

            const validator = new WorkerCsvValidator(worker, 2, null, mappings);

            validator.validate();
            validator.transform();

            expect(validator._level2CareCert).to.deep.equal(expected);
          });

          it('add a warning message about year being invalid', () => {
            const worker = buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                L2CARECERT: l2CareCertInput,
              },
            });

            const expectedParsedValue = { value: 'Yes, completed', year: null };

            const expectedWarning = {
              column: 'L2CARECERT',
              lineNumber: 2,
              name: 'MARMA',
              source: l2CareCertInput,
              warnCode: WorkerCsvValidator[warnType],
              warnType: warnType,
              warning: warningMessage,
              worker: '3',
            };

            const validator = new WorkerCsvValidator(worker, 2, null, mappings);

            validator.validate();
            validator.transform();

            expect(validator._validationErrors).to.deep.equal([expectedWarning]);
            expect(validator._validationErrors.length).to.equal(1);
            expect(validator._level2CareCert).to.deep.equal(expectedParsedValue);
          });
        });
      });

      describe('Invalid inputs', () => {
        const invalidInputs = ['12345', '12345;2024', 'abc', 'abc;2024'];
        invalidInputs.forEach((invalidLevel2CareCertInput) => {
          it(`should add warning when the L2CARECERT value is invalid: (${invalidLevel2CareCertInput})`, async () => {
            const worker = buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                L2CARECERT: invalidLevel2CareCertInput,
              },
            });
            const expectedWarning = {
              column: 'L2CARECERT',
              lineNumber: 2,
              name: 'MARMA',
              source: invalidLevel2CareCertInput,
              warnCode: WorkerCsvValidator.L2CARECERT_WARNING,
              warnType: 'L2CARECERT_WARNING',
              warning: 'The code you have entered for L2CARECERT is incorrect and will be ignored',
              worker: '3',
            };

            const validator = new WorkerCsvValidator(worker, 2, null, mappings);

            validator.validate();
            validator.transform();

            expect(validator._validationErrors).to.deep.equal([expectedWarning]);
            expect(validator._validationErrors.length).to.equal(1);
            expect(validator._level2CareCert).to.equal(null);
          });
        });

        const invalidInputsWithYear = ['2;2024', '3;2024', '2;2000', '3;2000'];

        invalidInputsWithYear.forEach((invalidLevel2CareCertInput) => {
          it(`should add warning and ignore the whole input when option 2 or 3 are given with year achieved: (${invalidLevel2CareCertInput})`, () => {
            const optionChosen = invalidLevel2CareCertInput[0];

            const worker = buildWorkerCsv({
              overrides: {
                STATUS: 'NEW',
                L2CARECERT: invalidLevel2CareCertInput,
              },
            });
            const expectedWarnType = `L2CARECERT_WARNING_IGNORE_YEAR_FOR_OPTION_${optionChosen}`;
            const expectedWarning = {
              column: 'L2CARECERT',
              lineNumber: 2,
              name: 'MARMA',
              source: invalidLevel2CareCertInput,
              warnCode: WorkerCsvValidator[expectedWarnType],
              warnType: expectedWarnType,
              warning: `Option ${optionChosen} for L2CARECERT cannot have year achieved and will be ignored`,
              worker: '3',
            };

            const validator = new WorkerCsvValidator(worker, 2, null, mappings);

            validator.validate();
            validator.transform();

            expect(validator._validationErrors).to.deep.equal([expectedWarning]);
            expect(validator._validationErrors.length).to.equal(1);
            expect(validator._level2CareCert).to.equal(null);
          });
        });
      });
    });

    describe('_validateTransferStaffRecord', () => {
      const worker = buildWorkerCsv({
        overrides: {
          STATUS: 'UPDATE',
        },
      });
      worker.TRANSFERSTAFFRECORD = 'workplace B';

      it('should emit an error when TRANSFERSTAFFRECORD is provided but the worker does not exist', async () => {
        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        const expectedError = {
          lineNumber: 2,
          errCode: WorkerCsvValidator.TRANSFERSTAFFRECORD_ERROR,
          errType: 'TRANSFERSTAFFRECORD_ERROR',
          error: 'Staff record has TRANSFERSTAFFRECORD given but does not exist',
          source: worker.LOCALESTID,
          column: 'LOCALESTID',
          name: 'MARMA',
          worker: '3',
        };

        expect(validator._validationErrors).to.deep.include(expectedError);
        expect(validator._transferStaffRecord).to.equal(null);
      });

      it('should set the _transferStaffRecord field if validation passed', async () => {
        const mockExistingWorker = { nameOrId: 'mock worker name', id: 100, uid: 'mock-uid' };
        const validator = new WorkerCsvValidator(worker, 2, mockExistingWorker, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._transferStaffRecord).to.equal('workplace B');
      });
    });

    describe('_validateStatus', () => {
      it('should give an error if CHGSUB (a deprecated option) is supplied in STATUS column', async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'CHGSUB',
          },
        });
        const expectedWarning = {
          column: 'STATUS',
          lineNumber: 2,
          name: 'MARMA',
          source: 'CHGSUB',
          errCode: WorkerCsvValidator.STATUS_ERROR,
          errType: 'STATUS_ERROR',
          error: 'The STATUS you have supplied is incorrect',
          worker: '3',
        };

        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors).to.deep.equal([expectedWarning]);
        expect(validator._validationErrors.length).to.equal(1);
      });
    });
  });

  it('should remove duplicate error codes', async () => {
    const validator = new WorkerCsvValidator(
      buildWorkerCsv({
        overrides: {
          STATUS: 'NEW',
          QUALACH01: 'qa;2020',
        },
      }),
      2,
      null,
      mappings,
    );

    validator.validate();
    validator.transform();

    const validationErrors = await validator._validationErrors;
    const uniqueValidationErrors = await validator.validationErrors;

    expect(validationErrors.length).to.equal(2);

    expect(uniqueValidationErrors.length).to.equal(1);
    expect(uniqueValidationErrors).to.deep.equal([
      {
        origin: 'Workers',
        worker: '3',
        name: 'MARMA',
        lineNumber: 2,
        errCode: WorkerCsvValidator.QUAL_ACH01_CODE_ERROR,
        errType: 'QUAL_ACH01_CODE_ERROR',
        error: 'The code you have entered for (QUALACH01) is incorrect',
        source: 'qa;2020',
        column: 'QUALACH01',
      },
    ]);
  });

  describe(' _validateCwpCategory()', () => {
    describe('Valid inputs', () => {
      const allowedCwpCategoryValues = [1, 2, 3, 4, 5, 6, 7, 998, 999];

      it(`should not add warning when the CWPCATEGORY value is valid:(${allowedCwpCategoryValues})`, async () => {
        const worker = buildWorkerCsv({
          overrides: {
            STATUS: 'NEW',
            CWPCATEGORY: allowedCwpCategoryValues,
          },
        });
        const validator = new WorkerCsvValidator(worker, 2, null, mappings);

        validator.validate();
        validator.transform();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._validationErrors.length).to.equal(0);
      });
    });

    describe('Invalid inputs', () => {
      const invalidInputs = ['995', '8888', '666'];
      invalidInputs.forEach((invalidCwpCategoryInput) => {
        it(`should add warning when the CWPCATEGORY value is invalid: (${invalidCwpCategoryInput})`, async () => {
          const worker = buildWorkerCsv({
            overrides: {
              STATUS: 'NEW',
              CWPCATEGORY: invalidCwpCategoryInput,
            },
          });
          const expectedWarning = {
            column: 'CWPCATEGORY',
            lineNumber: 2,
            name: 'MARMA',
            source: invalidCwpCategoryInput,
            warnCode: WorkerCsvValidator.CWPCATEGORY_WARNING,
            warnType: 'CWPCATEGORY_WARNING',
            warning: 'The code you have entered for CWPCATEGORY is incorrect and will be ignored',
            worker: '3',
          };

          const validator = new WorkerCsvValidator(worker, 2, null, mappings);

          validator.validate();
          validator.transform();

          expect(validator._validationErrors).to.deep.equal([expectedWarning]);
          expect(validator._validationErrors.length).to.equal(1);
          expect(validator._careWorkForcePathwayCategory).to.equal(null);
        });
      });
    });
  });
});
