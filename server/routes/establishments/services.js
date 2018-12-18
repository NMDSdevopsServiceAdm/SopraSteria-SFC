const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');
const ServiceFormatters = require('../../models/api/services');

// parent route defines the "id" parameter

// gets current set of other services for the known establishment
// takes optional query paramter "all" - values 'true' or 'false' (default),which is set, returns 'allServices'
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const includeAllServices = req.query.all && req.query.all === 'true' ? true : false;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'isRegulated'],
      include: [{
        model: models.services,
        as: 'otherServices',
        attributes: ['id', 'name', 'category'],
        order: [
          ['category', 'ASC'],
          ['name', 'ASC']
        ]
      },{
        model: models.services,
        as: 'mainService',
        attributes: ['id', 'name']
      }]
    });

    let allServicesResults = null;
    if (results && results.id && (establishmentId === results.id)) {
      // if the option to return all services is given, then fetch a list of all services available to this establishment
      if (includeAllServices) {
        if (results.isRegulated) {
          allServicesResults = await models.services.findAll({
            where: {
              iscqcregistered: true
            },
            order: [
              ['category', 'ASC'],
              ['name', 'ASC']
            ]
          });
        } else {
          allServicesResults = await models.services.findAll({
            order: [
              ['category', 'ASC'],
              ['name', 'ASC']
            ]
          });  
        }

        if (allServicesResults) {
          results.allServices = mergeServices(allServicesResults, results.otherServices, results.mainService);
        }
    
      }
  
      res.status(200);
      return res.json(formatOtherServicesResponse(results));
    } else {
      return res.status(404).send('Not found');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::otherSerives GET - failed', err);
    return res.status(503).send(`Unable to retrive Establishment: ${req.params.id}`);
  }
});

// updates the current set of other services for the known establishment
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const newServices = req.body.services;

  // validate input
  if (!newServices || !Array.isArray(newServices)) {
    console.error('establishment::otherSerives POST - unexpected input: ', newServices);
    return res.status(400).send('Expected (new) services as JSON');
  }

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'isRegulated']
    });

    if (results && results.id && (establishmentId === results.id)) {
      // we have found the establishment

      // get the set of all services that can be associated with this establishment
      let allServicesResults = null;
      if (results.isRegulated) {
        allServicesResults = await models.services.findAll({
          where: {
            iscqcregistered: true
          },
          order: [
            ['category', 'ASC'],
            ['name', 'ASC']
          ]
        });
      } else {
        allServicesResults = await models.services.findAll({
          order: [
            ['category', 'ASC'],
            ['name', 'ASC']
          ]
        });  
      }

      if (allServicesResults) {
        // within a transaction first delete all existing 'other services', before creating new ones
        await models.sequelize.transaction(async t => {
          let deleteAllExisting = await models.establishmentServices.destroy({
            where: {
              establishmentId
            }
          });

          // create new service associations
          let newServicesPromises = [];
          newServices.forEach(thisNewService => {
            if (thisNewService && thisNewService.id && parseInt(thisNewService.id) === thisNewService.id) {
              // ensure this suggested service is allowed for this given Establishment
              const isValidService = allServicesResults.find(refService => refService.id === thisNewService.id);

              if (isValidService) {
                newServicesPromises.push(models.establishmentServices.create({
                  establishmentId,
                  serviceId: thisNewService.id
                }));  
              }
            }
          })
          await Promise.all(newServicesPromises);
        });

        res.status(200);
        //return res.json(formatOtherServicesResponse(results));
        return res.send('success');

      } else {
        console.error('establishment::otherSerives POST - failed to retrieve all associated services');
        return res.status(503).send(`Unable to update Establishment: ${establishmentId}`);
      }
      
    } else {
      console.error('establishment::otherSerives POST - Not found establishment having id: ${establishmentId}');
      return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::otherSerives POST - failed', err);
    return res.status(503).send(`Unable to update Establishment with employer type: ${req.params.id}/${givenEmployerType}`);
  }
});


const formatOtherServicesResponse = (establishment) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes
  return {
    id: establishment.id,
    name: establishment.name,
    mainService: ServiceFormatters.singleService(establishment.mainService),
    otherServices: ServiceFormatters.createServicesByCategoryJSON(establishment.otherServices, false, false, false),
    allServices: ServiceFormatters.createServicesByCategoryJSON(establishment.allServices, false, false, true),
  };
}

// this method takes all services available to this given establishment and merges those services already registered
//  against this Establishment, whilst also removing the main service
const mergeServices = (allServices, theseServices, mainService) => {
  // its a simple case of working through each of "theseServices", and setting the "isMyService"
  if (theseServices && Array.isArray(theseServices)) {
    theseServices.forEach(thisService => {
      // find and update the corresponding service in allServices
      let foundService = allServices.find(refService => refService.id === thisService.id );
      if (foundService) {
        foundService.isMyService = true;

      }
    });
  }

  // now remove the main service
  return allServices.filter(refService => refService.id !== mainService.id );
};

module.exports = router;