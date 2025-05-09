const expect = require('chai').expect;
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

    it('should return with correct value for care workforce pathway role category', async () => {
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
      const restoredProperty = await careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);
      expect(restoredProperty).to.deep.equal(expectedReturnValue);
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
});
