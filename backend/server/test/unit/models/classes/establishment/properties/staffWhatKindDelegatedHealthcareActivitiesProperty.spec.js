'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../../models');
const { MockStaffKindDelegatedHealthcareActivities } = require('../../../../mockdata/delegatedHealthcareActivities');

const propertyClass =
  require('../../../../../../models/classes/establishment/properties/staffWhatKindDelegatedHealthcareActivitiesProperty').StaffWhatKindDelegatedHealthcareActivitiesProperty;

const mockActivities = MockStaffKindDelegatedHealthcareActivities;
const [YES, DONT_KNOW, NULL] = ['Yes', "Don't know", null];

const mockActivitiesValues = {
  empty: null,
  dont_know: { carryOutActivities: "Don't know", activities: null },
  yes_without_activities: { carryOutActivities: 'Yes', activities: null },
  yes_with_activities: { carryOutActivities: 'Yes', activities: [mockActivities[0]] },
};

describe('staffKindDelegatedHealthcareActivitiesProperty', () => {
  describe('restoreFromJson()', () => {
    beforeEach(() => {
      sinon.stub(models.delegatedHealthcareActivities, 'findAll').callsFake((queryOption) => {
        const ids = queryOption.where.id;
        return mockActivities.filter((activity) => ids.includes(activity.id));
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    ['Yes', "Don't know", null].forEach((value) => {
      it(`should restore when "carryOutActivities" is ${value} and there are no activities`, async () => {
        const staffKindDHAProperty = new propertyClass();

        const document = {
          staffWhatKindDelegatedHealthcareActivities: {
            carryOutActivities: value,
            activities: [],
          },
        };

        const expectedProperty = {
          carryOutActivities: value,
          activities: null,
        };

        await staffKindDHAProperty.restoreFromJson(document);

        expect(staffKindDHAProperty.property).to.deep.equal(expectedProperty);
      });
    });

    it('should restore the property from a JSON object when carryOutActivities is "YES" and there are activities', async () => {
      const staffKindDHAProperty = new propertyClass();

      const document = {
        staffWhatKindDelegatedHealthcareActivities: {
          carryOutActivities: YES,
          activities: [
            {
              id: 1,
            },
          ],
        },
      };

      const expectedProperty = {
        carryOutActivities: YES,
        activities: [
          {
            description: 'Like monitoring heart rate as part of the treatment of a condition.',
            id: 1,
            seq: 10,
            title: 'Vital signs monitoring',
          },
        ],
      };

      await staffKindDHAProperty.restoreFromJson(document);

      expect(staffKindDHAProperty.property).to.deep.equal(expectedProperty);
    });
  });

  describe('savePropertyToSequelize', () => {
    it('when property is null', () => {
      const staffKindDHAProperty = new propertyClass();
      staffKindDHAProperty.property = null;

      const saved = staffKindDHAProperty.savePropertyToSequelize();
      expect(saved.staffWhatKindDelegatedHealthcareActivities).to.equal(null);
      expect(saved.additionalModels.EstablishmentDHActivities).to.deep.equal([]);
    });

    ['Yes', "Don't know"].forEach((value) => {
      it(`when carryOutActivities is ${value} there are no activities`, async () => {
        const staffKindDHAProperty = new propertyClass();

        staffKindDHAProperty.property = {
          carryOutActivities: value,
          activities: null,
        };

        const saved = staffKindDHAProperty.savePropertyToSequelize();
        expect(saved.staffWhatKindDelegatedHealthcareActivities).to.equal(value);
        expect(saved.additionalModels.EstablishmentDHActivities).to.deep.equal([]);
      });
    });

    it(`when carryOutActivities is "Yes" and there are activities`, async () => {
      const staffKindDHAProperty = new propertyClass();

      staffKindDHAProperty.property = {
        carryOutActivities: YES,
        activities: [mockActivities[0], mockActivities[1]],
      };

      const saved = staffKindDHAProperty.savePropertyToSequelize();
      expect(saved.staffWhatKindDelegatedHealthcareActivities).to.equal('Yes');
      expect(saved.additionalModels.EstablishmentDHActivities).to.deep.equal([
        { delegatedHealthcareActivitiesID: mockActivities[0].id },
        { delegatedHealthcareActivitiesID: mockActivities[1].id },
      ]);
    });
  });

  describe('isEqual()', () => {
    describe('should return true if both values are equal', () => {
      Object.entries(mockActivitiesValues).forEach(([testValueName, value]) => {
        it(`when value is ${testValueName}`, () => {
          const staffKindDHAProperty = new propertyClass();
          const result = staffKindDHAProperty.isEqual(value, value);

          expect(result).to.deep.equal(true);
        });
      });
    });

    describe('should return false if values are not equal', () => {
      Object.entries(mockActivitiesValues).forEach(([currentValueName, currentValue]) => {
        Object.entries(mockActivitiesValues).forEach(([newValueName, newValue]) => {
          if (currentValueName === newValueName) {
            return;
          }

          it(`current: ${currentValueName}, new: ${newValueName}`, () => {
            const staffKindDHAProperty = new propertyClass();
            const result = staffKindDHAProperty.isEqual(currentValue, newValue);

            expect(result).to.deep.equal(false);
          });
        });
      });
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON for the property', () => {
      const staffKindDHAProperty = new propertyClass();
      staffKindDHAProperty.property = mockActivitiesValues.yes_with_activities;

      const json = staffKindDHAProperty.toJSON();

      expect(json).to.deep.equal({
        staffWhatKindDelegatedHealthcareActivities: {
          carryOutActivities: 'Yes',
          activities: mockActivitiesValues.yes_with_activities.activities,
        },
      });
    });

    it('should handle the case when property is null', () => {
      const staffKindDHAProperty = new propertyClass();
      staffKindDHAProperty.property = null;

      const json = staffKindDHAProperty.toJSON();

      expect(json).to.deep.equal({ staffWhatKindDelegatedHealthcareActivities: null });
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    it('should not return anything if undefined', async () => {
      const document = {};
      const staffKindDHAProperty = new propertyClass();

      staffKindDHAProperty.restorePropertyFromSequelize(document);
      expect(staffKindDHAProperty.property).to.deep.equal(null);
    });

    it('should return null if staffWhatKindDelegatedHealthcareActivities is null', async () => {
      const document = { staffWhatKindDelegatedHealthcareActivities: null };
      const staffKindDHAProperty = new propertyClass();

      staffKindDHAProperty.restorePropertyFromSequelize(document);
      expect(staffKindDHAProperty.property).to.deep.equal(null);
    });

    it('should restore in correct format', async () => {
      const document = {
        staffWhatKindDelegatedHealthcareActivities: 'Yes',
        delegatedHealthcareActivities: mockActivitiesValues.yes_with_activities.activities,
      };

      const staffKindDHAProperty = new propertyClass();

      const expectedResult = mockActivitiesValues.yes_with_activities;

      const restoredProperty = staffKindDHAProperty.restorePropertyFromSequelize(document);

      expect(restoredProperty).to.deep.equal(expectedResult);
    });
  });
});
