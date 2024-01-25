const expect = require('chai').expect;

const locationIdPropertyClass = require('../../../../../../models/classes/establishment/properties/locationIdProperty').LocationIdProperty;

describe('locationIdProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async() => {
      const locationIdProperty = new locationIdPropertyClass();
      const document = {
        locationId: '1-12345678'
      };
      await locationIdProperty.restoreFromJson(document);
      expect(locationIdProperty.property).to.deep.equal(document.locationId);
    });
    it('should return null if over character limit', async() => {
      const locationIdProperty = new locationIdPropertyClass();
      const document = {
        locationId: '1-1234567896469869846498648964647896987986986363986389639863896398368936398639836893768936389639863986389638963986398836983689363896'
      };
      await locationIdProperty.restoreFromJson(document);
      expect(locationIdProperty.property).to.deep.equal(null);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const locationIdProperty = new locationIdPropertyClass();
      const document = {
        locationId: '1-12345678'
      };
      const restored = locationIdProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(document.locationId);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const locationIdProperty = new locationIdPropertyClass();
      const locationId = '1-12345678';
      locationIdProperty.property = locationId;
      const saved = locationIdProperty.savePropertyToSequelize();
      expect(saved.locationId).to.equal(locationId);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const locationIdProperty = new locationIdPropertyClass();
      const currentValue = '1-12345678';
      const newValue = '1-12345678';
      const equal = locationIdProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are equal', () => {
      const locationIdProperty = new locationIdPropertyClass();
      const currentValue = '1-12345678';
      const newValue = '1-12345679';
      const equal = locationIdProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const locationIdProperty = new locationIdPropertyClass();
      const locationId = '1-12345678';
      locationIdProperty.property = locationId;
      const json = locationIdProperty.toJSON();
      expect(json.locationId).to.deep.equal(locationId);
    });
  });
});
