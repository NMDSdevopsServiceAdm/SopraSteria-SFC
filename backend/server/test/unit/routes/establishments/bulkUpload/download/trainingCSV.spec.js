const expect = require('chai').expect;

const BUDI = require('../../../../../../models/BulkImport/BUDI').BUDI;
const sandbox = require('sinon').createSandbox();
const yesNoDontKnow = require('../../../../mockdata/workers').yesNoDontKnow;
const {
  toCSV,
  convertDateFormatToDayMonthYearWithSlashes,
  convertAccredited,
  convertValidity,
  convertWhoDelivered,
  convertHowDelivered,
} = require('../../../../../../routes/establishments/bulkUpload/download/trainingCSV');
const { apiTrainingBuilder } = require('../../../../../integration/utils/training');

const trainingRecords = [apiTrainingBuilder(), apiTrainingBuilder(), apiTrainingBuilder()];

describe.only('trainingCSV', () => {
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

    describe('Notes edge cases', () => {
      it('should leave notes as is when unusual characters in original string which are not hexadecimal conversions', () => {
        const trainingRecord = apiTrainingBuilder();
        trainingRecord.notes = 'A%b%%c!£$%^&*(';

        const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[7]).to.equal(trainingRecord.notes);
      });

      it('should convert %20s into spaces', () => {
        const trainingRecord = apiTrainingBuilder();
        trainingRecord.notes = 'Fire%20safety%20training';

        const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[7]).to.equal('Fire safety training');
      });

      it('should convert hexadecimal codes of unusual characters into original characters', () => {
        const trainingRecord = apiTrainingBuilder();
        trainingRecord.notes =
          'A%20very%20important%20note%27s%20hard%20to%20find%20-%20this%20saying%20is%20such%20a%20clich%E9';

        const csv = toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord);
        const csvAsArray = csv.split(',');

        expect(csvAsArray[7]).to.equal("A very important note's hard to find - this saying is such a cliché");
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

  describe('convertValidity()', () => {
    it('should return the string "none" if doesNotExpire is true', () => {
      const expected = 'none';
      const actual = convertValidity(true, 24);

      expect(actual).to.equal(expected);
    });

    it('should return validityPeriodInMonth in string, if doesNotExpire is false and validityPeriodInMonth is a valid number', () => {
      const expected = '24';
      const actual = convertValidity(false, 24);

      expect(actual).to.equal(expected);
    });

    const invalidValuesToTest = [null, undefined, 'apple', 0, -10];

    invalidValuesToTest.forEach((value) => {
      it(`should return an empty string "" if doesNotExpire is false and validityPeriodInMonth is not valid: ${value}`, () => {
        const expected = '';
        const actual = convertValidity(false, value);

        expect(actual).to.equal(expected);
      });
    });
  });

  describe('convertWhoDelivered', () => {
    const inHouseStaff = 'In-house staff';
    const externalProvider = 'External provider';

    it('should return "1" when deliveredBy is "In-house staff"', () => {
      const expected = '1';
      const actual = convertWhoDelivered(inHouseStaff, null);

      expect(actual).to.equal(expected);
    });

    it('should return "2" when deliveredBy is "External provider" and the provider name is not known', () => {
      const expected = '2';
      const actual = convertWhoDelivered(externalProvider, null);

      expect(actual).to.equal(expected);
    });

    it('should return "2;(provider name)" when deliveredBy is "External provider" and the provider name is known', () => {
      const expected = '2;Care Skills Academy';
      const actual = convertWhoDelivered(externalProvider, 'Care Skills Academy');

      expect(actual).to.equal(expected);
    });

    it('should properly escape special chars in provider name', () => {
      const expected = '"2;""Care Skills Academy"", year 2025"';
      const actual = convertWhoDelivered(externalProvider, '"Care Skills Academy", year 2025');

      expect(actual).to.equal(expected);
    });

    it('should return an empty string when deliveredBy is other value', () => {
      const expected = '';
      const actual = convertWhoDelivered(null, 'Care Skills Academy');

      expect(actual).to.equal(expected);
    });
  });

  describe('convertHowDelivered', () => {
    const faceToFace = 'Face to face';
    const eLearning = 'E-learning';

    it('should return "1" when howWasItDelivered is "Face to face"', () => {
      const expected = '1';
      const actual = convertHowDelivered(faceToFace);

      expect(actual).to.equal(expected);
    });
    it('should return "2" when howWasItDelivered is "E-learning"', () => {
      const expected = '2';
      const actual = convertHowDelivered(eLearning);

      expect(actual).to.equal(expected);
    });

    const testCaseForOtherValues = [null, undefined, 'test', ''];
    testCaseForOtherValues.forEach((value) => {
      it(`should return an empty string when howWasItDelivered is other value: ${value}`, () => {
        const expected = '';
        const actual = convertHowDelivered(value);

        expect(actual).to.equal(expected);
      });
    });
  });
});
