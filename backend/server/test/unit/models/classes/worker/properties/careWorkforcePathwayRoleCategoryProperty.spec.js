const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../../models');
const { CWPRoleCategoryGroup } = require('../../../../../../data/constants');

const careWorkforcePathwayRoleCategoryPropertyClass =
  require('../../../../../../models/classes/worker/properties/careWorkforcePathwayRoleCategoryProperty').CareWorkforcePathwayRoleCategoryProperty;

const NewToCare = {
  id: 1,
  title: 'New to care',
  description: "Is in a care-providing role that's a start point for a career in social care",
  group: CWPRoleCategoryGroup.CareProviding,
};

const DeputyManager = {
  id: 6,
  title: 'Deputy manager',
  description: 'Has people management responsibilities and helps to run the service',
  group: CWPRoleCategoryGroup.SeniorLeadership,
};

describe('careWorkforcePathwayRoleCategories Property', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('restoreFromJSON', async () => {
    it("shouldn't return anything if undefined", async () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();
      const document = {};
      await careWorkforcePathwayRoleCategoryProperty.restoreFromJson(document);
      expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(null);
    });

    it('should set property with correct value for care workforce pathway role category', async () => {
      sinon.stub(models.careWorkforcePathwayRoleCategory, 'findOne').resolves(NewToCare);

      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

      const document = {
        careWorkforcePathwayRoleCategory: { roleCategoryId: 1 },
      };

      const expectedReturnValue = {
        roleCategoryId: NewToCare.id,
        title: NewToCare.title,
        description: NewToCare.description,
        group: NewToCare.group,
      };
      await careWorkforcePathwayRoleCategoryProperty.restoreFromJson(document);
      expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(expectedReturnValue);
    });

    describe('isNominatedIndividual', () => {
      it('should set isNominatedIndividual to true if worker document has isNominatedIndividual = true and group is senior leadership', async () => {
        sinon.stub(models.careWorkforcePathwayRoleCategory, 'findOne').resolves(DeputyManager);

        const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

        const document = {
          careWorkforcePathwayRoleCategory: { roleCategoryId: 6, isNominatedIndividual: true },
        };

        const expectedReturnValue = {
          roleCategoryId: DeputyManager.id,
          title: DeputyManager.title,
          description: DeputyManager.description,
          group: DeputyManager.group,
          isNominatedIndividual: true,
        };

        await careWorkforcePathwayRoleCategoryProperty.restoreFromJson(document);
        expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(expectedReturnValue);
      });

      it('should not set isNominatedIndividual to true if worker document does not have isNominatedIndividual and group is senior leadership', async () => {
        sinon.stub(models.careWorkforcePathwayRoleCategory, 'findOne').resolves(DeputyManager);

        const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

        const document = {
          careWorkforcePathwayRoleCategory: { roleCategoryId: 6 },
        };

        const expectedReturnValue = {
          roleCategoryId: DeputyManager.id,
          title: DeputyManager.title,
          description: DeputyManager.description,
          group: DeputyManager.group,
        };

        await careWorkforcePathwayRoleCategoryProperty.restoreFromJson(document);
        expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(expectedReturnValue);
      });

      it('should not set isNominatedIndividual to true if group is not senior leadership', async () => {
        sinon.stub(models.careWorkforcePathwayRoleCategory, 'findOne').resolves(NewToCare);

        const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

        const document = {
          careWorkforcePathwayRoleCategory: { roleCategoryId: 1, isNominatedIndividual: true },
        };

        const expectedReturnValue = {
          roleCategoryId: NewToCare.id,
          title: NewToCare.title,
          description: NewToCare.description,
          group: NewToCare.group,
        };

        await careWorkforcePathwayRoleCategoryProperty.restoreFromJson(document);
        expect(careWorkforcePathwayRoleCategoryProperty.property).to.deep.equal(expectedReturnValue);
      });
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
        careWorkforcePathwayRoleCategory: NewToCare,
      };

      const expectedReturnValue = {
        roleCategoryId: NewToCare.id,
        title: NewToCare.title,
        description: NewToCare.description,
        group: NewToCare.group,
      };
      const restoredProperty = careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);
      expect(restoredProperty).to.deep.equal(expectedReturnValue);
    });

    describe('when role category group = Senior Leadership', () => {
      it('should set isNominatedIndividual to true if CWPRoleCategoryIsAlsoNominatedIndividual = true', async () => {
        const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

        const document = {
          careWorkforcePathwayRoleCategory: DeputyManager,
          CWPRoleCategoryIsAlsoNominatedIndividual: true,
        };

        const expectedReturnValue = {
          roleCategoryId: DeputyManager.id,
          title: DeputyManager.title,
          description: DeputyManager.description,
          group: DeputyManager.group,
          isNominatedIndividual: true,
        };

        const restoredProperty = careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);

        expect(restoredProperty).to.deep.equal(expectedReturnValue);
      });

      it('should not set isNominatedIndividual to true if CWPRoleCategoryIsAlsoNominatedIndividual = false', async () => {
        const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

        const document = {
          careWorkforcePathwayRoleCategory: DeputyManager,
          CWPRoleCategoryIsAlsoNominatedIndividual: false,
        };

        const expectedReturnValue = {
          roleCategoryId: DeputyManager.id,
          title: DeputyManager.title,
          description: DeputyManager.description,
          group: DeputyManager.group,
        };

        const restoredProperty = careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);

        expect(restoredProperty).to.deep.equal(expectedReturnValue);
      });

      describe('when role category group is not Senior Leadership', () => {
        it('should not set isNominatedIndividual to true even if CWPRoleCategoryIsAlsoNominatedIndividual = true', async () => {
          const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

          const document = {
            careWorkforcePathwayRoleCategory: NewToCare,
            CWPRoleCategoryIsAlsoNominatedIndividual: true,
          };

          const expectedReturnValue = {
            roleCategoryId: NewToCare.id,
            title: NewToCare.title,
            description: NewToCare.description,
            group: NewToCare.group,
          };

          const restoredProperty = careWorkforcePathwayRoleCategoryProperty.restorePropertyFromSequelize(document);

          expect(restoredProperty).to.deep.equal(expectedReturnValue);
        });
      });
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

      const property = {
        roleCategoryId: NewToCare.id,
        title: NewToCare.title,
        description: NewToCare.description,
        group: NewToCare.group,
      };
      careWorkforcePathwayRoleCategoryProperty.property = property;
      const saved = careWorkforcePathwayRoleCategoryProperty.savePropertyToSequelize();

      expect(saved.CareWorkforcePathwayRoleCategoryFK).to.equal(NewToCare.id);
      expect(saved.CWPRoleCategoryIsAlsoNominatedIndividual).to.equal(false);
    });

    it('should set CWPRoleCategoryIsAlsoNominatedIndividual to true if property has isNominatedIndividual = true', () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

      const property = {
        roleCategoryId: DeputyManager.id,
        title: DeputyManager.title,
        description: DeputyManager.description,
        group: DeputyManager.group,
        isNominatedIndividual: true,
      };
      careWorkforcePathwayRoleCategoryProperty.property = property;
      const saved = careWorkforcePathwayRoleCategoryProperty.savePropertyToSequelize();

      expect(saved.CareWorkforcePathwayRoleCategoryFK).to.equal(DeputyManager.id);
      expect(saved.CWPRoleCategoryIsAlsoNominatedIndividual).to.equal(true);
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

    it('should return false if isNominatedIndividual does not match', () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();
      const currentValue = {
        roleCategoryId: DeputyManager.id,
        title: DeputyManager.title,
        description: DeputyManager.description,
        group: DeputyManager.group,
      };

      const newValue = {
        roleCategoryId: DeputyManager.id,
        title: DeputyManager.title,
        description: DeputyManager.description,
        group: DeputyManager.group,
        isNominatedIndividual: true,
      };

      const result = careWorkforcePathwayRoleCategoryProperty.isEqual(currentValue, newValue);

      expect(result).to.deep.equal(false);
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON for care workforce pathway role category ', () => {
      const careWorkforcePathwayRoleCategoryProperty = new careWorkforcePathwayRoleCategoryPropertyClass();

      const property = {
        roleCategoryId: NewToCare.id,
        title: NewToCare.title,
        description: NewToCare.description,
        group: NewToCare.group,
      };
      careWorkforcePathwayRoleCategoryProperty.property = property;
      const json = careWorkforcePathwayRoleCategoryProperty.toJSON();
      expect(json.careWorkforcePathwayRoleCategory).to.deep.equal(property);
    });
  });
});
