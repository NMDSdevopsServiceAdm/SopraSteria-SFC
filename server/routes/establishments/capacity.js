const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');
const CapacityFormatters = require('../../models/api/capacity');
const ServiceFormatters = require('../../models/api/services');

// parent route defines the "id" parameter

// TODO - refactor this API; much of the gets in [GET] endpoint are used in the [POST]

// gets current set of capcities for the known establishment
// takes optional query paramter "all" - values 'true' or 'false' (default), which is set, returns 'allCapacities'
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const includeAllCapacities = req.query.all && req.query.all === 'true' ? true : false;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'isRegulated', 'mainServiceId'],
      include: [{
        model: models.services,
        as: 'mainService',
        attributes: ['id', 'name']
      },{
        model: models.establishmentCapacity,
        as: 'capacity',
        attributes: ['id', 'answer'],
        include: [{
          model: models.serviceCapacity,
          as: 'reference',
          attributes: ['id', 'question']
        }]
      }]
    });

    let allServiceCapacityQuestions = null;
    if (results && results.id && (establishmentId === results.id)) {
      if (includeAllCapacities) {
        // fetch the main service id and all the associated 'other services' by id only
        const allCapacitiesResults = await models.establishment.findOne({
          where: {
            id: establishmentId
          },
          attributes: ['id'],
          include: [{
            model: models.services,
            as: 'otherServices',
            attributes: ['id'],
          },{
            model: models.services,
            as: 'mainService',
            attributes: ['id']
          }]
        });

        const allAssociatedServiceIndices = [];
        if (allCapacitiesResults && allCapacitiesResults.id) {
          // merge tha main and other service ids
          if (allCapacitiesResults.mainService.id) {
            allAssociatedServiceIndices.push(allCapacitiesResults.mainService.id);
          }
          // TODO: there is a much better way to derference (transpose) the id on an Array of objects
          //  viz. Map
          if (allCapacitiesResults.otherServices) {
            allCapacitiesResults.otherServices.forEach(thisService => allAssociatedServiceIndices.push(thisService.id));
          }
        }

        // now fetch all the questions for the given set of combined services
        if (allAssociatedServiceIndices.length > 0) {
          allServiceCapacityQuestions = await models.serviceCapacity.findAll({
            where: {
              serviceId: allAssociatedServiceIndices
            },
            attributes: ['id', 'seq', 'question'],
            order: [
              ['seq', 'ASC']
            ],
            include: [{
              model: models.services,
              as: 'service',
              attributes: ['id', 'category', 'name'],
              order: [
                ['category', 'ASC'],
                ['name', 'ASC']
              ]
            }]
          });

        }
      }

      res.status(200);
      return res.json(formatCapacityResponse(results, allServiceCapacityQuestions));
    } else {
      return res.status(404).send('Not found');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::capacity GET - failed', err);
    return res.status(503).send(`Unable to retrive Establishment: ${req.params.id}`);
  }
});

// updates the current set of other services for the known establishment
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const newCapacities = req.body.capacities;

   // validate input
  if (!newCapacities || !Array.isArray(newCapacities)) {
    console.error('establishment::capacity POST - unexpected input: ', newCapacities);
    return res.status(400).send('Expected (new) capabilities as JSON');
  }

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'isRegulated', 'mainServiceId'],
      include: [{
        model: models.services,
        as: 'mainService',
        attributes: ['id', 'name']
      },{
        model: models.establishmentCapacity,
        as: 'capacity',
        attributes: ['id', 'answer'],
        include: [{
          model: models.serviceCapacity,
          as: 'reference',
          attributes: ['id', 'question']
        }]
      }]
    });

    let allServiceCapacityQuestions = null;
    if (results && results.id && (establishmentId === results.id)) {
      // fetch the main service id and all the associated 'other services' by id only
      const allCapacitiesResults = await models.establishment.findOne({
        where: {
          id: establishmentId
        },
        attributes: ['id'],
        include: [{
          model: models.services,
          as: 'otherServices',
          attributes: ['id'],
        },{
          model: models.services,
          as: 'mainService',
          attributes: ['id']
        }]
      });

      const allAssociatedServiceIndices = [];
      if (allCapacitiesResults && allCapacitiesResults.id) {
        // merge tha main and other service ids
        if (allCapacitiesResults.mainService.id) {
          allAssociatedServiceIndices.push(allCapacitiesResults.mainService.id);
        }
        // TODO: there is a much better way to derference (transpose) the id on an Array of objects
        //  viz. Map
        if (allCapacitiesResults.otherServices) {
          allCapacitiesResults.otherServices.forEach(thisService => allAssociatedServiceIndices.push(thisService.id));
        }
      }

      // now fetch all the questions for the given set of combined services
      if (allAssociatedServiceIndices.length > 0) {
        allServiceCapacityQuestions = await models.serviceCapacity.findAll({
          where: {
            serviceId: allAssociatedServiceIndices
          },
          attributes: ['id', 'seq', 'question'],
          order: [
            ['seq', 'ASC']
          ],
          include: [{
            model: models.services,
            as: 'service',
            attributes: ['id', 'category', 'name'],
            order: [
              ['category', 'ASC'],
              ['name', 'ASC']
            ]
          }]
        });

      }

      if (allServiceCapacityQuestions) {
        // within a transaction first delete all existing 'capacities', before creating new ones
        await models.sequelize.transaction(async t => {
          let deleteAllExisting = await models.establishmentCapacity.destroy({
            where: {
              establishmentId
            }
          });

          // create new capacity associationss
          let newCapacityPromises = [];
          newCapacities.forEach(thisNewCapability => {
            if (thisNewCapability && thisNewCapability.questionId &&
                parseInt(thisNewCapability.questionId) === thisNewCapability.questionId &&
                thisNewCapability.answer && parseInt(thisNewCapability.answer) === thisNewCapability.answer) {
              // ensure this suggested capability (question) is allowed for this given Establishment
              const isValidService = allServiceCapacityQuestions.find(
                refServiceCapacity => refServiceCapacity.id === thisNewCapability.questionId);

              if (isValidService) {
                newCapacityPromises.push(models.establishmentCapacity.create({
                  establishmentId,
                  serviceCapacityId: thisNewCapability.questionId,
                  answer: thisNewCapability.answer
                }));
              }
            }
          })
          await Promise.all(newCapacityPromises);
        });

        // now refresh the Establishment and return the updated set of other services
        let results = await models.establishment.findOne({
          where: {
            id: establishmentId
          },
          attributes: ['id', 'name', 'isRegulated', 'mainServiceId'],
          include: [{
            model: models.services,
            as: 'mainService',
            attributes: ['id', 'name']
          },{
            model: models.establishmentCapacity,
            as: 'capacity',
            attributes: ['id', 'answer'],
            include: [{
              model: models.serviceCapacity,
              as: 'reference',
              attributes: ['id', 'question']
            }]
          }]
        });
    
        res.status(200);
        return res.json(formatCapacityResponse(results));

      } else {
        console.error('establishment::capacity POST - failed to retrieve all associated service capacities');
        return res.status(503).send(`Unable to update Establishment: ${establishmentId}`);
      }
      
    } else {
      console.error('establishment::capacity POST - Not found establishment having id: ${establishmentId}');
      return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::capacity POST - failed', err);
    return res.status(503).send(`Unable to update Establishment with employer type: ${req.params.id}/${givenEmployerType}`);
  }
});


const formatCapacityResponse = (establishment, serviceCapacities) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes

  // and reformat the service category/name for main service only

  return {
    id: establishment.id,
    name: establishment.name,
    mainService: ServiceFormatters.singleService(establishment.mainService),
    capacities: CapacityFormatters.capacitiesJSON(establishment.capacity),
    allServiceCapacities: CapacityFormatters.serviceCapacitiesByCategoryJSON(
      mergeQuestionsWithAnswers(
        reorderAndReformatMainServiceQuestion(serviceCapacities, establishment.mainServiceId),
          establishment.capacity)
    )
  };
}

const mergeQuestionsWithAnswers = (questions, answers) => {
  if (answers && Array.isArray(answers) && questions && Array.isArray(questions)) {
    answers.forEach(thisAnswer => {
      const foundQuestion = questions.find(thisQuestion => thisQuestion.id == thisAnswer.reference.id);
      if (foundQuestion) {
        foundQuestion.answer = thisAnswer.answer;
      }
    });
  }

  return questions;
}

const reorderAndReformatMainServiceQuestion = (questions, mainServiceId) => {
  let reorderedQuestions = [];
  if (questions && Array.isArray(questions)) {
    // first find any questions associated with the main service ID (if any)
    if (mainServiceId) {
      const mainServiceQuestions = questions.filter(thisQuestion => thisQuestion.service.id === mainServiceId);
      
      if (mainServiceQuestions) {
        // there exists within the set of questions, one or more relating to the main service
        mainServiceQuestions.forEach(thisMainServiceQuestion => {
          thisMainServiceQuestion.service.category = 'Main Service';
          reorderedQuestions.push(thisMainServiceQuestion);
        });
      }

      const nonMainServiceQuestions = questions.filter(thisQuestion => thisQuestion.service.id !== mainServiceId);
      if (nonMainServiceQuestions) {
        reorderedQuestions = reorderedQuestions.concat(nonMainServiceQuestions);
      }
    }
  }

  return reorderedQuestions;
}

module.exports = router;