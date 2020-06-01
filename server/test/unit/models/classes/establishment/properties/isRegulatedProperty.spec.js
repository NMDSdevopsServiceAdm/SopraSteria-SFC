const expect = require('chai').expect;

const isRegulatedPropertyClass = require('../../../../../../models/classes/establishment/properties/isRegulatedProperty').IsRegulatedProperty;

describe('isRegulatedProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async() => {
      const isRegulatedProperty = new isRegulatedPropertyClass();
      const document = {
        isRegulated: true
      };
      await isRegulatedProperty.restoreFromJson(document);
      expect(isRegulatedProperty.property).to.deep.equal(document.isRegulated);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const isRegulatedProperty = new isRegulatedPropertyClass();
      const document = {
        isRegulated: true
      };
      const restored = isRegulatedProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(document.isRegulated);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const isRegulatedProperty = new isRegulatedPropertyClass();
      const isRegulated = true;
      isRegulatedProperty.property = isRegulated;
      const saved = isRegulatedProperty.savePropertyToSequelize();
      expect(saved.isRegulated).to.equal(isRegulated);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const isRegulatedProperty = new isRegulatedPropertyClass();
      const currentValue = true;
      const newValue = true;
      const equal = isRegulatedProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are equal', () => {
      const isRegulatedProperty = new isRegulatedPropertyClass();
      const currentValue = true;
      const newValue = false;
      const equal = isRegulatedProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const isRegulatedProperty = new isRegulatedPropertyClass();
      const isRegulated = true;
      isRegulatedProperty.property = isRegulated;
      const json = isRegulatedProperty.toJSON();
      expect(json.isRegulated).to.deep.equal(isRegulated);
    });
  });
});
