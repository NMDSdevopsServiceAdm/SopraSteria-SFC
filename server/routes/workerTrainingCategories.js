var express = require('express');
var router = express.Router();
const models = require('../models/index');

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

router.route('/:establishmentId/with-training').get(async function (req, res) {
  try {
    let establishment = await models.establishment.findByPk(req.params.establishmentId, {
      attributes: ['id'],
      include: {
        model: models.worker,
        attributes: ['id', 'uid', 'NameOrIdValue'],
        as: 'workers',
        where: {
          archived: false,
        },
        include: [
          {
            model: models.job,
            as: 'mainJob',
            attributes: ['id', 'title'],
            required: false,
          },
          {
            model: models.workerTraining,
            as: 'workerTraining',
            attributes: ['id', 'uid', 'title', 'expires', 'categoryFk'],
          },
        ],
      },
    });

    let trainingCategories = await models.workerTrainingCategories.findAll({
      include: [
        {
          model: models.MandatoryTraining,
          as: 'MandatoryTraining',
          where: {
            EstablishmentFK: req.params.establishmentId,
          },
          required: false,
        },
      ],
    });

    let results = trainingCategories.map((trainingCategory) => {
      let training = []

      establishment.workers.forEach((worker) => {
        let workerTraining = worker.workerTraining.filter((workerTraining) => {
          return workerTraining.categoryFk == trainingCategory.id
        }).map(workerTraining => {
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
          }
        });

        training = training.concat(workerTraining);

        if (trainingCategory.MandatoryTraining.length) {
          let missingTraining = [];

          missingTraining = trainingCategory.MandatoryTraining.filter(mandatoryTraining => {
            if (worker.mainJob !== undefined && (worker.mainJob.id !== mandatoryTraining.jobFK)) {
              return false;
            }

            return worker.workerTraining.filter((workerTraining) => {
              return workerTraining.categoryFk == mandatoryTraining.trainingCategoryFK
            }).length == 0;
          }).map(missingTraining => {
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
    }).filter(trainingCategory => {
      return trainingCategory.training.length > 0;
    });

    res.send({
      trainingCategories: results,
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

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
