const expect = require('chai').expect;
const sinon = require('sinon');
const moment = require('moment');

const dbmodels = require('../../../../../backend/server/models');
sinon.stub(dbmodels.status, 'ready').value(false);
const TrainingCsvValidator = require('../../../classes/trainingCSVValidator').TrainingCsvValidator;
const mappings = require('../../../../../backend/reference/BUDIMappings').mappings;
const {
  TrainingCourseDeliveredBy,
  TrainingCourseDeliveryMode,
} = require('../../../../../backend/reference/databaseEnumTypes');

describe.only('trainingCSVValidator', () => {
  describe('Validation', () => {
    let trainingCsv;

    beforeEach(() => {
      trainingCsv = {
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        TRAININGNAME: 'training',
        ACCREDITED: '',
        WHODELIVERED: '',
        PROVIDERNAME: '',
        HOWDELIVERED: '',
        VALIDITY: '',
        DATECOMPLETED: '01/01/2022',
        EXPIRYDATE: '15/04/2022',
        NOTES: '',
      };
    });

    describe('_validateAccredited()', () => {
      it('should pass validation if no ACCREDITED is provided', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateAccredited();

        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should pass validation and set accredited to Yes if ACCREDITED is 1', async () => {
        trainingCsv.ACCREDITED = '1';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateAccredited();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.accredited).to.equal('Yes');
      });

      it('should pass validation and set accredited to No if ACCREDITED is 0', async () => {
        trainingCsv.ACCREDITED = '0';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateAccredited();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.accredited).to.equal('No');
      });

      it("should pass validation and set ACCREDITED to Don't know if ACCREDITED is 999", async () => {
        trainingCsv.ACCREDITED = '999';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateAccredited();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.accredited).to.equal("Don't know");
      });

      it('should add ACCREDITED_ERROR to validationErrors if invalid ACCREDITED is provided', async () => {
        trainingCsv.ACCREDITED = '3';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateAccredited();

        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1060,
            errType: 'ACCREDITED_ERROR',
            error: 'ACCREDITED is invalid',
            lineNumber: 1,
            name: 'foo',
            source: '3',
            column: 'ACCREDITED',
            worker: 'bar',
          },
        ]);
      });
    });

    describe('_validateCategory()', () => {
      it('should add CATEGORY_ERROR to validationErrors if string containing letters is provided for Category', async () => {
        trainingCsv.CATEGORY = 'bob';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateCategory();

        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1050,
            errType: 'CATEGORY_ERROR',
            error: 'CATEGORY has not been supplied',
            lineNumber: 1,
            name: 'foo',
            source: 'bob',
            column: 'CATEGORY',
            worker: 'bar',
          },
        ]);
      });

      it('should add CATEGORY_ERROR to validationErrors if the Category provided is not a valid category number', async () => {
        trainingCsv.CATEGORY = 145;

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateCategory();

        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1050,
            errType: 'CATEGORY_ERROR',
            error: 'CATEGORY has not been supplied',
            lineNumber: 1,
            name: 'foo',
            source: 145,
            column: 'CATEGORY',
            worker: 'bar',
          },
        ]);
      });

      it('should pass validation and set BUDI CATEGORY to ASC CATEGORY if the BUDI CATEGORY is a valid category', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateCategory();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.category).to.equal(8);
      });
    });

    describe('_validateNotes()', () => {
      it('should add NOTES_ERROR to validationErrors and leave notes as null if NOTES is longer than 1000 characters', async () => {
        trainingCsv.NOTES =
          'LLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. N';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateNotes();

        expect(validator.notes).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1070,
            errType: 'NOTES_ERROR',
            error: 'NOTES is longer than 1000 characters',
            source: trainingCsv.NOTES,
            column: 'NOTES',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });

      it('should not add NOTES_ERROR to validationErrors and set notes to csv NOTES if NOTES is shorter than 1000 characters', async () => {
        trainingCsv.NOTES = 'valid short note';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateNotes();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.notes).to.equal('valid short note');
      });

      it('should leave notes as null and not add error if NOTES empty string', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateNotes();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.notes).to.equal(null);
      });
    });

    describe('_getValidateLocaleStIdErrorStatus()', () => {
      it('should add LOCALESTID_ERROR to validationErrors and set localStId as null if localeStId length === 0', async () => {
        trainingCsv.LOCALESTID = '';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateLocaleStId();

        expect(validator.localeStId).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1000,
            errType: 'LOCALESTID_ERROR',
            error: 'LOCALESTID has not been supplied',
            source: trainingCsv.LOCALESTID,
            column: 'LOCALESTID',
            lineNumber: 1,
            name: '',
            worker: 'bar',
          },
        ]);
      });

      it("should add LOCALESTID_ERROR to validationErrors and leave localStId as null if localeStId doesn't exist", async () => {
        trainingCsv.LOCALESTID = null;

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateLocaleStId();

        expect(validator.localeStId).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1000,
            errType: 'LOCALESTID_ERROR',
            error: 'LOCALESTID has not been supplied',
            source: trainingCsv.LOCALESTID,
            column: 'LOCALESTID',
            lineNumber: 1,
            name: null,
            worker: 'bar',
          },
        ]);
      });

      it("should add LOCALESTID_ERROR to validationErrors and leave localStId as null if localeStId's length is greater than MAX_LENGTH", async () => {
        trainingCsv.LOCALESTID = 'Lorem ipsum dolor sit amet, consectetuer adipiscing';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateLocaleStId();

        expect(validator.localeStId).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1000,
            errType: 'LOCALESTID_ERROR',
            error: 'LOCALESTID is longer than 50 characters',
            source: trainingCsv.LOCALESTID,
            column: 'LOCALESTID',
            lineNumber: 1,
            name: 'Lorem ipsum dolor sit amet, consectetuer adipiscing',
            worker: 'bar',
          },
        ]);
      });
    });

    describe('_validateLocaleStId()', async () => {
      it('should pass validation and set uniqueWorkerId if a valid LOCALESTID is provided', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateLocaleStId();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.localeStId).to.equal('foo');
      });
    });

    describe('_validateUniqueWorkerId()', async () => {
      it('should pass validation and set uniqueWorkerId if a valid UNIQUEWORKERID is provided', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateUniqueWorkerId();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.uniqueWorkerId).to.equal('bar');
      });
    });

    describe('_getValidateUniqueWorkerIdErrMessage()', () => {
      it('should add UNIQUE_WORKER_ID_ERROR to validationErrors and set uniqueWorkerId as null if localeStId length === 0', async () => {
        trainingCsv.UNIQUEWORKERID = '';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateUniqueWorkerId();

        expect(validator.uniqueWorkerId).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1010,
            errType: 'UNIQUE_WORKER_ID_ERROR',
            error: 'UNIQUEWORKERID has not been supplied',
            source: trainingCsv.UNIQUEWORKERID,
            column: 'UNIQUEWORKERID',
            lineNumber: 1,
            name: 'foo',
            worker: '',
          },
        ]);
      });

      it("should add UNIQUE_WORKER_ID_ERROR to validationErrors and leave uniqueWorkerId as null if localeStId doesn't exist", async () => {
        trainingCsv.UNIQUEWORKERID = null;

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateUniqueWorkerId();

        expect(validator.uniqueWorkerId).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1010,
            errType: 'UNIQUE_WORKER_ID_ERROR',
            error: 'UNIQUEWORKERID has not been supplied',
            source: trainingCsv.UNIQUEWORKERID,
            column: 'UNIQUEWORKERID',
            lineNumber: 1,
            name: 'foo',
            worker: null,
          },
        ]);
      });

      it("should add UNIQUE_WORKER_ID_ERROR to validationErrors and leave uniqueWorkerId as null if localeStId's length is greater than MAX_LENGTH", async () => {
        trainingCsv.UNIQUEWORKERID = 'Lorem ipsum dolor sit amet, consectetuer adipiscing';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateUniqueWorkerId();

        expect(validator.uniqueWorkerId).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1010,
            errType: 'UNIQUE_WORKER_ID_ERROR',
            error: 'UNIQUEWORKERID is longer than 50 characters',
            source: trainingCsv.UNIQUEWORKERID,
            column: 'UNIQUEWORKERID',
            lineNumber: 1,
            name: 'foo',
            worker: 'Lorem ipsum dolor sit amet, consectetuer adipiscing',
          },
        ]);
      });
    });

    describe('_validateDateCompleted()', async () => {
      it('should pass validation and set dateCompleted to DATECOMPLETED if a valid DATECOMPLETED is provided', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateDateCompleted();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.dateCompleted).to.deep.equal(moment.utc('01/01/2022', 'DD/MM/YYYY', true));
      });

      it('should pass validation and set dateCompleted to an empty string if the DATECOMPLETED is a empty string', async () => {
        trainingCsv.DATECOMPLETED = '';
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateDateCompleted();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.dateCompleted).to.equal('');
      });

      it('should pass validation and set dateCompleted to null if the DATECOMPLETED is null', async () => {
        trainingCsv.DATECOMPLETED = null;
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateDateCompleted();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.dateCompleted).to.equal(null);
      });
    });

    describe('_getValidateDateCompletedErrMessage()', async () => {
      it('should add DATE_COMPLETED_ERROR to validationErrors and set dateCompleted as null if DATECOMPLETED is incorrectly formatted', async () => {
        trainingCsv.DATECOMPLETED = '12323423423';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateDateCompleted();

        expect(validator.dateCompleted).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1020,
            errType: 'DATE_COMPLETED_ERROR',
            error: 'DATECOMPLETED is incorrectly formatted',
            source: trainingCsv.DATECOMPLETED,
            column: 'DATECOMPLETED',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });

      it('should add DATE_COMPLETED_ERROR to validationErrors and set dateCompleted as null if DATECOMPLETED is a date set in the future', async () => {
        trainingCsv.DATECOMPLETED = '01/01/2099';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateDateCompleted();

        expect(validator.dateCompleted).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1020,
            errType: 'DATE_COMPLETED_ERROR',
            error: 'DATECOMPLETED is in the future',
            source: trainingCsv.DATECOMPLETED,
            column: 'DATECOMPLETED',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });
    });

    describe('_validateExpiry()', async () => {
      it('should pass validation and set expiry to EXPIRYDATE if a valid EXPIRYDATE is provided', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateExpiry();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.expiry).to.deep.equal(moment.utc('15/04/2022', 'DD/MM/YYYY', true));
      });

      it('should pass validation and set expiry to an empty string if EXPIRYDATE is an empty string', async () => {
        trainingCsv.EXPIRYDATE = '';
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateExpiry();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.expiry).to.deep.equal('');
      });

      it('should pass validation and set expiry to null if EXPIRYDATE is null', async () => {
        trainingCsv.EXPIRYDATE = null;
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateExpiry();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.expiry).to.deep.equal(null);
      });
    });

    describe('_getValidateExpiryErrMessage()', async () => {
      it('should add EXPIRY_DATE_ERROR to validationErrors and set expiry as null if EXPIRYDATE is incorrectly formatted', async () => {
        trainingCsv.EXPIRYDATE = '12323423423';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateExpiry();

        expect(validator.expiry).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1030,
            errType: 'EXPIRY_DATE_ERROR',
            error: 'EXPIRYDATE is incorrectly formatted',
            source: trainingCsv.EXPIRYDATE,
            column: 'EXPIRYDATE',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });

      it('should add EXPIRY_DATE_ERROR to validationErrors and set expiry as null if EXPIRYDATE is a date set before DATECOMPLETED ', async () => {
        trainingCsv.EXPIRYDATE = '01/01/2000';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateDateCompleted();
        await validator._validateExpiry();

        expect(validator.expiry).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1030,
            errType: 'EXPIRY_DATE_ERROR',
            error: 'EXPIRYDATE must be after DATECOMPLETED',
            source: trainingCsv.EXPIRYDATE,
            column: 'EXPIRYDATE/DATECOMPLETED',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });

      it('should add EXPIRY_DATE_ERROR to validationErrors and set expiry as null if EXPIRYDATE is the same date as DATECOMPLETED ', async () => {
        trainingCsv.EXPIRYDATE = '01/01/2022';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateDateCompleted();
        await validator._validateExpiry();

        expect(validator.expiry).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1030,
            errType: 'EXPIRY_DATE_ERROR',
            error: 'EXPIRYDATE must be after DATECOMPLETED',
            source: trainingCsv.EXPIRYDATE,
            column: 'EXPIRYDATE/DATECOMPLETED',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });
    });

    describe('_validateDescription()', async () => {
      it('should pass validation and set description to TRAININGNAME if a valid TRAININGNAME is provided', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateDescription();

        expect(validator.validationErrors).to.deep.equal([]);
        expect(validator.trainingName).to.equal('training');
      });
    });

    describe('_getValidateDescriptionErrMessage()', async () => {
      it('should add TRAININGNAME_ERROR to validationErrors and set description as null if TRAININGNAME is longer than MAX_LENGTH', async () => {
        trainingCsv.TRAININGNAME =
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis nato';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateDescription();

        expect(validator.trainingName).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1040,
            errType: 'TRAININGNAME_ERROR',
            error: 'TRAININGNAME is longer than 120 characters',
            source: trainingCsv.TRAININGNAME,
            column: 'TRAININGNAME',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });
    });

    describe('_validateWhoDelivered()', () => {
      it('should pass validation if WHODELIVERED is empty', () => {
        trainingCsv.WHODELIVERED = '';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateWhoDelivered();

        expect(validator.validationErrors).to.deep.equal([]);
      });

      const validValues = [
        { WHODELIVERED: '1', expected: TrainingCourseDeliveredBy.InHouseStaff },
        { WHODELIVERED: '2', expected: TrainingCourseDeliveredBy.ExternalProvider },
      ];

      validValues.forEach(({ WHODELIVERED, expected }) => {
        it(`should pass validation and set deliveredBy if a valid WHODELIVERED is provided: ${WHODELIVERED}`, () => {
          trainingCsv.WHODELIVERED = WHODELIVERED;
          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator._validateWhoDelivered();

          expect(validator.deliveredBy).to.equal(expected);
          expect(validator.validationErrors).to.deep.equal([]);
        });
      });

      it('should add WHODELIVERED_ERROR if WHODELIVERED is invalid', () => {
        trainingCsv.WHODELIVERED = 'some invalid value';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateWhoDelivered();

        expect(validator.deliveredBy).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1080,
            errType: 'WHODELIVERED_ERROR',
            error: 'The code you have entered for WHODELIVERED is invalid',
            source: trainingCsv.WHODELIVERED,
            column: 'WHODELIVERED',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });
    });

    describe('_validateProviderName()', () => {
      it('should pass validation if PROVIDERNAME is empty', () => {
        trainingCsv.PROVIDERNAME = '';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateWhoDelivered();
        validator._validateProviderName();

        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should pass validation set  if WHODELIVERED is "2" and PROVIDERNAME is given with a valid number', () => {
        trainingCsv.WHODELIVERED = '2'; // external provider
        trainingCsv.PROVIDERNAME = '1';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateWhoDelivered();
        validator._validateProviderName();

        expect(validator.trainingProviderFk).to.deep.equal(1);
        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should add a PROVIDERNAME_ERROR if PROVIDERNAME is given and WHODELIVERED is not 2', () => {
        trainingCsv.WHODELIVERED = '1'; // in-house staff
        trainingCsv.PROVIDERNAME = 'Care skill academy';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateWhoDelivered();
        validator._validateProviderName();

        expect(validator.externalProviderName).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            warnCode: 2090,
            warnType: 'PROVIDERNAME_WARNING',
            warning: 'PROVIDERNAME will be ignored as WHODELIVERED is not 2 (External provider)',
            source: trainingCsv.PROVIDERNAME,
            column: 'WHODELIVERED/PROVIDERNAME',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });
    });

    describe('_validateHowDelivered()', () => {
      it('should pass validation if HOWDELIVERED is empty', () => {
        trainingCsv.HOWDELIVERED = '';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateHowDelivered();

        expect(validator.howWasItDelivered).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([]);
      });

      const validValues = [
        { HOWDELIVERED: '1', expected: TrainingCourseDeliveryMode.FaceToFace },
        { HOWDELIVERED: '2', expected: TrainingCourseDeliveryMode.ELearning },
      ];

      validValues.forEach(({ HOWDELIVERED, expected }) => {
        it(`should pass validation and set howWasItDelivered if a valid HOWDELIVERED is provided: ${HOWDELIVERED}`, () => {
          trainingCsv.HOWDELIVERED = HOWDELIVERED;
          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator._validateHowDelivered();

          expect(validator.howWasItDelivered).to.equal(expected);
          expect(validator.validationErrors).to.deep.equal([]);
        });
      });

      it('should add a HOWDELIVERED_ERROR if HOWDELIVERED is invalid', () => {
        trainingCsv.HOWDELIVERED = 'some invalid value';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateHowDelivered();

        expect(validator.howWasItDelivered).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1100,
            errType: 'HOWDELIVERED_ERROR',
            error: 'The code you have entered for HOWDELIVERED is invalid',
            source: trainingCsv.HOWDELIVERED,
            column: 'HOWDELIVERED',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });
    });

    describe('_validateValidity()', () => {
      it('should pass validation if VALIDITY is empty', () => {
        trainingCsv.VALIDITY = '';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator.validate();

        expect(validator.doesNotExpire).to.equal(undefined);
        expect(validator.validityPeriodInMonth).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should set doesNotExpire to true if VALIDITY is "none"', () => {
        trainingCsv.DATECOMPLETED = '';
        trainingCsv.EXPIRYDATE = '';
        trainingCsv.VALIDITY = 'none';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator.validate();

        expect(validator.doesNotExpire).to.equal(true);
        expect(validator.validityPeriodInMonth).to.equal(null);
        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should add a warning if VALIDITY is "none" and expiry date is given', () => {
        trainingCsv.VALIDITY = 'none';
        trainingCsv.DATECOMPLETED = '01/04/2024';
        trainingCsv.EXPIRYDATE = '01/04/2026';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator.validate();

        expect(validator.doesNotExpire).to.equal(true);
        expect(validator.validityPeriodInMonth).to.equal(null);
        expect(validator.expiry?.format('YYYY-MM-DD')).to.deep.equal('2026-04-01');
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            warnCode: 2110,
            warnType: 'VALIDITY_WARNING',
            warning: 'The VALIDITY you have entered does not match the EXPIRYDATE',
            source: trainingCsv.VALIDITY,
            column: 'EXPIRYDATE/VALIDITY',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });

      it('should add a VALIDITY_ERROR if VALIDITY is not none and is not a number', () => {
        trainingCsv.VALIDITY = 'some invalid value';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator.validate();

        expect(validator.doesNotExpire).to.equal(undefined);
        expect(validator.validityPeriodInMonth).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1110,
            errType: 'VALIDITY_ERROR',
            error: 'VALIDITY should be either "none" or a number between 1 and 999',
            source: trainingCsv.VALIDITY,
            column: 'VALIDITY',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });

      const invalidNumbers = ['0', '-1', '1000'];

      invalidNumbers.forEach((invalidNumber) => {
        it(`should add a VALIDITY_ERROR, if VALIDITY is out of the range 1-999: ${invalidNumber}`, () => {
          trainingCsv.VALIDITY = invalidNumber;
          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator.validate();

          expect(validator.doesNotExpire).to.equal(undefined);
          expect(validator.validityPeriodInMonth).to.equal(undefined);
          expect(validator.validationErrors).to.deep.equal([
            {
              origin: 'Training',
              errCode: 1110,
              errType: 'VALIDITY_ERROR',
              error: 'VALIDITY should be either "none" or a number between 1 and 999',
              source: trainingCsv.VALIDITY,
              column: 'VALIDITY',
              lineNumber: 1,
              name: 'foo',
              worker: 'bar',
            },
          ]);
        });
      });

      describe('when VALIDITY given as a valid number of month', () => {
        it('should set doesNotExpire to false and validityPeriodInMonth to VALIDITY', () => {
          trainingCsv.VALIDITY = '24';
          trainingCsv.DATECOMPLETED = '';
          trainingCsv.EXPIRYDATE = '';

          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator.validate();

          expect(validator.doesNotExpire).to.equal(false);
          expect(validator.validityPeriodInMonth).to.equal(24);
          expect(validator.validationErrors).to.deep.equal([]);
        });

        it('should set the expiry date if expiry date is empty and completion date is given', () => {
          trainingCsv.VALIDITY = '24';
          trainingCsv.DATECOMPLETED = '21/04/2024';
          trainingCsv.EXPIRYDATE = '';

          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator.validate();

          expect(validator.doesNotExpire).to.equal(false);
          expect(validator.validityPeriodInMonth).to.equal(24);
          expect(validator.dateCompleted?.format('YYYY-MM-DD')).to.deep.equal('2024-04-21');
          expect(validator.expiry?.format('YYYY-MM-DD')).to.deep.equal('2026-04-20');
          expect(validator.validationErrors).to.deep.equal([]);
        });

        it('should add a soft warning but still accept both values, if EXPIRYDATE does not agree with VALIDITY', () => {
          trainingCsv.VALIDITY = '24';
          trainingCsv.DATECOMPLETED = '21/04/2024';
          trainingCsv.EXPIRYDATE = '31/12/2030';

          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator.validate();

          expect(validator.doesNotExpire).to.equal(false);
          expect(validator.validityPeriodInMonth).to.equal(24);
          expect(validator.dateCompleted?.format('YYYY-MM-DD')).to.deep.equal('2024-04-21');
          expect(validator.expiry?.format('YYYY-MM-DD')).to.deep.equal('2030-12-31');

          expect(validator.validationErrors).to.deep.equal([
            {
              origin: 'Training',
              warnCode: 2110,
              warnType: 'VALIDITY_WARNING',
              warning: 'The EXPIRYDATE you have entered does not match the VALIDITY',
              source: trainingCsv.VALIDITY,
              column: 'EXPIRYDATE/VALIDITY',
              lineNumber: 1,
              name: 'foo',
              worker: 'bar',
            },
          ]);
        });

        it('should not add the soft warning if EXPIRYDATE agree with VALIDITY', () => {
          trainingCsv.VALIDITY = '24';
          trainingCsv.DATECOMPLETED = '21/04/2024';
          trainingCsv.EXPIRYDATE = '20/04/2026';

          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator.validate();

          expect(validator.doesNotExpire).to.equal(false);
          expect(validator.validityPeriodInMonth).to.equal(24);
          expect(validator.dateCompleted?.format('YYYY-MM-DD')).to.deep.equal('2024-04-21');
          expect(validator.expiry?.format('YYYY-MM-DD')).to.deep.equal('2026-04-20');
          expect(validator.validationErrors).to.deep.equal([]);
        });
      });
    });
  });

  describe('toJSON', () => {
    it('should return the training record values in a suitable format', () => {
      const trainingCsv = {
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        TRAININGNAME: 'training',
        ACCREDITED: '1',
        WHODELIVERED: '2',
        PROVIDERNAME: 'Care skill academy',
        HOWDELIVERED: '1',
        VALIDITY: '24',
        DATECOMPLETED: '01/01/2022',
        EXPIRYDATE: '15/04/2022',
        NOTES: 'some notes',
      };

      const expectedOutput = {
        localId: 'foo',
        uniqueWorkerId: 'bar',
        lineNumber: 1,
        category: 8,
        completed: '01/01/2022',
        expiry: '15/04/2022',
        trainingName: 'training',
        notes: 'some notes',
        accredited: 'Yes',
        deliveredBy: 'External provider',
        externalProviderName: 'Care skill academy',
        howWasItDelivered: 'Face to face',
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      };

      const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);
      validator.validate();

      const actual = validator.toJSON();

      expect(actual).to.deep.equal(expectedOutput);
    });
  });

  describe('toAPI', () => {
    it('should return the training record values in a suitable format', () => {
      const trainingCsv = {
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        TRAININGNAME: 'training',
        ACCREDITED: '1',
        WHODELIVERED: '2',
        PROVIDERNAME: 'Care skill academy',
        HOWDELIVERED: '1',
        VALIDITY: '24',
        DATECOMPLETED: '01/01/2022',
        EXPIRYDATE: '15/04/2022',
        NOTES: 'some notes',
      };

      const expectedOutput = {
        trainingCategory: {
          id: 8, // because of mapping { ASC: 8, BUDI: 1 },
        },
        completed: '2022-01-01',
        expires: '2022-04-15',
        title: 'training',
        notes: 'some notes',
        accredited: 'Yes',
        deliveredBy: 'External provider',
        externalProviderName: 'Care skill academy',
        howWasItDelivered: 'Face to face',
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      };

      const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);
      validator.validate();

      const actual = validator.toAPI();

      expect(actual).to.deep.equal(expectedOutput);
    });
  });
});
