'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const propertyClass =
  require('../../../../../../models/classes/establishment/properties/pensionContributionPercentageProperty').PensionContributionPercentageProperty;

describe.only('PensionContributionPercentageProperty', () => {
  describe('restoreFromJson()', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should leave the property unchanged when document does not have pensionContributionPercentage field', async () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = 10;

      const document = { pensionContribution: 'Yes' };

      await propertyInstance.restoreFromJson(document);

      expect(propertyInstance.property).to.equal(10);
    });

    it('should restore the property from a JSON object with a valid value', async () => {
      const propertyInstance = new propertyClass();

      const document = { pensionContribution: 'Yes', pensionContributionPercentage: 5.5 };

      await propertyInstance.restoreFromJson(document);

      expect(propertyInstance.property).to.equal(5.5);
      expect(propertyInstance.changed).to.equal(true);
    });

    const invalidCases = [2.5, 101, 'some random string'];
    invalidCases.forEach((invalidValue) => {
      it(`should not restore the property if the value is invalid - ${invalidValue}`, async () => {
        const propertyInstance = new propertyClass();

        const document = { pensionContribution: 'Yes', pensionContributionPercentage: invalidValue };

        await propertyInstance.restoreFromJson(document);

        expect(propertyInstance.property).to.equal(null);
        expect(propertyInstance.changed).to.equal(false);
      });
    });

    it('should not restore the property if pensionContribution is not "Yes"', async () => {
      const propertyInstance = new propertyClass();

      const document = { pensionContribution: null, pensionContributionPercentage: 5.5 };

      await propertyInstance.restoreFromJson(document);

      expect(propertyInstance.property).to.equal(null);
      expect(propertyInstance.changed).to.equal(false);
    });
  });

  describe('savePropertyToSequelize', () => {
    it('when property is null', () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = null;

      const saved = propertyInstance.savePropertyToSequelize();
      expect(saved.pensionContributionPercentage).to.equal(null);
    });

    it('when the property is a valid value', async () => {
      const propertyInstance = new propertyClass();

      propertyInstance.property = 5.5;

      const saved = propertyInstance.savePropertyToSequelize();
      expect(saved.pensionContributionPercentage).to.equal(5.5);
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON for the property', () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = 5.5;

      const json = propertyInstance.toJSON();

      expect(json).to.deep.equal({
        pensionContributionPercentage: 5.5,
      });
    });

    it('should handle the case when property is null', () => {
      const propertyInstance = new propertyClass();
      propertyInstance.property = null;

      const json = propertyInstance.toJSON();

      expect(json).to.deep.equal({ pensionContributionPercentage: null });
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    it('should not return anything if undefined', async () => {
      const document = {};
      const propertyInstance = new propertyClass();

      const restored = propertyInstance.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(null);
    });

    it('should set the property from database value has a value', async () => {
      const document = { pensionContributionPercentage: 5.5 };
      const propertyInstance = new propertyClass();

      const restored = propertyInstance.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(5.5);
    });
  });
});
