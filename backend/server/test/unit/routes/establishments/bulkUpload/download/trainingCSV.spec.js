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
  convertProviderName,
} = require('../../../../../../routes/establishments/bulkUpload/download/trainingCSV');
const { apiTrainingBuilder } = require('../../../../../integration/utils/training');

const trainingRecords = [apiTrainingBuilder(), apiTrainingBuilder(), apiTrainingBuilder()];

const inHouseStaff = 'In-house staff';
const externalProvider = 'External provider';
const faceToFace = 'Face to face';
const eLearning = 'E-learning';

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
    const testCases = [
      { deliveredBy: inHouseStaff, expected: '1' },
      { deliveredBy: externalProvider, expected: '2' },
      { deliveredBy: undefined, expected: '' },
      { deliveredBy: null, expected: '' },
      { deliveredBy: 'some other invalid value', expected: '' },
    ];

    testCases.forEach(({ deliveredBy, expected }) => {
      it(`should return "${expected}" when deliveredBy is "${deliveredBy}"`, () => {
        const actual = convertWhoDelivered(deliveredBy);

        expect(actual).to.equal(expected);
      });
    });
  });

  describe('convertProviderName', () => {
    it('should return the external provider name when deliveredBy is "External provider"', () => {
      const expected = 'Care skill academy';
      const actual = convertProviderName(externalProvider, 'Care skill academy');

      expect(actual).to.equal(expected);
    });

    it('should properly escape special chars in provider name', () => {
      const expected = '"""Care Skills Academy"", year 2025"';
      const actual = convertProviderName(externalProvider, '"Care Skills Academy", year 2025');

      expect(actual).to.equal(expected);
    });

    it('should return an empty string when deliveredBy is "In-house staff"', () => {
      const expected = '';
      const actual = convertProviderName(inHouseStaff, 'Care skill academy');

      expect(actual).to.equal(expected);
    });

    it('should return an empty string when deliveredBy is null', () => {
      const expected = '';
      const actual = convertProviderName(null, 'Care skill academy');

      expect(actual).to.equal(expected);
    });
  });

  describe('convertHowDelivered', () => {
    const testCases = [
      { deliveredBy: faceToFace, expected: '1' },
      { deliveredBy: eLearning, expected: '2' },
      { deliveredBy: undefined, expected: '' },
      { deliveredBy: null, expected: '' },
      { deliveredBy: 'some other invalid value', expected: '' },
    ];

    testCases.forEach(({ deliveredBy, expected }) => {
      it(`should return "${expected}" when howWasItDelivered is "${deliveredBy}"`, () => {
        const actual = convertHowDelivered(deliveredBy);

        expect(actual).to.equal(expected);
      });
    });
  });
});
