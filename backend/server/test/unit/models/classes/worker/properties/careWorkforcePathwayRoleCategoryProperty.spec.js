const expect = require('chai').expect;
const careWorkforcePathwayRoleCategoryPropertyClass =
  require('../../../../../../models/classes/worker/properties/careWorkforcePathwayRoleCategoryProperty').CareWorkforcePathwayRoleCategoryProperty;

const careWorkforcePathwayRoleCategories = [
  {
    ID: 1,
    Seq: 10,
    Title: 'New to care',
    Description: "Is in a care-providing role that's a start point for a career in social care",
    AnalysisFileCode: 1,
    BulkUploadCode: 1,
  },
];

const careWorkforcePayload = {
  Title: 'Care or support worker',
  Description: "Is established in their role, they've consolidated their skills and experience",
};

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
      await careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);
      expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(null);
    });


    it('should return with correct value for care workforce pathway role category ', async () => {

        const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

        const document = {
          careWorkforcePathwayRoleCategory: { id: 1, title: 'New to care', description: "Is in a care-providing role that's a start point for a career in social care"},

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
});
