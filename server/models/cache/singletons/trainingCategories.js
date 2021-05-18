const models = require('../..');

let ALL_TRAINING_CATEGORIES = [];

class TrainingCategoriesCache {
  constructor() {}

  static async initialize() {
    const trainingCategories = await models.workerTrainingCategories.findAll({
      order: [['seq', 'ASC']],
    });

    ALL_TRAINING_CATEGORIES = trainingCategories;
  }

  static allTrainingCategories() {
    // if not undefined
    return ALL_TRAINING_CATEGORIES;
  }
}

if (models.status.ready) {
  TrainingCategoriesCache.initialize()
    .then()
    .catch((err) => {
      console.error('Failed to initialise TrainingCategoriesCache: ', err);
    });
} else {
  models.status.on(models.status.READY_EVENT, () => {
    // initialising BUDI
    TrainingCategoriesCache.initialize()
      .then()
      .catch((err) => {
        console.error('Failed to initialise TrainingCategoriesCache: ', err);
      });
  });
}

exports.TrainingCategoriesCache = TrainingCategoriesCache;
