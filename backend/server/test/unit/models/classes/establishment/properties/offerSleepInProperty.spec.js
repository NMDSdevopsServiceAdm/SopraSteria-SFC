const expect = require('chai').expect;

const propertyClass =
  require('../../../../../../models/classes/establishment/properties/offerSleepInProperty').OfferSleepInProperty;
const acceptedValues = ['Yes', 'No', "Don't know", null];

describe('offerSleepInProperty', () => {
  describe('restoreFromJson()', async () => {
    acceptedValues.forEach(async (value) => {
      it(`should set property when accepted value - ${value}`, async () => {
        const offerSleepInProperty = new propertyClass();
        const document = {
          offerSleepIn: value,
        };

        await offerSleepInProperty.restoreFromJson(document);
        expect(offerSleepInProperty.property).to.equal(value);
      });
    });

    it('should leave the property unchanged when document does not have offerSleepInProperty field', async () => {
      const offerSleepInProperty = new propertyClass();

      const document = {};

      await offerSleepInProperty.restoreFromJson(document);

      expect(offerSleepInProperty.property).to.equal(null);
    });
  });

  describe('restorePropertyFromSequelize()', async () => {
    acceptedValues.forEach((value) => {
      it(`should return value if valid - ${value}`, () => {
        const offerSleepInProperty = new propertyClass();
        const document = {
          offerSleepIn: value,
        };

        const returned = offerSleepInProperty.restorePropertyFromSequelize(document);

        expect(returned).to.equal(value);
      });
    });

    it("shouldn't return anything if undefined", async () => {
      const offerSleepInProperty = new propertyClass();
      const document = {};

      const returned = offerSleepInProperty.restorePropertyFromSequelize(document);

      expect(returned).to.equal(undefined);
    });
  });

  describe('savePropertyToSequelize()', async () => {
    acceptedValues.forEach((value) => {
      it(`should return object with OfferSleepInValue set to property - ${value}`, () => {
        const offerSleepInProperty = new propertyClass();

        offerSleepInProperty.property = value;

        const saved = offerSleepInProperty.savePropertyToSequelize();
        expect(saved.OfferSleepInValue).to.equal(value);
      });
    });
  });

  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const offerSleepInProperty = new propertyClass();

      const equal = offerSleepInProperty.isEqual('Yes', 'Yes');
      expect(equal).to.equal(true);
    });

    it('should return false if values are answers and not equal', () => {
      const offerSleepInProperty = new propertyClass();

      const equal = offerSleepInProperty.isEqual('Yes', 'No');
      expect(equal).to.equal(false);
    });

    it('should return false if one value is null and other is answer', () => {
      const offerSleepInProperty = new propertyClass();

      const equal = offerSleepInProperty.isEqual(null, 'No');
      expect(equal).to.equal(false);
    });

    it('should return false if the values are both null', () => {
      const offerSleepInProperty = new propertyClass();

      const equal = offerSleepInProperty.isEqual(null, null);
      expect(equal).to.equal(false);
    });
  });

  describe('toJSON()', () => {
    acceptedValues.forEach((value) => {
      it('should return correctly formatted JSON for the property', () => {
        const offerSleepInProperty = new propertyClass();
        offerSleepInProperty.property = value;

        const json = offerSleepInProperty.toJSON();

        expect(json).to.deep.equal({
          offerSleepIn: value,
        });
      });
    });
  });
});
