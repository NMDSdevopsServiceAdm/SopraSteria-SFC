const expect = require('chai').expect;
const sinon = require('sinon');

const propertyClass =
  require('../../../../../../models/classes/worker/properties/carryOutDelegatedHealthcareActivitiesProperty').CarryOutDelegatedHealthcareActivitiesProperty;

const acceptedValues = ['Yes', 'No', "Don't know", null];

describe('carryOutDelegatedHealthcareActivitiesProperty', () => {
  describe('restoreFromJSON', () => {
    acceptedValues.forEach((value) => {
      it(`should set the property when accepted value is given - ${value} `, async () => {
        const carryOutDelegatedHealthcareActivitiesProperty = new propertyClass();
        const document = {
          carryOutDelegatedHealthcareActivities: value,
        };

        await carryOutDelegatedHealthcareActivitiesProperty.restoreFromJson(document);
        expect(carryOutDelegatedHealthcareActivitiesProperty.property).to.equal(value);
      });
    });

    it('should leave the property unchanged when document does not have staffDoDelegatedHealthcareActivities field', async () => {
      const carryOutDelegatedHealthcareActivitiesProperty = new propertyClass();
      const document = {};

      await carryOutDelegatedHealthcareActivitiesProperty.restoreFromJson(document);
      expect(carryOutDelegatedHealthcareActivitiesProperty.property).to.equal(null);
      expect(carryOutDelegatedHealthcareActivitiesProperty._changed).to.equal(false);
    });
  });

  describe('restorePropertyFromSequelize', () => {
    acceptedValues.forEach((value) => {
      it(`should return value if valid - ${value}`, () => {
        const carryOutDelegatedHealthcareActivitiesProperty = new propertyClass();
        const document = {
          carryOutDelegatedHealthcareActivities: value,
        };

        const returned = carryOutDelegatedHealthcareActivitiesProperty.restorePropertyFromSequelize(document);

        expect(returned).to.equal(value);
      });
    });

    it("shouldn't return anything if undefined", async () => {
      const carryOutDelegatedHealthcareActivitiesProperty = new propertyClass();
      const document = {};

      const returned = carryOutDelegatedHealthcareActivitiesProperty.restorePropertyFromSequelize(document);

      expect(returned).to.equal(undefined);
    });
  });

  describe('savePropertyToSequelize', async () => {
    acceptedValues.forEach((value) => {
      it(`should return object with StaffDoDelegatedHealthcareActivitiesValue set to property - ${value}`, () => {
        const carryOutDelegatedHealthcareActivitiesProperty = new propertyClass();

        carryOutDelegatedHealthcareActivitiesProperty.property = value;

        const saved = carryOutDelegatedHealthcareActivitiesProperty.savePropertyToSequelize();
        expect(saved.CarryOutDelegatedHealthcareActivitiesValue).to.equal(value);
      });
    });
  });

  describe('toJSON', async () => {
    acceptedValues.forEach((value) => {
      it(`should return correctly formatted JSON for the property - ${value}`, () => {
        const carryOutDelegatedHealthcareActivitiesProperty = new propertyClass();
        carryOutDelegatedHealthcareActivitiesProperty.property = value;

        const json = carryOutDelegatedHealthcareActivitiesProperty.toJSON();

        expect(json).to.deep.equal({
          carryOutDelegatedHealthcareActivities: value,
        });
      });
    });
  });
});
