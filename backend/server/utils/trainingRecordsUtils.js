const formatTrainingRecords = (trainingRecords, mandatoryTrainingForWorker) => {
  const { mandatoryTrainingRecords, nonMandatoryTrainingRecords } = getMandatoryAndNonMandatoryTraining(
    trainingRecords,
    mandatoryTrainingForWorker,
  );

  const formattedMandatoryRecords = getTrainingCategories(mandatoryTrainingRecords);
  const formattedNonMandatoryRecords = getTrainingCategories(nonMandatoryTrainingRecords);

  const formattedTrainingRecords = {
    mandatory: formattedMandatoryRecords,
    nonMandatory: formattedNonMandatoryRecords,
  };

  return formattedTrainingRecords;
};

const getMandatoryAndNonMandatoryTraining = (trainingRecords, mandatoryTrainingForWorker) => {
  const mandatoryTrainingRecords = [];
  const nonMandatoryTrainingRecords = [];

  const mandatoryTrainingCategoryIdArray = mandatoryTrainingForWorker.map((mandatoryTraining) => {
    return mandatoryTraining.trainingCategoryFK;
  });

  trainingRecords.training.forEach((training) => {
    if (mandatoryTrainingCategoryIdArray.length === 0) {
      nonMandatoryTrainingRecords.push(training);
    } else {
      if (mandatoryTrainingCategoryIdArray.includes(training.trainingCategory.id)) {
        mandatoryTrainingRecords.push(training);
      } else {
        nonMandatoryTrainingRecords.push(training);
      }
    }
  });
  return { mandatoryTrainingRecords, nonMandatoryTrainingRecords };
};

const getTrainingCategories = (trainingRecords) => {
  const categories = trainingRecords.reduce((accumulator, current) => {
    if (!accumulator.some((training) => training.id === current.trainingCategory.id)) {
      accumulator.push(current.trainingCategory);
    }
    return accumulator;
  }, []);

  const formattedCategories = categories.map((category) => {
    const categoryTraining = trainingRecords.filter(
      (trainingRecord) => trainingRecord.trainingCategory.id === category.id,
    );
    return {
      category: category.category,
      id: category.id,
      trainingRecords: categoryTraining,
    };
  });

  return formattedCategories;
};

const formatJobRoleMandatoryTraining = (mandatoryTrainingForWorker) => {
  return mandatoryTrainingForWorker.map((training) => {
    return {
      id: training.workerTrainingCategories.id,
      category: training.workerTrainingCategories.category,
    };
  });
};

module.exports.formatTrainingRecords = formatTrainingRecords;
module.exports.getMandatoryAndNonMandatoryTraining = getMandatoryAndNonMandatoryTraining;
module.exports.getTrainingCategories = getTrainingCategories;
module.exports.formatJobRoleMandatoryTraining = formatJobRoleMandatoryTraining;
