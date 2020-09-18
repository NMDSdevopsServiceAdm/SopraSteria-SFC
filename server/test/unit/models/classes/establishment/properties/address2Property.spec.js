const expect = require('chai').expect;

const address2PropertyClass = require('../../../../../../models/classes/establishment/properties/address2Property')
  .Address2Property;

describe('address2Property Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async () => {
      const address2Property = new address2PropertyClass();
      const document = {
        address2: '123 Fake Street',
      };
      await address2Property.restoreFromJson(document);
      expect(address2Property.property).to.deep.equal(document.address2);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const address2Property = new address2PropertyClass();
      const document = {
        address2: '123 Fake Street',
      };
      const restored = address2Property.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(document.address2);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const address2Property = new address2PropertyClass();
      const address2 = '123 Fake Street';
      address2Property.property = address2;
      const saved = address2Property.savePropertyToSequelize();
      expect(saved.address2).to.equal(address2);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const address2Property = new address2PropertyClass();
      const currentValue = '123 Fake Street';
      const newValue = '123 Fake Street';
      const equal = address2Property.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are equal', () => {
      const address2Property = new address2PropertyClass();
      const currentValue = '123 Fake Street';
      const newValue = '147 Fake Road';
      const equal = address2Property.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const address2Property = new address2PropertyClass();
      const address2 = '123 Fake Street';
      address2Property.property = address2;
      const json = address2Property.toJSON();
      expect(json.address2).to.deep.equal(address2);
    });
  });
});
