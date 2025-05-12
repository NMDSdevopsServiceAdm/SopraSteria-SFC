const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../../models');

const careWorkforcePathwayRoleCategoryPropertyClass =
  require('../../../../../../models/classes/worker/properties/careWorkforcePathwayRoleCategoryProperty').CareWorkforcePathwayRoleCategoryProperty;

describe('careWorkforcePathwayRoleCategories Property', () => {
  describe('restoreFromJSON', async () => {
    it("shouldn't return anything if undefined", async () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();
      const document = {};
      await careWorkforcePathwayRoleCategoryProperty.restoreFromJson(document);
      expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(null);
    });

    it('should set property with correct value for care workforce pathway role category', async () => {
      const mockResponseFromDatabase = {
        id: 1,
        title: 'New to care',
        description: "Is in a care-providing role that's a start point for a career in social care",
      };
      sinon.stub(models.careWorkforcePathwayRoleCategory, 'findOne').resolves(mockResponseFromDatabase);

      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

      const document = {
        careWorkforcePathwayRoleCategory: { roleCategoryId: 1 },
      };

      const expectedReturnValue = {
        roleCategoryId: 1,
        title: 'New to care',
        description: "Is in a care-providing role that's a start point for a career in social care",
      };
      await careWorkforcePathwayRoleCategoryProperty.restoreFromJson(document);
      expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(expectedReturnValue);
    });

    it('should set property to null if careWorkforcePathwayRoleCategory in document is null', async () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();
      careWorkforcePathwayRoleCategoryProperty.proerty = 'some-dummy-value';

      const document = {
        careWorkforcePathwayRoleCategory: null,
      };

      await careWorkforcePathwayRoleCategoryProperty.restoreFromJson(document);
      expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(null);
    });
  });

  describe('restorePropertyFromSequelize()', async () => {
    it("shouldn't return anything if undefined", async () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();
      const document = {};
      careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);
      expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(null);
    });

    it('should return with correct value for care workforce pathway role category ', async () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

      const document = {
        careWorkforcePathwayRoleCategory: {
          id: 1,
          title: 'New to care',
          description: "Is in a care-providing role that's a start point for a career in social care",
        },
      };

      const expectedReturnValue = {
        roleCategoryId: 1,
        title: 'New to care',
        description: "Is in a care-providing role that's a start point for a career in social care",
      };
      const restoredProperty = careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);
      expect(restoredProperty).to.deep.equal(expectedReturnValue);
    });

    it('should return null if careWorkforcePathwayRoleCategory from sequelize is null', async () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();
      const document = { careWorkforcePathwayRoleCategory: null };

      const restoredProperty = careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);
      expect(restoredProperty).to.deep.equal(null);
    });
  });

  describe('savePropertyToSequelize()', async () => {
    it('should save in correct format as if saving into database for care workforce pathway role category ', () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();
      const document = {
        careWorkforcePathwayRoleCategory: {
          id: 1,
          title: 'New to care',
          description: "Is in a care-providing role that's a start point for a career in social care",
        },
      };
      const property = {
        roleCategoryId: 1,
        title: 'New to care',
        description: "Is in a care-providing role that's a start point for a career in social care",
      };
      careWorkforcePathwayRoleCategoryProperty.property = property;
      const saved = careWorkforcePathwayRoleCategoryProperty.savePropertyToSequelize();
      expect(saved.CareWorkforcePathwayRoleCategoryFK).to.equal(document.careWorkforcePathwayRoleCategory.id);
    });
  });

  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

      const document = {
        careWorkforcePathwayRoleCategory: {
          roleCategoryId: 1,
          title: 'New to care',
          description: "Is in a care-providing role that's a start point for a career in social care",
        },
      };
      const property = {
        roleCategoryId: 1,
        title: 'New to care',
        description: "Is in a care-providing role that's a start point for a career in social care",
      };

      const equal = careWorkforcePathwayRoleCategoryProperty.isEqual(
        document.careWorkforcePathwayRoleCategory,
        property,
      );
      expect(equal).to.deep.equal(true);
    });

    it('should return false if the values are not equal', () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

      const document = {
        careWorkforcePathwayRoleCategory: {
          roleCategoryId: 1,
          title: 'New to care',
          description: "Is in a care-providing role that's a start point for a career in social care",
        },
      };
      const property = {
        roleCategoryId: 2,
        title: 'New to care2',
        description: "Is in a care-providing role that's a start point for a career in social care2",
      };

      const equal = careWorkforcePathwayRoleCategoryProperty.isEqual(
        document.careWorkforcePathwayRoleCategory,
        property,
      );
      expect(equal).to.deep.equal(false);
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON for care workforce pathway role category ', () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

      const property = {
        roleCategoryId: 2,
        title: 'New to care2',
        description: "Is in a care-providing role that's a start point for a career in social care2",
      };
      careWorkforcePathwayRoleCategoryProperty.property = property;
      const json = careWorkforcePathwayRoleCategoryProperty.toJSON();
      expect(json.careWorkforcePathwayRoleCategory).to.deep.equal(property);
    });
  });
});
