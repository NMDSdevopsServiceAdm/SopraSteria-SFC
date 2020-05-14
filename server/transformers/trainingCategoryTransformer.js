const transformTrainingCategories = function (givenCategories) {
  return givenCategories.map((thisCategory) => {
    return {
      id: thisCategory.id,
      seq: thisCategory.seq,
      category: thisCategory.category,
    };
  });
};

const transformTrainingCategoriesWithMandatoryTraining = function (establishment, trainingCategories) {
  return trainingCategories
    .map((trainingCategory) => {
      let training = [];

      establishment.workers.forEach((worker) => {
        let workerTraining = worker.workerTraining
          .filter((workerTraining) => {
            return workerTraining.categoryFk == trainingCategory.id;
          })
          .map((workerTraining) => {
            return {
              id: workerTraining.id,
              uid: workerTraining.uid,
              title: workerTraining.title,
              expires: workerTraining.expires,
              worker: {
                id: worker.id,
                uid: worker.uid,
                NameOrIdValue: worker.NameOrIdValue,
                mainJob: {
                  id: worker.mainJob.id,
                  title: worker.mainJob.title,
                },
              },
            };
          });

        training = training.concat(workerTraining);

        if (trainingCategory.MandatoryTraining !== undefined && trainingCategory.MandatoryTraining.length > 0) {
          let missingTraining = [];

          missingTraining = trainingCategory.MandatoryTraining.filter((mandatoryTraining) => {
            if (worker.mainJob !== undefined && worker.mainJob.id !== mandatoryTraining.jobFK) {
              return false;
            }

            return (
              worker.workerTraining.filter((workerTraining) => {
                return workerTraining.categoryFk == mandatoryTraining.trainingCategoryFK;
              }).length == 0
            );
          }).map((missingTraining) => {
            return {
              id: missingTraining.id,
              missing: true,
              worker: {
                id: worker.id,
                uid: worker.uid,
                NameOrIdValue: worker.NameOrIdValue,
                mainJob: {
                  id: worker.mainJob.id,
                  title: worker.mainJob.title,
                },
              },
            };
          });

          training = training.concat(missingTraining);
        }
      });

      return {
        id: trainingCategory.id,
        seq: trainingCategory.seq,
        category: trainingCategory.category,
        training: training,
      };
    })
    .filter((trainingCategory) => {
      return trainingCategory.training.length > 0;
    });
};

module.exports.transformTrainingCategories = transformTrainingCategories;
module.exports.transformTrainingCategoriesWithMandatoryTraining = transformTrainingCategoriesWithMandatoryTraining;
