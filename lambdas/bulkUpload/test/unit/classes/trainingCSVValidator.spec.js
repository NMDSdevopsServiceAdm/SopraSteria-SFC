const expect = require('chai').expect;
const sinon = require('sinon');

const dbmodels = require('../../../../../server/models');
sinon.stub(dbmodels.status, 'ready').value(false);
const TrainingCsvValidator = require('../../../classes/trainingCSVValidator').TrainingCsvValidator;
const mappings = require('../../../../../reference/BUDIMappings').mappings;

describe('trainingCSVValidator', () => {
  describe('Validation', () => {
    let trainingCsv;

    beforeEach(() => {
      trainingCsv = {
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        DESCRIPTION: 'training',
        DATECOMPLETED: '',
        EXPIRYDATE: '',
        ACCREDITED: '',
        NOTES: '',
      };
    });

    describe('_validateAccredited()', () => {
      it('should pass validation if no ACCREDITED is provided', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateAccredited();

        expect(validator._validationErrors).to.deep.equal([]);
      });

      it('should pass validation and set accredited to Yes if ACCREDITED is 1', async () => {
        trainingCsv.ACCREDITED = '1';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateAccredited();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._accredited).to.equal('Yes');
      });

      it('should pass validation and set accredited to No if ACCREDITED is 0', async () => {
        trainingCsv.ACCREDITED = '0';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateAccredited();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._accredited).to.equal('No');
      });

      it("should pass validation and set ACCREDITED to Don't know if ACCREDITED is 999", async () => {
        trainingCsv.ACCREDITED = '999';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateAccredited();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._accredited).to.equal("Don't know");
      });

      it('should add ACCREDITED_ERROR to validationErrors if invalid ACCREDITED is provided', async () => {
        trainingCsv.ACCREDITED = '3';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateAccredited();

        expect(validator._validationErrors).to.deep.equal([
          {
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

        expect(validator._validationErrors).to.deep.equal([
          {
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
        trainingCsv.CATEGORY = 41;

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateCategory();

        expect(validator._validationErrors).to.deep.equal([
          {
            errCode: 1050,
            errType: 'CATEGORY_ERROR',
            error: 'CATEGORY has not been supplied',
            lineNumber: 1,
            name: 'foo',
            source: 41,
            column: 'CATEGORY',
            worker: 'bar',
          },
        ]);
      });

      it('should pass validation and set BUDI CATEGORY to ASC CATEGORY if the BUDI CATEGORY is a valid category', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateCategory();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._category).to.equal(8);
      });
    });

    describe('_validateNotes()', () => {
      it('should add NOTES_ERROR to validationErrors and leave notes as null if NOTES is longer than 1000 characters', async () => {
        trainingCsv.NOTES =
          'LLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. N';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator._validateNotes();

        expect(validator._notes).to.equal(null);
        expect(validator._validationErrors).to.deep.equal([
          {
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

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._notes).to.equal('valid short note');
      });

      it('should leave notes as null and not add error if NOTES empty string', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator._validateNotes();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator._notes).to.equal(null);
      });
    });
  });
});
