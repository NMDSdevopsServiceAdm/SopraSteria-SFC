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
      }
    ]
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
          results.allServices = mergeServices(allServicesResults, results.otherServices);
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
    res.status(503).send(`Unable to retrive Establishment: ${req.params.id}`);
  }
});

// updates the current set of other services for the known establishment
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    // let results = await models.establishment.findOne({
    //   where: {
    //     id: establishmentId
    //   },
    //   attributes: ['id', 'name', 'employerType']
    // });

    // if (results && results.id && (establishmentId === results.id)) {
    //   // we have found the establishment, update the employer type
    //   const newResults = await results.update({
    //     //name: 'Warren Ayling'
    //     employerType: givenEmployerType
    //   });
      
    //   res.status(200);
    //   return res.json(formatOtherServicesResponse(results));
    // } else {
    //   console.error('establishment::otherSerives POST - Not found establishment having id: ${establishmentId}', err);
    //   return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
    // }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::otherSerives POST - failed', err);
    res.status(503).send(`Unable to update Establishment with employer type: ${req.params.id}/${givenEmployerType}`);
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
//  against this Establishment
const mergeServices = (allServices, theseServices) => {
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

  //return mergedServices;
  return allServices;
};

module.exports = router;