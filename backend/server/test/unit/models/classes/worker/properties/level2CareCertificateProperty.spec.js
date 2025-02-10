const expect = require('chai').expect;
const level2CareCertificatePropertyClass =
  require('../../../../../../models/classes/worker/properties/level2CareCertificateProperty').WorkerLevel2CareCertificateProperty;

const level2CareCertificateValues = [
  { value: 'Yes, completed', year: null },
  { value: 'Yes, completed', year: 2024 },
  { value: 'Yes, started' },
  { value: 'No' },
];

const level2CareCertificateReturnedValues = [
  { value: 'Yes, completed', year: null },
  { value: 'Yes, completed', year: 2024 },
  { value: 'Yes, started', year: null },
  { value: 'No', year: null },
];

describe('level2CareCertificate Property', () => {
  describe('restoreFromJSON', async () => {
    it("shouldn't return anything if undefined", async () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();
      const document = {};
      await level2CareCertificateProperty.restoreFromJson(document);
      expect(level2CareCertificateProperty.property).to.deep.equal(null);
    });

    await Promise.all(
      level2CareCertificateValues.map(async (level2CareCertificate, index) => {
        it(
          'should return with correct value for ' +
            level2CareCertificate.value +
            ' and year ' +
            level2CareCertificate?.year,
          async () => {
            const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

            const document = {
              level2CareCertificate,
            };
            await level2CareCertificateProperty.restoreFromJson(document);
            expect(level2CareCertificateProperty.property).to.deep.equal(level2CareCertificateReturnedValues[index]);
          },
        );
      }),
    );
  });

  describe('restorePropertyFromSequelize()', async () => {
    it("shouldn't return anything if undefined", async () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();
      const document = {};
      const level2CareCertificate = await level2CareCertificateProperty.restorePropertyFromSequelize(document);
      expect(level2CareCertificate).to.deep.equal({ value: undefined, year: undefined });
    });

    await Promise.all(
      level2CareCertificateValues.map(async (level2CareCertificate, index) => {
        it(
          'should return with correct value for ' +
            level2CareCertificate.value +
            ' and year ' +
            level2CareCertificate?.year,
          async () => {
            const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

            const document = {
              Level2CareCertificateValue: level2CareCertificate.value,
              Level2CareCertificateYear: level2CareCertificate.year ? level2CareCertificate.year : null,
            };
            const level2CareCertificateProps = await level2CareCertificateProperty.restorePropertyFromSequelize(
              document,
            );
            expect(level2CareCertificateProps).to.deep.equal(level2CareCertificateReturnedValues[index]);
          },
        );
      }),
    );
  });

  describe('savePropertyToSequelize', async () => {
    await Promise.all(
      level2CareCertificateValues.map(async (level2CareCertificate, index) => {
        it(
          'should save in correct format as if saving into database for ' +
            level2CareCertificate.value +
            ' and year ' +
            level2CareCertificate?.year,
          async () => {
            const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

            const document = {
              Level2CareCertificateValue: level2CareCertificate.value,
              Level2CareCertificateYear: level2CareCertificate.year ? level2CareCertificate.year : null,
            };
            const level2CareCertificateProps = await level2CareCertificateProperty.restorePropertyFromSequelize(
              document,
            );
            expect(level2CareCertificateProps).to.deep.equal(level2CareCertificateReturnedValues[index]);
          },
        );
      }),
    );
  });

  describe('isEqual()', () => {
    it('should return true if the values are equal and the year is the same', () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

      const equal = level2CareCertificateProperty.isEqual(
        level2CareCertificateValues[1],
        level2CareCertificateReturnedValues[1],
      );
      expect(equal).to.deep.equal(true);
    });

    it('should return true if the values are equal and there is no year', () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

      const equal = level2CareCertificateProperty.isEqual(
        level2CareCertificateValues[0],
        level2CareCertificateReturnedValues[0],
      );
      expect(equal).to.deep.equal(true);
    });

    it(`should return true if the values are the same when ${level2CareCertificateValues[2].value}`, () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

      const equal = level2CareCertificateProperty.isEqual(
        level2CareCertificateValues[2],
        level2CareCertificateReturnedValues[2],
      );
      expect(equal).to.deep.equal(true);
    });

    it(`should return true if the values are the same when ${level2CareCertificateValues[3].value}`, () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

      const equal = level2CareCertificateProperty.isEqual(
        level2CareCertificateValues[3],
        level2CareCertificateReturnedValues[3],
      );
      expect(equal).to.deep.equal(true);
    });

    it(`should return false if the values different (from ${level2CareCertificateValues[0].value} to ${level2CareCertificateReturnedValues[2].value})`, () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

      const equal = level2CareCertificateProperty.isEqual(
        level2CareCertificateValues[0],
        level2CareCertificateReturnedValues[2],
      );
      expect(equal).to.deep.equal(false);
    });

    it(`should return false if the values different (from ${level2CareCertificateValues[0].value} to ${level2CareCertificateReturnedValues[3].value})`, () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

      const equal = level2CareCertificateProperty.isEqual(
        level2CareCertificateValues[0],
        level2CareCertificateReturnedValues[3],
      );
      expect(equal).to.deep.equal(false);
    });

    it('should return false when there is a current year is but the new year sent is null', () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();
      const equal = level2CareCertificateProperty.isEqual(
        level2CareCertificateValues[1],
        level2CareCertificateReturnedValues[0],
      );
      expect(equal).to.deep.equal(false);
    });

    it('should return false when there is no current year is but there is a new year sent', () => {
      const level2CareCertificateProperty = new level2CareCertificatePropertyClass();
      const equal = level2CareCertificateProperty.isEqual(
        level2CareCertificateValues[0],
        level2CareCertificateValues[1],
      );
      expect(equal).to.deep.equal(false);
    });
  });

  describe('toJSON()', () => {
    level2CareCertificateValues.map((level2CCValue, index) => {
      it(
        'should return correctly formatted JSON for ' + level2CCValue.value + ' and year ' + level2CCValue?.year,
        () => {
          const level2CareCertificateProperty = new level2CareCertificatePropertyClass();

          const level2CareCertificate = {
            year: level2CCValue.value,
            value: level2CCValue.year ? level2CCValue.year : null,
          };
          level2CareCertificateProperty.property = level2CareCertificate;
          const json = level2CareCertificateProperty.toJSON();
          expect(json.level2CareCertificate).to.deep.equal(level2CareCertificate);
        },
      );
    });
  });
});
