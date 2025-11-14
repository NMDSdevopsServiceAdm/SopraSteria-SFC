const ensureProviderInfoCorrect = async (trainingCourse, _option) => {
  try {
    if (trainingCourse.deliveredBy !== 'External provider') {
      trainingCourse.trainingProviderFk = null;
      trainingCourse.otherTrainingProviderName = null;
      return;
    }

    const trainingProvider = await trainingCourse.getTrainingProvider();
    if (trainingProvider && !trainingProvider.isOther) {
      trainingCourse.otherTrainingProviderName = null;
    }
  } catch (err) {
    console.error('error occurred while running sequelize hook', err);
  }
};

module.exports = { ensureProviderInfoCorrect };
