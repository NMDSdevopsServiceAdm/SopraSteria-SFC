const expect = require('chai').expect;

const BUDI = require('../../../../../../models/BulkImport/BUDI').BUDI;
const sandbox = require('sinon').createSandbox();
const yesNoDontKnow = require('../../../../mockdata/workers').yesNoDontKnow;
const {
  toCSV,
  convertDateFormatToDayMonthYearWithSlashes,
  convertAccredited,
} = require('../../../../../../routes/establishments/bulkUpload/download/trainingCSV');
const { apiTrainingBuilder } = require('../../../../../integration/utils/training');

const trainingRecords = [apiTrainingBuilder(), apiTrainingBuilder(), apiTrainingBuilder()];

describe('trainingCSV', () => {
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

    trainingRecords.forEach((trainingRecord, index) => {
      describe('training record ' + index, () => {
        it('should return basic CSV info in expected order', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[0]).to.equal(establishment.LocalIdentifierValue);
          expect(csvAsArray[1]).to.equal(worker.LocalIdentifierValue);
        });
        it('should return training category', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[2]).to.equal(String(trainingRecord.category.id));
        });
        it('should return training title', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[3]).to.equal(trainingRecord.title);
        });
        it('should not return training title', async () => {
          trainingRecord.title = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[3]).to.equal('');
        });
        it('should return training completed date', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[4]).to.equal(convertDateFormatToDayMonthYearWithSlashes(trainingRecord.completed));
        });
        it('should return training expiry date', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal(convertDateFormatToDayMonthYearWithSlashes(trainingRecord.expires));
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

            const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[6]).to.equal(accredited);
          });
        });
        it('should return training notes', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal(trainingRecord.notes);
        });
        it('should not return training notes', async () => {
          trainingRecord.notes = null;
          const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal('');
        });
      });
    });
  });

  describe('convertDateFormatToDayMonthYearWithSlashes()', () => {
    it('should return a UK date', async () => {
      const date = '2021-05-21';
      const convertedDate = convertDateFormatToDayMonthYearWithSlashes(date);

      expect(convertedDate).to.deep.equal('21/05/2021');
    });
    it('should not return a UK date', async () => {
      const date = '';
      const convertedDate = convertDateFormatToDayMonthYearWithSlashes(date);

      expect(convertedDate).to.deep.equal('');
    });
  });

  describe('convertAccredited()', () => {
    it('should return empty string if not valid value', async () => {
      const result = convertAccredited('Invalid');

      expect(result).to.equal('');
    });

    it('should return 1 if value is Yes', async () => {
      const result = convertAccredited('Yes');

      expect(result).to.equal(1);
    });

    it('should return 0 if value is No', async () => {
      const result = convertAccredited('No');

      expect(result).to.equal(0);
    });

    it("should return 999 if value is Don't know", async () => {
      const result = convertAccredited("Don't know");

      expect(result).to.equal(999);
    });
  });
});
