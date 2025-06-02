'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../../models/');
const { cloneDeep } = require('lodash');
const { MockCareWorkforcePathwayUseReasons } = require('../../../../mockdata/careWorkforcePathway');

const propertyClass =
  require('../../../../../../models/classes/establishment/properties/careWorkforcePathwayUseProperty').CareWorkforcePathwayUseProperty;

const mockReasons = MockCareWorkforcePathwayUseReasons;

const testValues = {
  empty: null,
  no: { use: 'No', reasons: null },
  dont_know: { use: "Don't know", reasons: null },
  yes_without_reasons: { use: 'Yes', reasons: null },
  yes_with_reasons: { use: 'Yes', reasons: [mockReasons[0]] },
  yes_with_reason_0_and_other_reason: {
    use: 'Yes',
    reasons: [mockReasons[0], { ...mockReasons[2], other: 'some specific reasons' }],
  },
};

describe('careWorkforcePathwayUseProperty', () => {
  describe('restoreFromJson()', () => {
    beforeEach(() => {
      sinon.stub(models.CareWorkforcePathwayReasons, 'findAll').callsFake((queryOption) => {
        const ids = queryOption.where.id;
        return mockReasons.filter((reason) => ids.includes(reason.id));
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    describe("should restore the property from a JSON object when use is No / Don't know / Yes without reason", async () => {
      ['Yes', 'No', "Don't know"].forEach((value) => {
        it(value, async () => {
          const cwpUseProperty = new propertyClass();
          const document = {
            careWorkforcePathwayUse: {
              use: value,
              reasons: null,
            },
          };
          const expectedProperty = {
            use: value,
            reasons: null,
          };

          await cwpUseProperty.restoreFromJson(document);

          expect(cwpUseProperty.property).to.deep.equal(expectedProperty);
        });
      });
    });

    it('should restore the property from a JSON object when use is Yes with some reasons', async () => {
      const cwpUseProperty = new propertyClass();
      const document = {
        careWorkforcePathwayUse: {
          use: 'Yes',
          reasons: [{ id: 1 }, { id: 10, other: 'some other specific reason' }],
        },
      };

      const expectedProperty = {
        use: 'Yes',
        reasons: [
          { id: 1, text: "To help define our organisation's values", isOther: false },
          { id: 10, text: 'For something else', isOther: true, other: 'some other specific reason' },
        ],
      };

      await cwpUseProperty.restoreFromJson(document);

      expect(cwpUseProperty.property).to.deep.equal(expectedProperty);
    });

    it('should keep the property unchanged when incoming document does not have the field careWorkforcePathwayUse', async () => {
      const cwpUseProperty = new propertyClass();

      const document = {};

      await cwpUseProperty.restoreFromJson(document);

      expect(cwpUseProperty.property).to.equal(null);
      expect(cwpUseProperty._notSet).to.equal(true);
    });

    it('should set valid() to false when incoming document has an malformed value for careWorkforcePathwayUse', async () => {
      const cwpUseProperty = new propertyClass();

      const document = { careWorkforcePathwayUse: { fruits: 'apple banana cranberry' } };

      await cwpUseProperty.restoreFromJson(document);

      expect(cwpUseProperty.valid).to.equal(false);
    });

    it('should set valid() to false when use is an invalid value', async () => {
      const cwpUseProperty = new propertyClass();

      const document = { careWorkforcePathwayUse: { use: 'Cat food' } };

      await cwpUseProperty.restoreFromJson(document);

      expect(cwpUseProperty.valid).to.equal(false);
    });

    it('should set valid() to false when use is Yes and some of the reasons are invalid', async () => {
      const cwpUseProperty = new propertyClass();

      const document = { careWorkforcePathwayUse: { use: 'Yes', reasons: [{ id: 1 }, { id: 99999999 }] } };

      await cwpUseProperty.restoreFromJson(document);

      expect(cwpUseProperty.valid).to.equal(false);
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    describe('should restore the property from sequelize establishment object', () => {
      it('when use is No', () => {
        const cwpUseProperty = new propertyClass();
        const sequelizeObject = {
          careWorkforcePathwayUse: 'No',
          careWorkforcePathwayReasons: [],
        };

        const expectedProperty = {
          use: 'No',
          reasons: null,
        };

        const restored = cwpUseProperty.restorePropertyFromSequelize(sequelizeObject);
        expect(restored).to.deep.equal(expectedProperty);
      });

      it('when use is Yes with no reasons', () => {
        const cwpUseProperty = new propertyClass();
        const sequelizeDocument = {
          careWorkforcePathwayUse: 'Yes',
          careWorkforcePathwayReasons: [],
        };

        const expectedProperty = {
          use: 'Yes',
          reasons: null,
        };

        const restored = cwpUseProperty.restorePropertyFromSequelize(sequelizeDocument);
        expect(restored).to.deep.equal(expectedProperty);
      });

      it('when use is Yes with some reasons', () => {
        const cwpUseProperty = new propertyClass();
        const sequelizeDocument = {
          careWorkforcePathwayUse: 'Yes',
          careWorkforcePathwayReasons: [mockReasons[0], { ...mockReasons[2], other: 'some specific reasons' }],
        };

        const expectedProperty = testValues.yes_with_reason_0_and_other_reason;

        const restored = cwpUseProperty.restorePropertyFromSequelize(sequelizeDocument);
        expect(restored).to.deep.equal(expectedProperty);
      });

      it('when the value in database is null', () => {
        const cwpUseProperty = new propertyClass();
        const sequelizeDocument = {
          careWorkforcePathwayUse: null,
          careWorkforcePathwayReasons: [],
        };

        const expectedProperty = null;

        const restored = cwpUseProperty.restorePropertyFromSequelize(sequelizeDocument);
        expect(restored).to.deep.equal(expectedProperty);
      });
    });
  });

  describe('savePropertyToSequelize()', () => {
    describe('should convert the property into correct format for sequelize to save into database', () => {
      describe('when use is No / Dont know / Yes with no reasons', () => {
        ['Yes', 'No', "Don't know"].forEach((value) => {
          it(value, () => {
            const cwpUseProperty = new propertyClass();
            cwpUseProperty.property = { use: value, reasons: null };

            const saved = cwpUseProperty.savePropertyToSequelize();
            expect(saved.careWorkforcePathwayUse).to.equal(value);
            expect(saved.additionalModels.EstablishmentCWPReasons).to.deep.equal([]);
          });
        });
      });

      it('when use is Yes with some reasons', () => {
        const cwpUseProperty = new propertyClass();
        cwpUseProperty.property = testValues.yes_with_reason_0_and_other_reason;

        const saved = cwpUseProperty.savePropertyToSequelize();
        expect(saved.careWorkforcePathwayUse).to.equal('Yes');
        expect(saved.additionalModels.EstablishmentCWPReasons).to.deep.equal([
          { careWorkforcePathwayReasonID: mockReasons[0].id },
          { careWorkforcePathwayReasonID: mockReasons[2].id, other: 'some specific reasons' },
        ]);
      });

      it('when property is null', () => {
        const cwpUseProperty = new propertyClass();
        cwpUseProperty.property = null;

        const saved = cwpUseProperty.savePropertyToSequelize();
        expect(saved.careWorkforcePathwayUse).to.equal(null);
        expect(saved.additionalModels.EstablishmentCWPReasons).to.deep.equal([]);
      });
    });
  });

  describe('isEqual()', () => {
    describe('should return true if both values are equal', () => {
      Object.entries(testValues).forEach(([testValueName, value]) => {
        it(`when value is ${testValueName}`, () => {
          const cwpUseProperty = new propertyClass();
          const result = cwpUseProperty.isEqual(value, cloneDeep(value));

          expect(result).to.deep.equal(true);
        });
      });
    });

    describe('should return false if values are not equal', () => {
      Object.entries(testValues).forEach(([currValueName, currValue]) => {
        Object.entries(testValues).forEach(([newValueName, newValue]) => {
          if (currValueName === newValueName) {
            return;
          }

          it(`current: ${currValueName}, new: ${newValueName}`, () => {
            const cwpUseProperty = new propertyClass();
            const result = cwpUseProperty.isEqual(currValue, newValue);

            expect(result).to.deep.equal(false);
          });
        });
      });
    });

    describe('edge cases', () => {
      it('should return true when use is Yes and reasons are the same but in different order', () => {
        const cwpUseProperty = new propertyClass();
        const currentValue = {
          use: 'Yes',
          reasons: [mockReasons[0], mockReasons[1]],
        };

        const newValue = {
          use: 'Yes',
          reasons: [mockReasons[1], mockReasons[0]],
        };

        const result = cwpUseProperty.isEqual(currentValue, cloneDeep(newValue));

        expect(result).to.deep.equal(true);
      });

      it('should return false when reasons are the same but the "other" text has changed', () => {
        const cwpUseProperty = new propertyClass();
        const currentValue = {
          use: 'Yes',
          reasons: [mockReasons[0], mockReasons[1], { id: 10, isOther: true, other: 'apple' }],
        };

        const newValue = {
          use: 'Yes',
          reasons: [mockReasons[0], mockReasons[1], { id: 10, isOther: true, other: 'banana' }],
        };

        const result = cwpUseProperty.isEqual(currentValue, cloneDeep(newValue));

        expect(result).to.deep.equal(false);
      });
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON for the property', () => {
      const cwpUseProperty = new propertyClass();
      cwpUseProperty.property = testValues.yes_with_reasons;

      const json = cwpUseProperty.toJSON();

      expect(json).to.deep.equal({
        careWorkforcePathwayUse: {
          use: 'Yes',
          reasons: testValues.yes_with_reasons.reasons,
        },
      });
    });

    it('should handle the case when property is null', () => {
      const cwpUseProperty = new propertyClass();
      cwpUseProperty.property = null;

      const json = cwpUseProperty.toJSON();

      expect(json).to.deep.equal({ careWorkforcePathwayUse: null });
    });
  });
});
