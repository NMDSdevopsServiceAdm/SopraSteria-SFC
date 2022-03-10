const models = require('../..');
const { ready } = require('./ready');

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

ready(models, TrainingCategoriesCache, 'TrainingCategoriesCache');

exports.TrainingCategoriesCache = TrainingCategoriesCache;
