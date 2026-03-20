'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const propertyClass =
  require('../../../../../../models/classes/establishment/properties/staffOptOutOfWorkplacePensionProperty').StaffOptOutOfWorkplacePensionProperty;

describe('StaffOptOutOfWorkplacePensionProperty', () => {
  describe('restoreFromJson()', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should leave the property unchanged when document does not have staffOptOutOfWorkplacePension field', async () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = 'Yes';

      const document = {};

      await propertyInstance.restoreFromJson(document);

      expect(propertyInstance.property).to.equal('Yes');
    });

    const validCases = ['Yes', 'No', "Don't know"];

    validCases.forEach((value) => {
      it(`should restore the property from a JSON object with a valid value - ${value}`, async () => {
        const propertyInstance = new propertyClass();

        const document = { staffOptOutOfWorkplacePension: value };

        await propertyInstance.restoreFromJson(document);

        expect(propertyInstance.property).to.equal(value);
        expect(propertyInstance.changed).to.equal(true);
      });
    });

    const invalidCases = ['some random string', 12.34, 0];
    invalidCases.forEach((invalidValue) => {
      it(`should not restore the property if the value is invalid - ${invalidValue}`, async () => {
        const propertyInstance = new propertyClass();

        const document = { staffOptOutOfWorkplacePension: invalidValue };

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
      expect(saved.staffOptOutOfWorkplacePension).to.equal(null);
    });

    it('when the property is a valid value', async () => {
      const propertyInstance = new propertyClass();

      propertyInstance.property = 'Yes';

      const saved = propertyInstance.savePropertyToSequelize();
      expect(saved.staffOptOutOfWorkplacePension).to.equal('Yes');
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON for the property', () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = 'Yes';

      const json = propertyInstance.toJSON();

      expect(json).to.deep.equal({
        staffOptOutOfWorkplacePension: 'Yes',
      });
    });

    it('should handle the case when property is null', () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = null;

      const json = propertyInstance.toJSON();

      expect(json).to.deep.equal({ staffOptOutOfWorkplacePension: null });
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
      const document = { staffOptOutOfWorkplacePension: 'Yes' };
      const propertyInstance = new propertyClass();

      const restored = propertyInstance.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal('Yes');
    });
  });
});
