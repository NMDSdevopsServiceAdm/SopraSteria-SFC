const expect = require('chai').expect;

const apprenticeshipTrainingPropertyClass = require('../../../../../../models/classes/worker/properties/apprenticeshipTrainingProperty')
  .WorkerApprenticeshipTrainingProperty;
const values = ['Yes', 'No', "Don't know", null];

describe('apprenticeshipTraining Property', () => {
  it('should allow null', () => {
    const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();

    expect(apprenticeshipTrainingProperty._allowNull).to.deep.equal(true);
  });
  describe('restoreFromJson()', async () => {
    await Promise.all(
      values.map(async (value) => {
        it('should return with correct value for ' + value, async () => {
          const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();
          const document = {
            apprenticeshipTraining: value,
          };
          await apprenticeshipTrainingProperty.restoreFromJson(document);
          expect(apprenticeshipTrainingProperty.property).to.deep.equal(value);
        });
      }),
    );
    it("shouldn't return anything if undefined", async () => {
      const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();
      const document = {};
      await apprenticeshipTrainingProperty.restoreFromJson(document);
      expect(apprenticeshipTrainingProperty.property).to.deep.equal(null);
    });
  });
  describe('restorePropertyFromSequelize()', async () => {
    await Promise.all(
      values.map(async (value) => {
        it('should return with correct value for ' + value, async () => {
          const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();
          const document = {
            ApprenticeshipTrainingValue: value,
          };
          const apprenticeship = await apprenticeshipTrainingProperty.restorePropertyFromSequelize(document);
          expect(apprenticeship).to.deep.equal(value);
        });
      }),
    );
    it("shouldn't return anything if undefined", async () => {
      const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();
      const document = {};
      const apprenticeship = await apprenticeshipTrainingProperty.restorePropertyFromSequelize(document);
      expect(apprenticeship).to.deep.equal(undefined);
    });
  });
  describe('savePropertyToSequelize()', async () => {
    await Promise.all(
      values.map(async (value) => {
        it('should save in correct format as if saving into database for ' + value, () => {
          const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();
          const apprenticeshipTraining = {
            ApprenticeshipTrainingValue: value,
          };
          apprenticeshipTrainingProperty.property = apprenticeshipTraining;
          const saved = apprenticeshipTrainingProperty.savePropertyToSequelize();
          expect(saved.ApprenticeshipTrainingValue).to.equal(apprenticeshipTraining);
        });
      }),
    );
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();

      const equal = apprenticeshipTrainingProperty.isEqual(values[0], values[0]);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are not equal', () => {
      const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();

      const equal = apprenticeshipTrainingProperty.isEqual(values[0], values[1]);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    values.map((value) => {
      it('should return correctly formatted JSON for ' + value, () => {
        const apprenticeshipTrainingProperty = new apprenticeshipTrainingPropertyClass();
        const otherJobs = {
          apprenticeshipTraining: value,
        };
        apprenticeshipTrainingProperty.property = otherJobs;
        const json = apprenticeshipTrainingProperty.toJSON();
        expect(json.apprenticeshipTraining.value).to.deep.equal(otherJobs.value);
      });
    });
  });
});
