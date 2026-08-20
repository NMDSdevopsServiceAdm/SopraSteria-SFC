'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../../models/');
const { MockNurseFieldsOfPractice } = require('../../../../mockdata/nurseFieldOfPractice');

const propertyClass =
  require('../../../../../../models/classes/worker/properties/nurseFieldOfPracticeProperty').NurseFieldOfPracticeProperty;

const mockFields = MockNurseFieldsOfPractice;

describe('nurseFieldOfPracticeProperty', () => {
  describe('restoreFromJson()', () => {
    beforeEach(() => {
      sinon.stub(models.nurseFieldOfPractice, 'findAll').callsFake((queryOption) => {
        const ids = queryOption.where.id;
        return mockFields.filter((field) => ids.includes(field.id));
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should restore the property from a JSON object when nurseFieldOfPractice has more than one field chosen', async () => {
      const nurseFieldProperty = new propertyClass();
      const document = {
        nurseFieldOfPractice: [mockFields[0], mockFields[1]],
      };
      const expectedProperty = [mockFields[0], mockFields[1]];

      await nurseFieldProperty.restoreFromJson(document);

      expect(nurseFieldProperty.property).to.deep.equal(expectedProperty);
    });

    it('should restore the property from a JSON object when nurseFieldOfPractice has just one item', async () => {
      const nurseFieldProperty = new propertyClass();
      const document = {
        nurseFieldOfPractice: [mockFields[0]],
      };

      const expectedProperty = [mockFields[0]];
      await nurseFieldProperty.restoreFromJson(document);

      expect(nurseFieldProperty.property).to.deep.equal(expectedProperty);
    });

    it('should set the property to null when nurseFieldOfPractice is an empty array []', async () => {
      const nurseFieldProperty = new propertyClass();
      const document = {
        nurseFieldOfPractice: [],
      };

      const expectedProperty = null;
      await nurseFieldProperty.restoreFromJson(document);

      expect(nurseFieldProperty.property).to.deep.equal(expectedProperty);
      expect(nurseFieldProperty._notSet).to.equal(false);
    });

    it('should keep the property untouched when incoming document does not have the field nurseFieldOfPractice', async () => {
      const nurseFieldProperty = new propertyClass();

      const document = {};

      await nurseFieldProperty.restoreFromJson(document);

      expect(nurseFieldProperty.property).to.equal(null);
      expect(nurseFieldProperty._notSet).to.equal(true);
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    describe('should restore the property from sequelize establishment object', () => {
      it('when more than one field chosen ', () => {
        const nurseFieldProperty = new propertyClass();
        const sequelizeObject = {
          nurseFieldOfPractice: [mockFields[2], mockFields[3]],
        };

        const expectedProperty = [mockFields[2], mockFields[3]];

        const restored = nurseFieldProperty.restorePropertyFromSequelize(sequelizeObject);
        expect(restored).to.deep.equal(expectedProperty);
      });

      it('when just one field is chosen', () => {
        const nurseFieldProperty = new propertyClass();
        const sequelizeDocument = {
          nurseFieldOfPractice: [mockFields[1]],
        };

        const expectedProperty = [mockFields[1]];

        const restored = nurseFieldProperty.restorePropertyFromSequelize(sequelizeDocument);
        expect(restored).to.deep.equal(expectedProperty);
      });

      it('when the answer in database is empty', () => {
        const nurseFieldProperty = new propertyClass();
        const sequelizeDocument = {
          nurseFieldOfPractice: [],
        };

        const expectedProperty = null;

        const restored = nurseFieldProperty.restorePropertyFromSequelize(sequelizeDocument);
        expect(restored).to.deep.equal(expectedProperty);
      });
    });
  });

  describe('savePropertyToSequelize()', () => {
    describe('should convert the property into correct format for sequelize to save into database', () => {
      it('when more than one field chosen', () => {
        const nurseFieldProperty = new propertyClass();
        nurseFieldProperty.property = [mockFields[0], mockFields[1], mockFields[3]];

        const saved = nurseFieldProperty.savePropertyToSequelize();
        expect(saved.additionalModels.workerNurseFieldsOfPractice).to.deep.equal([
          { nurseFieldOfPracticeID: mockFields[0].id },
          { nurseFieldOfPracticeID: mockFields[1].id },
          { nurseFieldOfPracticeID: mockFields[3].id },
        ]);
      });

      it('when just one field is chosen', () => {
        const nurseFieldProperty = new propertyClass();
        nurseFieldProperty.property = [mockFields[2]];

        const saved = nurseFieldProperty.savePropertyToSequelize();
        expect(saved.additionalModels.workerNurseFieldsOfPractice).to.deep.equal([
          { nurseFieldOfPracticeID: mockFields[2].id },
        ]);
      });

      it('when none of the fields are chosen', () => {
        const nurseFieldProperty = new propertyClass();
        nurseFieldProperty.property = null;

        const saved = nurseFieldProperty.savePropertyToSequelize();
        expect(saved.additionalModels.workerNurseFieldsOfPractice).to.deep.equal([]);
      });
    });
  });

  describe('isEqual()', () => {
    const testCases = [
      {
        currentValue: [],
        newValue: [],
        expected: true,
      },
      {
        currentValue: [mockFields[1]],
        newValue: [mockFields[1]],
        expected: true,
      },
      {
        currentValue: [mockFields[1], mockFields[2]],
        newValue: [mockFields[2], mockFields[1]],
        expected: true,
      },
      {
        currentValue: [mockFields[3], mockFields[2], mockFields[1]],
        newValue: [mockFields[1], mockFields[3], mockFields[2]],
        expected: true,
      },

      {
        currentValue: [mockFields[1]],
        newValue: [],
        expected: false,
      },
      {
        currentValue: [],
        newValue: [mockFields[1]],
        expected: false,
      },
      {
        currentValue: [mockFields[1], mockFields[2]],
        newValue: [mockFields[1]],
        expected: false,
      },
      {
        currentValue: [mockFields[1], mockFields[2]],
        newValue: [],
        expected: false,
      },
      {
        currentValue: [mockFields[1]],
        newValue: [mockFields[2]],
        expected: false,
      },
      {
        currentValue: [mockFields[1]],
        newValue: [mockFields[1], mockFields[2]],
        expected: false,
      },
      {
        currentValue: [mockFields[3], mockFields[2]],
        newValue: [mockFields[1], mockFields[2]],
        expected: false,
      },
      {
        currentValue: [mockFields[3], mockFields[2], mockFields[1]],
        newValue: [mockFields[0], mockFields[3], mockFields[2]],
        expected: false,
      },
    ];

    testCases.forEach((testCase) => {
      const { currentValue, newValue, expected } = testCase;
      it(`should return ${expected} for ${currentValue} - ${newValue}`, () => {
        const nurseFieldProperty = new propertyClass();
        const result = nurseFieldProperty.isEqual(currentValue, newValue);
        expect(result).to.deep.equal(expected);
      });
    });

    // describe('should return true if both values are equal', () => {
    //   Object.entries(mockCwpUseValues).forEach(([testValueName, value]) => {
    //     it(`when value is ${testValueName}`, () => {
    //       const nurseFieldProperty = new propertyClass();
    //       const result = nurseFieldProperty.isEqual(value, cloneDeep(value));
    //       expect(result).to.deep.equal(true);
    //     });
    //   });
    // });
    // describe('should return false if values are not equal', () => {
    //   Object.entries(mockCwpUseValues).forEach(([currValueName, currValue]) => {
    //     Object.entries(mockCwpUseValues).forEach(([newValueName, newValue]) => {
    //       if (currValueName === newValueName) {
    //         return;
    //       }
    //       it(`current: ${currValueName}, new: ${newValueName}`, () => {
    //         const nurseFieldProperty = new propertyClass();
    //         const result = nurseFieldProperty.isEqual(currValue, newValue);
    //         expect(result).to.deep.equal(false);
    //       });
    //     });
    //   });
    // });
    //     describe('edge cases', () => {
    //       it('should return true when use is Yes and reasons are the same but in different order', () => {
    //         const nurseFieldProperty = new propertyClass();
    //         const currentValue = {
    //           use: 'Yes',
    //           reasons: [mockReasons[0], mockReasons[1]],
    //         };
    //         const newValue = {
    //           use: 'Yes',
    //           reasons: [mockReasons[1], mockReasons[0]],
    //         };
    //         const result = nurseFieldProperty.isEqual(currentValue, cloneDeep(newValue));
    //         expect(result).to.deep.equal(true);
    //       });
    //       it('should return false when reasons are the same but the "other" text has changed', () => {
    //         const nurseFieldProperty = new propertyClass();
    //         const currentValue = {
    //           use: 'Yes',
    //           reasons: [mockReasons[0], mockReasons[1], { id: 10, isOther: true, other: 'apple' }],
    //         };
    //         const newValue = {
    //           use: 'Yes',
    //           reasons: [mockReasons[0], mockReasons[1], { id: 10, isOther: true, other: 'banana' }],
    //         };
    //         const result = nurseFieldProperty.isEqual(currentValue, cloneDeep(newValue));
    //         expect(result).to.deep.equal(false);
    //       });
    //     });
    //   });
    //   describe('toJSON()', () => {
    //     it('should return correctly formatted JSON for the property', () => {
    //       const nurseFieldProperty = new propertyClass();
    //       nurseFieldProperty.property = mockCwpUseValues.yes_with_reasons;
    //       const json = nurseFieldProperty.toJSON();
    //       expect(json).to.deep.equal({
    //         nurseFieldOfPractice: {
    //           use: 'Yes',
    //           reasons: mockCwpUseValues.yes_with_reasons.reasons,
    //         },
    //       });
    //     });
    //     it('should handle the case when property is null', () => {
    //       const nurseFieldProperty = new propertyClass();
    //       nurseFieldProperty.property = null;
    //       const json = nurseFieldProperty.toJSON();
    //       expect(json).to.deep.equal({ nurseFieldOfPractice: null });
    //     });
  });
});
