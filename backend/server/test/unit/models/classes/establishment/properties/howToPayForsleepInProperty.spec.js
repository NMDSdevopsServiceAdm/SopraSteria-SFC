'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const propertyClass =
  require('../../../../../../models/classes/establishment/properties/howToPayForSleepInProperty').HowToPayForSleepInProperty;

describe('HowToPayForSleepInProperty', () => {
  describe('restoreFromJson()', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should leave the property unchanged when document does not have howToPayForSleepIn field', async () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = 'Hourly rate';

      const document = { howToPayForSleepIn: 'Hourly rate' };

      await propertyInstance.restoreFromJson(document);

      expect(propertyInstance.property).to.equal('Hourly rate');
    });

    const validCases = ['Hourly rate', 'Flat rate', 'I do not know'];

    validCases.forEach((value) => {
      it(`should restore the property from a JSON object with a valid value - ${value}`, async () => {
        const propertyInstance = new propertyClass();

        const document = { howToPayForSleepIn: value };

        await propertyInstance.restoreFromJson(document);

        expect(propertyInstance.property).to.equal(value);
        expect(propertyInstance.changed).to.equal(true);
      });
    });

    const invalidCases = ['Yes', 'No', 'some random string', 12.34, 0];
    invalidCases.forEach((invalidValue) => {
      it(`should not restore the property if the value is invalid - ${invalidValue}`, async () => {
        const propertyInstance = new propertyClass();

        const document = { howToPayForSleepIn: invalidValue };

        await propertyInstance.restoreFromJson(document);

        expect(propertyInstance.property).to.equal(null);
        expect(propertyInstance.changed).to.equal(false);
      });
    });
  });

  describe('savePropertyToSequelize', () => {
    it('when property is null', () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = null;

      const saved = propertyInstance.savePropertyToSequelize();
      expect(saved.howToPayForSleepIn).to.equal(null);
    });

    it('when the property is a valid value', async () => {
      const propertyInstance = new propertyClass();

      propertyInstance.property = 'Flat rate';

      const saved = propertyInstance.savePropertyToSequelize();
      expect(saved.howToPayForSleepIn).to.equal('Flat rate');
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON for the property', () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = 'Flat rate';

      const json = propertyInstance.toJSON();

      expect(json).to.deep.equal({
        howToPayForSleepIn: 'Flat rate',
      });
    });

    it('should handle the case when property is null', () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = null;

      const json = propertyInstance.toJSON();

      expect(json).to.deep.equal({ howToPayForSleepIn: null });
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    it('should not return anything if undefined', async () => {
      const document = {};
      const propertyInstance = new propertyClass();

      const restored = propertyInstance.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(null);
    });

    it('should set the property from database value has a value', async () => {
      const document = { howToPayForSleepIn: 'Flat rate' };
      const propertyInstance = new propertyClass();

      const restored = propertyInstance.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal('Flat rate');
    });
  });
});
