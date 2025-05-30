const expect = require('chai').expect;

const careWorkforcePathwayWorkplaceAwarenessPropertyClass =
  require('../../../../../../models/classes/establishment/properties/careWorkforcePathwayWorkplaceAwarenessProperty').CareWorkforcePathwayWorkplaceAwarenessProperty;

describe('careWorkforcePathwayWorkplaceAwarenessProperty', () => {
  let careWorkforcePathwayWorkplaceAwarenessProperty;

  beforeEach(() => {
    careWorkforcePathwayWorkplaceAwarenessProperty = new careWorkforcePathwayWorkplaceAwarenessPropertyClass();
  });

  describe('restoreFromJson()', () => {
    it('should not return anything if undefined', async () => {
      const document = {};

      await careWorkforcePathwayWorkplaceAwarenessProperty.restoreFromJson(document);
      expect(careWorkforcePathwayWorkplaceAwarenessProperty.property).to.deep.equal(null);
    });

    it('should return null if careWorkforcePathwayWorkplaceAwareness in the document is null', async () => {
      const document = { careWorkforcePathwayWorkplaceAwareness: null };

      await careWorkforcePathwayWorkplaceAwarenessProperty.restoreFromJson(document);
      expect(careWorkforcePathwayWorkplaceAwarenessProperty.property).to.deep.equal(null);
    });

    it('should return JSON', async () => {
      const document = {
        careWorkforcePathwayWorkplaceAwareness: {
          id: 1,
        },
      };

      await careWorkforcePathwayWorkplaceAwarenessProperty.restoreFromJson(document);
      expect(careWorkforcePathwayWorkplaceAwarenessProperty.property).to.deep.equal(
        document.careWorkforcePathwayWorkplaceAwareness,
      );
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    it('should not return anything if undefined', async () => {
      const document = {};

      careWorkforcePathwayWorkplaceAwarenessProperty.restorePropertyFromSequelize(document);
      expect(careWorkforcePathwayWorkplaceAwarenessProperty.property).to.deep.equal(null);
    });

    it('should return null if careWorkforcePathwayWorkplaceAwareness is null', async () => {
      const document = { careWorkforcePathwayWorkplaceAwareness: null };

      careWorkforcePathwayWorkplaceAwarenessProperty.restorePropertyFromSequelize(document);
      expect(careWorkforcePathwayWorkplaceAwarenessProperty.property).to.deep.equal(null);
    });

    it('should restore in correct format', async () => {
      const document = {
        careWorkforcePathwayWorkplaceAwareness: {
          id: 1,
          title: 'Aware of how the care workforce pathway works in practice',
        },
      };

      const expectedResult = {
        awarnessId: 1,
        title: 'Aware of how the care workforce pathway works in practice',
      };

      const restoredProperty = careWorkforcePathwayWorkplaceAwarenessProperty.restorePropertyFromSequelize(document);
      expect(restoredProperty).to.deep.equal(expectedResult);
    });
  });

  describe('savePropertyToSequelize()', () => {
    it('should save to the database in the correct format', () => {
      const document = {
        careWorkforcePathwayWorkplaceAwareness: {
          id: 1,
          title: 'Aware of how the care workforce pathway works in practice',
        },
      };

      const property = {
        awarnessId: 1,
        title: 'Aware of how the care workforce pathway works in practice',
      };

      careWorkforcePathwayWorkplaceAwarenessProperty.property = property;

      const saved = careWorkforcePathwayWorkplaceAwarenessProperty.savePropertyToSequelize();
      expect(saved.CareWorkforcePathwayWorkplaceAwarenessFK).to.equal(
        document.careWorkforcePathwayWorkplaceAwareness.id,
      );
    });
  });

  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const document = {
        careWorkforcePathwayWorkplaceAwareness: {
          awarnessId: 1,
          title: 'Aware of how the care workforce pathway works in practice',
        },
      };

      const property = {
        awarnessId: 1,
        title: 'Aware of how the care workforce pathway works in practice',
      };

      const equal = careWorkforcePathwayWorkplaceAwarenessProperty.isEqual(
        document.careWorkforcePathwayWorkplaceAwareness,
        property,
      );
      expect(equal).to.equal(true);
    });

    it('should return false if the values are not equal', () => {
      const document = {
        careWorkforcePathwayWorkplaceAwareness: {
          awarnessId: 1,
          title: 'Aware of how the care workforce pathway works in practice',
        },
      };

      const property = {
        awarnessId: 3,
        title: 'Aware of how the care workforce pathway works in practice',
      };

      const equal = careWorkforcePathwayWorkplaceAwarenessProperty.isEqual(
        document.careWorkforcePathwayWorkplaceAwareness,
        property,
      );
      expect(equal).to.equal(false);
    });
  });

  describe('toJSON()', () => {
    it('should return the correctly formatted JSON', () => {
      const property = {
        awarnessId: 1,
        title: 'Aware of how the care workforce pathway works in practice',
      };

      careWorkforcePathwayWorkplaceAwarenessProperty.property = property;

      const json = careWorkforcePathwayWorkplaceAwarenessProperty.toJSON();
      expect(json.careWorkforcePathwayWorkplaceAwareness).to.equal(property);
    });
  });
});
