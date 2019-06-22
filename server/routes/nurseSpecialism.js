var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL ethnicities*/
router.route('/').get(async function (req, res) {
  try {
    let results = await models.workerTrainingCategories.findAll({
        order: [
          ["seq", "ASC"]
        ]
      });

    res.send({
      trainingCategories: trainingCategoriesJSON(results)
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

function trainingCategoriesJSON(givenCategories){
  let categories=[];

  //Go through any results found from DB and map to JSON
  givenCategories.forEach(thisCategory => {
    categories.push({
      id: thisCategory.id,
      seq: thisCategory.seq,
      category: thisCategory.category,
    });
  });

  return categories;
};

module.exports = router;
