const expect = require('chai').expect;
const {
  formatTrainingRecords,
  getMandatoryAndNonMandatoryTraining,
  getTrainingCategories,
  formatJobRoleMandatoryTraining,
} = require('../../../utils/trainingRecordsUtils');
const { mockFormattedTraining, mockTrainingRecords, mockMandatoryTraining } = require('../mockdata/training');

describe('trainingRecordsUtils', () => {
  describe('formatTrainingRecords', () => {
    it('should return the data formatted, with empty mandatory array', async () => {
      const trainingRecords = { training: mockTrainingRecords };
      const mandatoryTraining = [];

      const formattedTraining = formatTrainingRecords(trainingRecords, mandatoryTraining);

      expect(formattedTraining.mandatory.length).to.equal(0);
      expect(formattedTraining.nonMandatory.length).to.equal(3);
      expect(formattedTraining).to.deep.equal({
        mandatory: [],
        nonMandatory: mockFormattedTraining,
      });
    });

    it('should return the data formatted, with results in mandatory array and non-mandatory array', async () => {
      const trainingRecords = { training: mockTrainingRecords };
      const mandatoryTraining = [{ trainingCategoryFK: 1 }, { trainingCategoryFK: 3 }];

      const formattedTraining = formatTrainingRecords(trainingRecords, mandatoryTraining);

      expect(formattedTraining.mandatory.length).to.equal(2);
      expect(formattedTraining.nonMandatory.length).to.equal(1);
      expect(formattedTraining).to.deep.equal({
        mandatory: [mockFormattedTraining[0], mockFormattedTraining[2]],
        nonMandatory: [mockFormattedTraining[1]],
      });
    });

    it('should return the data formatted, with results just in mandatory array when no non-mandatory training', async () => {
      const trainingRecords = { training: mockTrainingRecords };
      const mandatoryTraining = [{ trainingCategoryFK: 1 }, { trainingCategoryFK: 2 }, { trainingCategoryFK: 3 }];

      const formattedTraining = formatTrainingRecords(trainingRecords, mandatoryTraining);

      expect(formattedTraining.mandatory.length).to.equal(3);
      expect(formattedTraining.nonMandatory.length).to.equal(0);
      expect(formattedTraining).to.deep.equal({
        mandatory: mockFormattedTraining,
        nonMandatory: [],
      });
    });
  });

  describe('getMandatoryAndNonMandatoryTraining', () => {
    describe('when there is no mandatory training', () => {
      it('it should return an empty mandatory training array with all training in the non-mandatory array', () => {
        const trainingRecords = { training: mockTrainingRecords };
        const mandatoryTraining = [];
        const { mandatoryTrainingRecords, nonMandatoryTrainingRecords } = getMandatoryAndNonMandatoryTraining(
          trainingRecords,
          mandatoryTraining,
        );

        expect(mandatoryTrainingRecords.length).to.equal(0);
        expect(nonMandatoryTrainingRecords.length).to.equal(4);
      });

      it('should return 2 empty arrays', () => {
        const trainingRecords = { training: [] };
        const mandatoryTraining = [];
        const { mandatoryTrainingRecords, nonMandatoryTrainingRecords } = getMandatoryAndNonMandatoryTraining(
          trainingRecords,
          mandatoryTraining,
        );

        expect(mandatoryTrainingRecords.length).to.equal(0);
        expect(nonMandatoryTrainingRecords.length).to.equal(0);
      });
    });

    describe('when there is mandatory training', () => {
      it('should return an array with mandatory training, and an array with non-mandatory training', () => {
        const trainingRecords = { training: mockTrainingRecords };
        const mandatoryTraining = [{ trainingCategoryFK: 1 }, { trainingCategoryFK: 3 }];
        const { mandatoryTrainingRecords, nonMandatoryTrainingRecords } = getMandatoryAndNonMandatoryTraining(
          trainingRecords,
          mandatoryTraining,
        );

        expect(mandatoryTrainingRecords.length).to.equal(2);
        expect(nonMandatoryTrainingRecords.length).to.equal(2);
      });

      it('and no non mandatory trainging,should return an array with mandatory training, and an empty array with non-mandatory training', () => {
        const trainingRecords = { training: mockTrainingRecords };
        const mandatoryTraining = [{ trainingCategoryFK: 1 }, { trainingCategoryFK: 2 }, { trainingCategoryFK: 3 }];
        const { mandatoryTrainingRecords, nonMandatoryTrainingRecords } = getMandatoryAndNonMandatoryTraining(
          trainingRecords,
          mandatoryTraining,
        );

        expect(mandatoryTrainingRecords.length).to.equal(4);
        expect(nonMandatoryTrainingRecords.length).to.equal(0);
      });
    });
  });

  describe('getTrainingCategories', () => {
    it('returns the categories in the training array', () => {
      const trainingCategories = getTrainingCategories(mockTrainingRecords);

      expect(trainingCategories.length).to.equal(3);
      expect(trainingCategories).to.deep.equal(mockFormattedTraining);
      expect(trainingCategories[0].trainingRecords.length).to.equal(1);
      expect(trainingCategories[1].trainingRecords.length).to.equal(2);
      expect(trainingCategories[2].trainingRecords.length).to.equal(1);
    });
  });

  describe('formatJobRoleMandatoryTraining', () => {
    it('should return an array with the mandatory training for a role formatted', async () => {
      const formattedMandatoryTraining = formatJobRoleMandatoryTraining(mockMandatoryTraining);

      expect(formattedMandatoryTraining.length).to.equal(3);
      expect(formattedMandatoryTraining).to.deep.equal([
        { id: 1, category: 'Communication' },
        { id: 2, category: 'Coshh' },
        { id: 3, category: 'Hazards' },
      ]);
    });

    it('should return an empty array if there is no mandatory training for the job role', async () => {
      const formattedMandatoryTraining = formatJobRoleMandatoryTraining([]);

      expect(formattedMandatoryTraining.length).to.equal(0);
    });
  });
});
