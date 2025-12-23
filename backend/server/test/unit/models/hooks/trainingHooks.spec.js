const expect = require('chai').expect;

const { ensureProviderInfoCorrect } = require('../../../../models/hooks/trainingHooks');

describe('TrainingCourse/TrainingRecord sequelize hooks', () => {
  describe('beforeSave: ensureProviderInfoCorrect', () => {
    describe('when deliveredBy is not "External provider"', () => {
      ['In-house staff', null].forEach((deliveredByValue) => {
        it(`should clear the trainingProviderFk and otherTrainingProviderName if deliveredBy is "${deliveredByValue}"`, async () => {
          const mockTrainingCourse = {
            trainingProviderFk: 63,
            otherTrainingProviderName: 'Care skill academy',
            deliveredBy: deliveredByValue,
          };

          await ensureProviderInfoCorrect(mockTrainingCourse);

          expect(mockTrainingCourse.otherTrainingProviderName).to.equal(null);
          expect(mockTrainingCourse.trainingProviderFk).to.equal(null);
        });
      });
    });

    describe('when deliveredBy is "External provider"', () => {
      it('should keep the trainingProviderFk and otherTrainingProviderName if training provider is "other" ', async () => {
        const mockTrainingCourse = {
          trainingProviderFk: 63,
          otherTrainingProviderName: 'Some other unlisted provider',
          deliveredBy: 'External provider',
          getTrainingProvider: () => ({
            id: 63,
            name: 'other',
            isOther: true,
          }),
        };

        await ensureProviderInfoCorrect(mockTrainingCourse);

        expect(mockTrainingCourse.otherTrainingProviderName).to.equal('Some other unlisted provider');
        expect(mockTrainingCourse.trainingProviderFk).to.equal(63);
      });

      it('should clear the otherTrainingProviderName and keep trainingProviderFk if training provider is not "other" ', async () => {
        const mockTrainingCourse = {
          trainingProviderFk: 1,
          otherTrainingProviderName: 'Some other unlisted provider',
          deliveredBy: 'External provider',
          getTrainingProvider: () => ({
            id: 1,
            name: 'Care skill academy',
            isOther: false,
          }),
        };

        await ensureProviderInfoCorrect(mockTrainingCourse);

        expect(mockTrainingCourse.otherTrainingProviderName).to.equal(null);
        expect(mockTrainingCourse.trainingProviderFk).to.equal(1);
      });
    });
  });
});
