var express = require('express');
var router = express.Router();
const models = require('../models/index');
const trainingCategoryTransformer = require('../transformers/trainingCategoryTransformer');

/* GET ALL Training Categories */
router.route('/').get(async function (req, res) {
  try {
    let results = await models.workerTrainingCategories.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      trainingCategories: trainingCategoriesJSON(results),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

const getTrainingByCategory = async (req, res) => {
  try {
    const establishmentId = req.params.establishmentId;

    let establishment = await models.establishment.findWithWorkersAndTraining(establishmentId);
    if (!establishment) {
      return res.sendStatus(404);
    }

    let trainingCategories = await models.workerTrainingCategories.findAllWithMandatoryTraining(establishmentId);

    res.json({
      trainingCategories: trainingCategoryTransformer(establishment, trainingCategories),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
}

router.route('/:establishmentId/with-training').get(getTrainingByCategory);

function trainingCategoriesJSON(givenCategories) {
  let categories = [];

  //Go through any results found from DB and map to JSON
  givenCategories.forEach(thisCategory => {
    categories.push({
      id: thisCategory.id,
      seq: thisCategory.seq,
      category: thisCategory.category,
    });
  });

  return categories;
}

module.exports = router;
module.exports.getTrainingByCategory = getTrainingByCategory;
