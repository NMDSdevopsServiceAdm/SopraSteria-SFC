const expect = require('chai').expect;

const address1PropertyClass = require('../../../../../../models/classes/establishment/properties/address1Property').Address1Property;

describe('address1Property Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async() => {
      const address1Property = new address1PropertyClass();
      const document = {
        address1: '123 Fake Street'
      };
      await address1Property.restoreFromJson(document);
      expect(address1Property.property).to.deep.equal(document.address1);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const address1Property = new address1PropertyClass();
      const document = {
        address1: '123 Fake Street'
      };
      const restored = address1Property.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(document.address1);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const address1Property = new address1PropertyClass();
      const address1 = '123 Fake Street';
      address1Property.property = address1;
      const saved = address1Property.savePropertyToSequelize();
      expect(saved.address1).to.equal(address1);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const address1Property = new address1PropertyClass();
      const currentValue = '123 Fake Street';
      const newValue = '123 Fake Street';
      const equal = address1Property.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are equal', () => {
      const address1Property = new address1PropertyClass();
      const currentValue = '123 Fake Street';
      const newValue = '147 Fake Road';
      const equal = address1Property.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const address1Property = new address1PropertyClass();
      const address1 = '123 Fake Street';
      address1Property.property = address1;
      const json = address1Property.toJSON();
      expect(json.address1).to.deep.equal(address1);
    });
  });
});
