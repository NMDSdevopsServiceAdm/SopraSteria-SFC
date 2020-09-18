const expect = require('chai').expect;

const address3PropertyClass = require('../../../../../../models/classes/establishment/properties/address3Property')
  .Address3Property;

describe('address3Property Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async () => {
      const address3Property = new address3PropertyClass();
      const document = {
        address3: '123 Fake Street',
      };
      await address3Property.restoreFromJson(document);
      expect(address3Property.property).to.deep.equal(document.address3);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const address3Property = new address3PropertyClass();
      const document = {
        address3: '123 Fake Street',
      };
      const restored = address3Property.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(document.address3);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const address3Property = new address3PropertyClass();
      const address3 = '123 Fake Street';
      address3Property.property = address3;
      const saved = address3Property.savePropertyToSequelize();
      expect(saved.address3).to.equal(address3);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const address3Property = new address3PropertyClass();
      const currentValue = '123 Fake Street';
      const newValue = '123 Fake Street';
      const equal = address3Property.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are equal', () => {
      const address3Property = new address3PropertyClass();
      const currentValue = '123 Fake Street';
      const newValue = '147 Fake Road';
      const equal = address3Property.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const address3Property = new address3PropertyClass();
      const address3 = '123 Fake Street';
      address3Property.property = address3;
      const json = address3Property.toJSON();
      expect(json.address3).to.deep.equal(address3);
    });
  });
});
