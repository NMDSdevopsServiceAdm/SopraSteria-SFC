const expect = require('chai').expect;

const propertyClass =
  require('../../../../../../models/classes/establishment/properties/staffDoDelegatedHealthcareActivitiesProperty').StaffDoDelegatedHealthcareActivitiesProperty;
const acceptedValues = ['Yes', 'No', "Don't know", null];

describe('staffDoDelegatedHealthcareActivitiesProperty', () => {
  describe('restoreFromJson()', async () => {
    acceptedValues.forEach(async (value) => {
      it(`should set property when accepted value - ${value}`, async () => {
        const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();
        const document = {
          staffDoDelegatedHealthcareActivities: value,
        };

        await staffDoDelegatedHealthcareActivitiesProperty.restoreFromJson(document);
        expect(staffDoDelegatedHealthcareActivitiesProperty.property).to.equal(value);
      });
    });

    it('should leave the property unchanged when document does not have staffDoDelegatedHealthcareActivities field', async () => {
      const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();

      const document = {};

      await staffDoDelegatedHealthcareActivitiesProperty.restoreFromJson(document);

      expect(staffDoDelegatedHealthcareActivitiesProperty.property).to.equal(null);
    });
  });

  describe('restorePropertyFromSequelize()', async () => {
    acceptedValues.forEach((value) => {
      it(`should return value if valid - ${value}`, () => {
        const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();
        const document = {
          staffDoDelegatedHealthcareActivities: value,
        };

        const returned = staffDoDelegatedHealthcareActivitiesProperty.restorePropertyFromSequelize(document);

        expect(returned).to.equal(value);
      });
    });

    it("shouldn't return anything if undefined", async () => {
      const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();
      const document = {};

      const returned = staffDoDelegatedHealthcareActivitiesProperty.restorePropertyFromSequelize(document);

      expect(returned).to.equal(undefined);
    });
  });

  describe('savePropertyToSequelize()', async () => {
    acceptedValues.forEach((value) => {
      it(`should return object with StaffDoDelegatedHealthcareActivitiesValue set to property - ${value}`, () => {
        const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();

        staffDoDelegatedHealthcareActivitiesProperty.property = value;

        const saved = staffDoDelegatedHealthcareActivitiesProperty.savePropertyToSequelize();
        expect(saved.StaffDoDelegatedHealthcareActivitiesValue).to.equal(value);
      });
    });
  });

  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();

      const equal = staffDoDelegatedHealthcareActivitiesProperty.isEqual('Yes', 'Yes');
      expect(equal).to.equal(true);
    });

    it('should return false if values are answers and not equal', () => {
      const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();

      const equal = staffDoDelegatedHealthcareActivitiesProperty.isEqual('Yes', 'No');
      expect(equal).to.equal(false);
    });

    it('should return false if one value is null and other is answer', () => {
      const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();

      const equal = staffDoDelegatedHealthcareActivitiesProperty.isEqual(null, 'No');
      expect(equal).to.equal(false);
    });

    it('should return false if the values are both null', () => {
      const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();

      const equal = staffDoDelegatedHealthcareActivitiesProperty.isEqual(null, null);
      expect(equal).to.equal(false);
    });
  });

  describe('toJSON()', () => {
    acceptedValues.forEach((value) => {
      it('should return correctly formatted JSON for the property', () => {
        const staffDoDelegatedHealthcareActivitiesProperty = new propertyClass();
        staffDoDelegatedHealthcareActivitiesProperty.property = value;

        const json = staffDoDelegatedHealthcareActivitiesProperty.toJSON();

        expect(json).to.deep.equal({
          staffDoDelegatedHealthcareActivities: value,
        });
      });
    });
  });
});
