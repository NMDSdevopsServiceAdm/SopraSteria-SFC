const expect = require('chai').expect;

const townPropertyClass = require('../../../../../../models/classes/establishment/properties/townProperty')
  .TownProperty;

describe('townProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async () => {
      const townProperty = new townPropertyClass();
      const document = {
        town: 'Faketon',
      };
      await townProperty.restoreFromJson(document);
      expect(townProperty.property).to.deep.equal(document.town);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const townProperty = new townPropertyClass();
      const document = {
        town: 'Faketon',
      };
      const restored = townProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(document.town);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const townProperty = new townPropertyClass();
      const town = 'Faketon';
      townProperty.property = town;
      const saved = townProperty.savePropertyToSequelize();
      expect(saved.town).to.equal(town);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const townProperty = new townPropertyClass();
      const currentValue = 'Faketon';
      const newValue = 'Faketon';
      const equal = townProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are equal', () => {
      const townProperty = new townPropertyClass();
      const currentValue = 'Faketon';
      const newValue = 'Fakeville';
      const equal = townProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const townProperty = new townPropertyClass();
      const town = 'Faketon';
      townProperty.property = town;
      const json = townProperty.toJSON();
      expect(json.town).to.deep.equal(town);
    });
  });
});
