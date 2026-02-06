'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../../models');

const propertyClass =
  require('../../../../../../models/classes/establishment/properties/travelTimePayProperty').TravelTimePayProperty;

const mocktravelTimePayOptions = [
  {
    id: 1,
    label: 'The same rate for travel time as for visits',
    includeRate: false,
  },
  {
    id: 2,
    label: 'Minimum wage',
    includeRate: false,
  },
  {
    id: 3,
    label: 'A different travel time rate',
    includeRate: true,
  },
];

const mockPossibleValues = {
  sameRateAsForVisit: { id: 1, rate: null },
  minumumWage: { id: 2, rate: null },
  differentTravelTimeWithEmptyRate: { id: 3, rate: null },
  differentTravelTimeWithRateGiven: { id: 3, rate: 12.5 },
};

const mockRestoredValues = {
  sameRateAsForVisit: { ...mocktravelTimePayOptions[0], rate: null },
  minumumWage: { ...mocktravelTimePayOptions[1], rate: null },
  differentTravelTimeWithEmptyRate: { ...mocktravelTimePayOptions[2], rate: null },
  differentTravelTimeWithRateGiven: { ...mocktravelTimePayOptions[2], rate: 12.5 },
};

describe('travelTimePayProperty', () => {
  describe('restoreFromJson()', () => {
    beforeEach(() => {
      sinon.stub(models.travelTimePayOption, 'findByPk').callsFake((id) => {
        return mocktravelTimePayOptions.find((payOption) => payOption.id === id);
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should leave the property unchanged when document does not have travelTimePay field', async () => {
      const travelTimePayProperty = new propertyClass();

      const document = { travelTimePay: null };

      await travelTimePayProperty.restoreFromJson(document);

      expect(travelTimePayProperty.property).to.equal(null);
    });

    const testCases = Object.keys(mockPossibleValues);
    testCases.forEach((name) => {
      it(`should restore the property from a JSON object with a valid travelTimePay (${name})`, async () => {
        const travelTimePayProperty = new propertyClass();

        const value = { ...mockPossibleValues[name] };
        const document = { travelTimePay: value };

        await travelTimePayProperty.restoreFromJson(document);

        const expectedRestoredValue = mockRestoredValues[name];

        expect(travelTimePayProperty.property).to.deep.equal(expectedRestoredValue);
      });
    });
  });

  describe('savePropertyToSequelize', () => {
    it('when property is null', () => {
      const travelTimePayProperty = new propertyClass();
      travelTimePayProperty.property = null;

      const saved = travelTimePayProperty.savePropertyToSequelize();
      expect(saved.TravelTimePayOptionFK).to.equal(null);
      expect(saved.travelTimePayRate).to.equal(null);
    });

    it('when chosen option is minimum wage', async () => {
      const travelTimePayProperty = new propertyClass();

      travelTimePayProperty.property = mockPossibleValues.minumumWage;

      const saved = travelTimePayProperty.savePropertyToSequelize();
      expect(saved.TravelTimePayOptionFK).to.equal(mockPossibleValues.minumumWage.id);
      expect(saved.travelTimePayRate).to.equal(null);
    });

    it('when property is differentTravelTime without a rate', async () => {
      const travelTimePayProperty = new propertyClass();

      travelTimePayProperty.property = mockPossibleValues.differentTravelTimeWithEmptyRate;

      const saved = travelTimePayProperty.savePropertyToSequelize();
      expect(saved.TravelTimePayOptionFK).to.equal(mockPossibleValues.differentTravelTimeWithEmptyRate.id);
      expect(saved.travelTimePayRate).to.equal(null);
    });

    it('when property is differentTravelTime with a rate', async () => {
      const travelTimePayProperty = new propertyClass();

      travelTimePayProperty.property = mockPossibleValues.differentTravelTimeWithRateGiven;

      const saved = travelTimePayProperty.savePropertyToSequelize();
      expect(saved.TravelTimePayOptionFK).to.equal(mockPossibleValues.differentTravelTimeWithRateGiven.id);
      expect(saved.travelTimePayRate).to.equal(mockPossibleValues.differentTravelTimeWithRateGiven.rate);
    });
  });

  describe('isEqual()', () => {
    describe('should return true if both values are equal', () => {
      Object.entries(mockPossibleValues).forEach(([testValueName, value]) => {
        it(`when value is ${testValueName}`, () => {
          const travelTimePayProperty = new propertyClass();
          const result = travelTimePayProperty.isEqual(value, value);

          expect(result).to.deep.equal(true);
        });
      });
    });

    describe('should return false if values are not equal', () => {
      Object.entries(mockPossibleValues).forEach(([currentValueName, currentValue]) => {
        Object.entries(mockPossibleValues).forEach(([newValueName, newValue]) => {
          if (currentValueName === newValueName) {
            return;
          }

          it(`current: ${currentValueName}, new: ${newValueName}`, () => {
            const travelTimePayProperty = new propertyClass();
            const result = travelTimePayProperty.isEqual(currentValue, newValue);

            expect(result).to.deep.equal(false);
          });
        });
      });
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON for the property', () => {
      const travelTimePayProperty = new propertyClass();
      travelTimePayProperty.property = mockRestoredValues.differentTravelTimeWithRateGiven;

      const json = travelTimePayProperty.toJSON();

      expect(json).to.deep.equal({
        travelTimePay: mockRestoredValues.differentTravelTimeWithRateGiven,
      });
    });

    it('should handle the case when property is null', () => {
      const travelTimePayProperty = new propertyClass();
      travelTimePayProperty.property = null;

      const json = travelTimePayProperty.toJSON();

      expect(json).to.deep.equal({ travelTimePay: null });
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    it('should not return anything if undefined', async () => {
      const document = {};
      const travelTimePayProperty = new propertyClass();

      const restored = travelTimePayProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(null);
    });

    it('should return null if travelTimePayOption is null', async () => {
      const document = { travelTimePayOption: null };
      const travelTimePayProperty = new propertyClass();

      const restored = travelTimePayProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(null);
    });

    it('should set the property if travelTimePayOption has a value', async () => {
      const document = { travelTimePayOption: mocktravelTimePayOptions[1], travelTimePayRate: null };
      const travelTimePayProperty = new propertyClass();

      const restored = travelTimePayProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(mockRestoredValues.minumumWage);
    });

    it('should restore the property with id and rate if travelTimePayOption is "A different travel time rate" and a rate was stored in database', async () => {
      const document = { travelTimePayOption: mocktravelTimePayOptions[2], travelTimePayRate: 12.5 };
      const travelTimePayProperty = new propertyClass();

      const restored = travelTimePayProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(mockRestoredValues.differentTravelTimeWithRateGiven);
    });

    it('should restore the property with id and rate as null if travelTimePayOption is "A different travel time rate" but does not have the rate', async () => {
      const document = { travelTimePayOption: mocktravelTimePayOptions[2], travelTimePayRate: null };
      const travelTimePayProperty = new propertyClass();

      const restored = travelTimePayProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(mockRestoredValues.differentTravelTimeWithEmptyRate);
    });
  });
});
