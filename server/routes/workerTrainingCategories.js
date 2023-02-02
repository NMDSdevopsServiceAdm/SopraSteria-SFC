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
    const results = await models.workerTrainingCategories.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      trainingCategories: transformTrainingCategories(results),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json();
  }
};

const getTrainingByCategory = async (req, res) => {
  try {
    const establishmentId = req.params.establishmentId;

    const establishmentWithWorkersAndTraining = await models.establishment.findWithWorkersAndTraining(establishmentId);
    if (establishmentWithWorkersAndTraining === null) {
      return res.json({
        trainingCategories: [],
      });
    }

    const trainingCategories = await models.workerTrainingCategories.findAllWithMandatoryTraining(establishmentId);

    res.json({
      trainingCategories: transformTrainingCategoriesWithMandatoryTraining(
        establishmentWithWorkersAndTraining,
        trainingCategories,
      ),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json();
  }
};

const getCategoryTraining = async (req, res) => {
  try {
    const { establishmentId, trainingCategoryId } = req.params;
    const { itemsPerPage, pageIndex, sortBy, searchTerm } = req.query;

    if (!establishmentId || !trainingCategoryId) {
      return res.status(400).send();
    }

    const isMandatory = !!(await models.MandatoryTraining.checkIfTrainingCategoryIsMandatory(
      establishmentId,
      trainingCategoryId,
    ));

    console.log('***********************');
    console.log(sortBy);

    const {
      count: trainingCount,
      rows: training,
      category,
    } = await models.workerTraining.fetchTrainingByCategoryForEstablishment(
      establishmentId,
      trainingCategoryId,
      itemsPerPage && +itemsPerPage,
      pageIndex && +pageIndex,
      sortBy,
      searchTerm,
      isMandatory,
    );

    return res.status(200).json({ training, trainingCount, category: category.category, isMandatory });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').get([refCacheMiddleware.refcache, getAllTraining]);
router.route('/:establishmentId/with-training').get([cacheMiddleware.nocache, getTrainingByCategory]);
router.route('/:establishmentId/:trainingCategoryId').get([cacheMiddleware.nocache], getCategoryTraining);

module.exports = router;
module.exports.getTrainingByCategory = getTrainingByCategory;
module.exports.getCategoryTraining = getCategoryTraining;
