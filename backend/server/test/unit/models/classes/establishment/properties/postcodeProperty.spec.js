const expect = require('chai').expect;

const postcodePropertyClass = require('../../../../../../models/classes/establishment/properties/postcodeProperty').PostcodeProperty;

describe('postcodeProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async() => {
      const postcodeProperty = new postcodePropertyClass();
      const document = {
        postcode: 'LS1 1AA'
      };
      await postcodeProperty.restoreFromJson(document);
      expect(postcodeProperty.property).to.deep.equal(document.postcode);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const postcodeProperty = new postcodePropertyClass();
      const document = {
        postcode: 'LS1 1AA'
      };
      const restored = postcodeProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(document.postcode);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const postcodeProperty = new postcodePropertyClass();
      const postcode = 'LS1 1AA';
      postcodeProperty.property = postcode;
      const saved = postcodeProperty.savePropertyToSequelize();
      expect(saved.postcode).to.equal(postcode);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const postcodeProperty = new postcodePropertyClass();
      const currentValue = 'LS1 1AA';
      const newValue = 'LS1 1AA';
      const equal = postcodeProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are equal', () => {
      const postcodeProperty = new postcodePropertyClass();
      const currentValue = 'LS1 1AA';
      const newValue = 'LS16 8ZZ';
      const equal = postcodeProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const postcodeProperty = new postcodePropertyClass();
      const postcode = 'LS1 1AA';
      postcodeProperty.property = postcode;
      const json = postcodeProperty.toJSON();
      expect(json.postcode).to.deep.equal(postcode);
    });
  });
});
