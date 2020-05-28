const express = require('express');
const router = express.Router();
const cacheMiddleware = require('../utils/middleware/noCache');
const refCacheMiddleware = require('../utils/middleware/refCache');
const models = require('../models/index');
const {
  transformTrainingCategories,
  transformTrainingCategoriesWithMandatoryTraining,
} = require('../transformers/trainingCategoryTransformer');

const getAllTraining = async function (_req, res) {
  try {
    let results = await models.workerTrainingCategories.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      trainingCategories: transformTrainingCategories(results),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
};

const getTrainingByCategory = async (req, res) => {
  try {
    const establishmentId = req.params.establishmentId;

    let establishment = await models.establishment.findWithWorkersAndTraining(establishmentId);
    if (!establishment) {
      return res.status(404).json({
        message: 'Establishment was not found.',
      });
    }

    let trainingCategories = await models.workerTrainingCategories.findAllWithMandatoryTraining(establishmentId);

    res.json({
      trainingCategories: transformTrainingCategoriesWithMandatoryTraining(establishment, trainingCategories),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
};

router.route('/').get([refCacheMiddleware.refcache, getAllTraining]);
router.route('/:establishmentId/with-training').get([cacheMiddleware.nocache, getTrainingByCategory]);

module.exports = router;
module.exports.getTrainingByCategory = getTrainingByCategory;
