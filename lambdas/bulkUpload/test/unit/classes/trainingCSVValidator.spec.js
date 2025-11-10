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

describe('trainingCSVValidator', () => {
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
        it('should pass validation and set deliveredBy if a valid WHODELIVERED is provided', () => {
          trainingCsv.WHODELIVERED = WHODELIVERED;
          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator._validateWhoDelivered();

          expect(validator.deliveredBy).to.equal(expected);
          expect(validator.validationErrors).to.deep.equal([]);
        });
      });

      it('should add WHODELIVERED_WARNING if WHODELIVERED is invalid', () => {
        trainingCsv.WHODELIVERED = 'some invalid value';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateWhoDelivered();

        expect(validator.deliveredBy).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            warnCode: 2070,
            warnType: 'WHODELIVERED_WARNING',
            warning: 'WHODELIVERED is invalid and will be ignored',
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

      it('should pass validation set externalProviderName if WHODELIVERED is "2" and PROVIDERNAME is given', () => {
        trainingCsv.WHODELIVERED = '2'; // external provider
        trainingCsv.PROVIDERNAME = 'Care skill academy';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateWhoDelivered();
        validator._validateProviderName();

        expect(validator.externalProviderName).to.deep.equal('Care skill academy');
        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should add a PROVIDERNAME_WARNING if PROVIDERNAME is given and WHODELIVERED is not 2', () => {
        trainingCsv.WHODELIVERED = '1'; // in-house staff
        trainingCsv.PROVIDERNAME = 'Care skill academy';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateWhoDelivered();
        validator._validateProviderName();

        expect(validator.externalProviderName).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            warnCode: 2080,
            warnType: 'PROVIDERNAME_WARNING',
            warning: 'PROVIDERNAME will be ignored as WHODELIVERED is not 2 (External provider)',
            source: trainingCsv.PROVIDERNAME,
            column: 'PROVIDERNAME',
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
        it('should pass validation and set howWasItDelivered if a valid HOWDELIVERED is provided', () => {
          trainingCsv.HOWDELIVERED = HOWDELIVERED;
          const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

          validator._validateHowDelivered();

          expect(validator.howWasItDelivered).to.equal(expected);
          expect(validator.validationErrors).to.deep.equal([]);
        });
      });

      it('should add a HOWDELIVERED_WARNING if HOWDELIVERED is invalid', () => {
        trainingCsv.HOWDELIVERED = 'some invalid value';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateHowDelivered();

        expect(validator.howWasItDelivered).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            warnCode: 2090,
            warnType: 'HOWDELIVERED_WARNING',
            warning: 'HOWDELIVERED is invalid and will be ignored',
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

        validator._validateValidity();

        expect(validator.doesNotExpire).to.equal(undefined);
        expect(validator.validityPeriodInMonth).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should set doesNotExpire to true if VALIDITY is none', () => {
        trainingCsv.VALIDITY = 'none';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateValidity();

        expect(validator.doesNotExpire).to.equal(true);
        expect(validator.validityPeriodInMonth).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should set doesNotExpire to false and validityPeriodInMonth to VALIDITY, if VALIDITY is a valid number', () => {
        trainingCsv.VALIDITY = '24';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateValidity();

        expect(validator.doesNotExpire).to.equal(false);
        expect(validator.validityPeriodInMonth).to.equal(24);
        expect(validator.validationErrors).to.deep.equal([]);
      });

      it('should add a VALIDITY_WARNING, if VALIDITY is not a number', () => {
        trainingCsv.VALIDITY = 'some invalid value';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateValidity();

        expect(validator.doesNotExpire).to.equal(undefined);
        expect(validator.validityPeriodInMonth).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            warnCode: 2100,
            warnType: 'VALIDITY_WARNING',
            warning: 'VALIDITY is invalid and will be ignored',
            source: trainingCsv.VALIDITY,
            column: 'VALIDITY',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });

      const invalidNumbers = ['0', '-1', '1000'];

      it('should add a VALIDITY_WARNING, if VALIDITY is an invalid number', () => {
        trainingCsv.VALIDITY = 'some invalid value';
        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        validator._validateValidity();

        expect(validator.doesNotExpire).to.equal(undefined);
        expect(validator.validityPeriodInMonth).to.equal(undefined);
        expect(validator.validationErrors).to.deep.equal([
          {
            origin: 'Training',
            warnCode: 2100,
            warnType: 'VALIDITY_WARNING',
            warning: 'VALIDITY is invalid and will be ignored',
            source: trainingCsv.VALIDITY,
            column: 'VALIDITY',
            lineNumber: 1,
            name: 'foo',
            worker: 'bar',
          },
        ]);
      });
    });
  });
});
