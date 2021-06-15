const expect = require('chai').expect;
const sinon = require('sinon');
const dbmodels = require('../../../../../models/');
sinon.stub(dbmodels.status, 'ready').value(false);
const TrainingCsvValidator = require('../../../../../models/BulkImport/csv/training').Training;
const convertIso8601ToUkDate = require('../../../../../models/BulkImport/csv/training').convertIso8601ToUkDate;
const { apiTrainingBuilder } = require('../../../../integration/utils/training');
const sandbox = require('sinon').createSandbox();
const BUDI = require('../../../../../models/BulkImport/BUDI').BUDI;
const yesNoDontKnow = require('../../../mockdata/workers').yesNoDontKnow;

describe('/server/models/Bulkimport/csv/training.js', () => {
  describe('validations', () => {
    it('should pass validation if no ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator({
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        DESCRIPTION: 'training',
        DATECOMPLETED: '',
        EXPIRYDATE: '',
        ACCREDITED: '',
        NOTES: '',
      });

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
      expect(validator._validationErrors).to.deep.equal([]);
      expect(validator._validationErrors.length).to.equal(0);
    });

    it('should pass validation if ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator({
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        DESCRIPTION: 'training',
        DATECOMPLETED: '',
        EXPIRYDATE: '',
        ACCREDITED: '1',
        NOTES: '',
      });

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
      expect(validator._validationErrors).to.deep.equal([]);
      expect(validator._validationErrors.length).to.equal(0);
      expect(validator.accredited).to.equal('Yes');
    });

    it('should fail validation if invalid ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator(
        {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'bar',
          CATEGORY: 1,
          DESCRIPTION: 'training',
          DATECOMPLETED: '',
          EXPIRYDATE: '',
          ACCREDITED: '3',
          NOTES: '',
        },
        1,
      );

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
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
      expect(validator._validationErrors.length).to.equal(1);
    });
  });
  describe('toCSV()', () => {
    beforeEach(() => {
      sandbox.stub(BUDI, 'trainingCategory').callsFake((method, value) => value);
    });
    afterEach(() => {
      sandbox.restore();
    });
    const establishment = {
      id: 123,
      LocalIdentifierValue: 'Test McTestface Org',
    };
    const worker = {
      id: 123,
      LocalIdentifierValue: 'Test McTestface Worker',
    };
    const trainingRecords = [apiTrainingBuilder(), apiTrainingBuilder(), apiTrainingBuilder()];

    trainingRecords.forEach((trainingRecord, index) => {
      describe('training record ' + index, () => {
        it('should return basic CSV info in expected order', async () => {
          const csv = TrainingCsvValidator.toCSV(
            establishment.LocalIdentifierValue,
            worker.LocalIdentifierValue,
            trainingRecord,
          );
          const csvAsArray = csv.split(',');

          expect(csvAsArray[0]).to.equal(establishment.LocalIdentifierValue);
          expect(csvAsArray[1]).to.equal(worker.LocalIdentifierValue);
        });
        it('should return training category', async () => {
          const csv = TrainingCsvValidator.toCSV(
            establishment.LocalIdentifierValue,
            worker.LocalIdentifierValue,
            trainingRecord,
          );
          const csvAsArray = csv.split(',');

          expect(csvAsArray[2]).to.equal(String(trainingRecord.category.id));
        });
        it('should return training title', async () => {
          const csv = TrainingCsvValidator.toCSV(
            establishment.LocalIdentifierValue,
            worker.LocalIdentifierValue,
            trainingRecord,
          );
          const csvAsArray = csv.split(',');

          expect(csvAsArray[3]).to.equal(trainingRecord.title);
        });
        it('should not return training title', async () => {
          trainingRecord.title = null;

          const csv = TrainingCsvValidator.toCSV(
            establishment.LocalIdentifierValue,
            worker.LocalIdentifierValue,
            trainingRecord,
          );
          const csvAsArray = csv.split(',');

          expect(csvAsArray[3]).to.equal('');
        });
        it('should return training completed date', async () => {
          const csv = TrainingCsvValidator.toCSV(
            establishment.LocalIdentifierValue,
            worker.LocalIdentifierValue,
            trainingRecord,
          );
          const csvAsArray = csv.split(',');

          expect(csvAsArray[4]).to.equal(convertIso8601ToUkDate(trainingRecord.completed));
        });
        it('should return training expiry date', async () => {
          const csv = TrainingCsvValidator.toCSV(
            establishment.LocalIdentifierValue,
            worker.LocalIdentifierValue,
            trainingRecord,
          );
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal(convertIso8601ToUkDate(trainingRecord.expires));
        });
        yesNoDontKnow.forEach((value) => {
          it('should return accredited value for ' + value.value, async () => {
            trainingRecord.accredited = value.value;

            let accredited = '';
            switch (trainingRecord.accredited) {
              case 'Yes':
                accredited = '1';
                break;

              case 'No':
                accredited = '0';
                break;

              case "Don't know":
                accredited = '999';
                break;
            }

            const csv = TrainingCsvValidator.toCSV(
              establishment.LocalIdentifierValue,
              worker.LocalIdentifierValue,
              trainingRecord,
            );
            const csvAsArray = csv.split(',');

            expect(csvAsArray[6]).to.equal(accredited);
          });
        });
        it('should return training notes', async () => {
          const csv = TrainingCsvValidator.toCSV(
            establishment.LocalIdentifierValue,
            worker.LocalIdentifierValue,
            trainingRecord,
          );
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal(trainingRecord.notes);
        });
        it('should not return training notes', async () => {
          trainingRecord.notes = null;
          const csv = TrainingCsvValidator.toCSV(
            establishment.LocalIdentifierValue,
            worker.LocalIdentifierValue,
            trainingRecord,
          );
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal('');
        });
      });
    });
  });
});

describe('convertIso8601ToUkDate()', () => {
  it('should return a UK date', async () => {
    const date = '2021-05-21';
    const convertedDate = convertIso8601ToUkDate(date);

    expect(convertedDate).to.deep.equal('21/05/2021');
  });
  it('should not return a UK date', async () => {
    const date = '';
    const convertedDate = convertIso8601ToUkDate(date);

    expect(convertedDate).to.deep.equal('');
  });
});
