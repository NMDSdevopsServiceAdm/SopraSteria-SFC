const expect = require('chai').expect;

const countyPropertyClass = require('../../../../../../models/classes/establishment/properties/countyProperty').CountyProperty;

describe('countyProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async() => {
      const countyProperty = new countyPropertyClass();
      const document = {
        county: 'Fakelees'
      };
      await countyProperty.restoreFromJson(document);
      expect(countyProperty.property).to.deep.equal(document.county);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const countyProperty = new countyPropertyClass();
      const document = {
        county: 'Fakelees'
      };
      const restored = countyProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(document.county);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const countyProperty = new countyPropertyClass();
      const county = 'Fakelees';
      countyProperty.property = county;
      const saved = countyProperty.savePropertyToSequelize();
      expect(saved.county).to.equal(county);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const countyProperty = new countyPropertyClass();
      const currentValue = 'Fakelees';
      const newValue = 'Fakelees';
      const equal = countyProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are equal', () => {
      const countyProperty = new countyPropertyClass();
      const currentValue = 'Fakelees';
      const newValue = 'Fakety';
      const equal = countyProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const countyProperty = new countyPropertyClass();
      const county = 'Fakelees';
      countyProperty.property = county;
      const json = countyProperty.toJSON();
      expect(json.county).to.deep.equal(county);
    });
  });
});
