const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');
const ServiceFormatters = require('../../models/api/services');

const Establishment = require('../../models/classes/establishment');
const filteredProperties = ['OtherServices'];

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  
  console.log("WA DEBUG - establishment id: ", establishmentId)

  const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  // validating establishment id - must be a V4 UUID or it's an id
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  let byUUID = null, byID = null;
  if (typeof establishmentId === 'string' && uuidRegex.test(establishmentId.toUpperCase())) {
    byUUID = establishmentId;
  } else if (Number.isInteger(establishmentId)) {
    byID = parseInt(escape(establishmentId));
  } else {
    // unexpected establishment id
    return res.status(400).send();
  }

  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(byID, byUUID, showHistory)) {
      // show only brief info on Establishment

      console.log("WA DEBUG - invoking establishment::toJSON")
      return res.status(200).json(thisEstablishment.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false, false, filteredProperties));
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }

  } catch (err) {
    const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
      thisEstablishment.id,
      thisEstablishment.uid,
      null,
      err,
      null,
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`);

    console.error('establishment::services GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
});

// updates the current set of other services for the known establishment
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;

  // validating establishment id - must be a V4 UUID or it's an id
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  let byUUID = null, byID = null;
  if (typeof establishmentId === 'string' && uuidRegex.test(establishmentId.toUpperCase())) {
      byUUID = establishmentId;
  } else if (Number.isInteger(establishmentId)) {
    byID = parseInt(escape(establishmentId));
  } else {
    // unexpected establishment id
    return res.status(400).send();
  }
  
  const thisEstablishment = new Establishment.Establishment(req.username);


  try {
    // before updating an Establishment, we need to be sure the Establishment is
    //  available to the given user. The best way of doing that
    //  is to restore from given UID
    // by loading the Establishment before updating it, we have all the facts about
    //  an Establishment (if needing to make inter-property decisions)
    if (await thisEstablishment.restore(byID, byUUID)) {
      // TODO: JSON validation

      // by loading after the restore, only those properties defined in the
      //  POST body will be updated (peristed)
      // With this endpoint we're only interested in services
      const isValidEstablishment = await thisEstablishment.load({
        services: req.body.services
      });

      // this is an update to an existing Establishment, so no mandatory properties!
      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);

        return res.status(200).json(thisEstablishment.toJSON(false, false, false, true, false, filteredProperties));
      } else {
        return res.status(400).send('Unexpected Input.');
      }
        
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    
    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error("Establishment::services POST: ", err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error("Establishment::services POST: ", err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error("Unexpected exception: ", err);
    }
  }
});

// updates the current set of other services for the known establishment
router.route('/alt').post(async (req, res) => {
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
          order: [
            ['category', 'ASC'],
            ['name', 'ASC']
          ]
        });
      } else {
        allServicesResults = await models.services.findAll({
          where: {
            iscqcregistered: false
          },
          order: [
            ['category', 'ASC'],
            ['name', 'ASC']
          ]
        });  
      }

      if (allServicesResults) {
        // within a transaction first delete all existing 'other services', before creating new ones
        await models.sequelize.transaction(async t => {
          let deleteAllExisting = await models.establishmentServices.destroy(
            {
              where: {
                establishmentId
              }
            },
            {transaction: t}
          );

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
                }, {transaction: t}));  
              }
            }
          })
          await Promise.all(newServicesPromises);
        });

        // now refresh the Establishment and return the updated set of other services
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
    
        res.status(200);
        return res.json(formatOtherServicesResponse(results));

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
    allOtherServices: ServiceFormatters.createServicesByCategoryJSON(establishment.allServices, false, false, true),
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