const express = require('express');
const router = express.Router();
const cacheMiddleware = require('../utils/middleware/noCache');
const refCacheMiddleware = require('../utils/middleware/refCache');
const models = require('../models/index');
const {
  transformTrainingCategories,
  transformTrainingCategoriesWithMandatoryTraining,
  transformTrainingForACategory,
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
    const { establishmentId, trainingId } = req.params;
    const { itemsPerPage, pageIndex, sortBy, searchTerm } = req.query;
    const isMandatory = await models.MandatoryTraining.checkIfTrainingCategoryIsMandatory(establishmentId, trainingId);

    let response;
    if (isMandatory) {
      console.log(isMandatory);
      return;
    } else {
      response = await models.establishment.fetchWorkerTrainingRecordsForACategory(
        establishmentId,
        trainingId,
        itemsPerPage && +itemsPerPage,
        pageIndex && +pageIndex,
        sortBy,
        searchTerm,
      );
    }
    const rows = response.rows;
    const category = rows[0].get('category');
    const foundWorkers = rows.length && rows[0].workers;
    const trainingCount = response.count;
    const transformedTraining = transformTrainingForACategory(foundWorkers);
    res.json({ training: transformedTraining, category, trainingCount });
  } catch (error) {
    console.error(error);
  }
};

router.route('/').get([refCacheMiddleware.refcache, getAllTraining]);
router.route('/:establishmentId/with-training').get([cacheMiddleware.nocache, getTrainingByCategory]);
router.route('/:establishmentId/:trainingId').get([cacheMiddleware.nocache], getCategoryTraining);
module.exports = router;
module.exports.getTrainingByCategory = getTrainingByCategory;
