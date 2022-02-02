const expect = require('chai').expect;

const CanManageWdfClaimsProperty =
  require('../../../../../../models/classes/user/properties/canManageWdfClaimsProperty').UserCanManageWdfClaimsProperty;

describe('canManageWdfClaimsProperty', () => {
  describe('restoreFromJson()', () => {
    it('should set property to true when set to true in document', async () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const document = {
        canManageWdfClaims: true,
      };
      await canManageWdfClaimsProperty.restoreFromJson(document);
      expect(canManageWdfClaimsProperty.property).to.deep.equal(document.canManageWdfClaims);
    });

    it('should set property to false when set to false in document', async () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const document = {
        canManageWdfClaims: false,
      };

      await canManageWdfClaimsProperty.restoreFromJson(document);

      expect(canManageWdfClaimsProperty.property).to.deep.equal(document.canManageWdfClaims);
    });

    it('should not return JSON when null', async () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const document = {
        canManageWdfClaims: null,
      };

      await canManageWdfClaimsProperty.restoreFromJson(document);

      expect(canManageWdfClaimsProperty.property).to.deep.equal(null);
    });

    it('should not return JSON when undefined', async () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const document = {};

      await canManageWdfClaimsProperty.restoreFromJson(document);

      expect(canManageWdfClaimsProperty.property).to.deep.equal(null);
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const document = {
        canManageWdfClaims: true,
      };

      const restored = canManageWdfClaimsProperty.restorePropertyFromSequelize(document);

      expect(restored).to.deep.equal(document.canManageWdfClaims);
    });
  });

  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const canManageWdfClaims = true;
      canManageWdfClaimsProperty.property = canManageWdfClaims;

      const saved = canManageWdfClaimsProperty.savePropertyToSequelize();

      expect(saved.canManageWdfClaims).to.equal(canManageWdfClaims);
    });
  });

  describe('isEqual()', () => {
    it('should return true if values are both true', () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const currentValue = true;
      const newValue = true;

      const equal = canManageWdfClaimsProperty.isEqual(currentValue, newValue);

      expect(equal).to.deep.equal(true);
    });

    it('should return true if values are both false', () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const currentValue = false;
      const newValue = false;

      const equal = canManageWdfClaimsProperty.isEqual(currentValue, newValue);

      expect(equal).to.deep.equal(true);
    });

    it('should return false if the values are both boolean but not equal', () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const currentValue = true;
      const newValue = false;

      const equal = canManageWdfClaimsProperty.isEqual(currentValue, newValue);

      expect(equal).to.deep.equal(false);
    });

    it('should return false if one of the values is null', () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const currentValue = false;
      const newValue = null;

      const equal = canManageWdfClaimsProperty.isEqual(currentValue, newValue);

      expect(equal).to.deep.equal(false);
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const canManageWdfClaimsProperty = new CanManageWdfClaimsProperty();
      const canManageWdfClaims = true;
      canManageWdfClaimsProperty.property = canManageWdfClaims;

      const json = canManageWdfClaimsProperty.toJSON();

      expect(json.canManageWdfClaims).to.deep.equal(canManageWdfClaims);
    });
  });
});
