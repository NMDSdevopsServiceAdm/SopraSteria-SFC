// default route and registration of all sub routes
const express = require('express');
const router = express.Router();

const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated');
const ServiceFormatters = require('../../models/api/services');
const CapacityFormatters = require('../../models/api/capacity');
const ShareFormatters = require('../../models/api/shareData');
const JobFormatters = require('../../models/api/jobs');

// all user functionality is encapsulated
const Establishment = require('../../models/classes/establishment');

const EmployerType = require('./employerType');
const Services = require('./services');
const Capacity = require('./capacity');
const ShareData = require('./shareData');
const Staff = require('./staff');
const Jobs = require('./jobs');
const LA = require('./la');
const Worker = require('./worker');

// ensure all establishment routes are authorised
router.use('/:id', Authorization.hasAuthorisedEstablishment);
router.use('/:id/employerType', EmployerType);
router.use('/:id/services', Services);
router.use('/:id/capacity', Capacity);
router.use('/:id/share', ShareData);
router.use('/:id/staff', Staff);
router.use('/:id/jobs', Jobs);
router.use('/:id/localAuthorities', LA);
router.use('/:id/worker', Worker);


// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
router.use('/:id', Authorization.hasAuthorisedEstablishment);
router.route('/:id').get(async (req, res) => {
    const establishmentId = req.establishmentId;
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
            // the property based framework for "other services" and "capacity services"
            //  is returning "allOtherServices" and "allServiceCapacities"
            //  we don't want those on the root GET establishment; only necessary for the
            //  direct GET endpoints "establishment/:eid/service" and
            //  establishment/:eid/service respectively
            const jsonResponse = thisEstablishment.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false)
            delete jsonResponse.allOtherServices;
            delete jsonResponse.allServiceCapacities;
            return res.status(200).json(jsonResponse);
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

        console.error('establishment::GET/:eID - failed', thisError.message);
        return res.status(503).send(thisError.safe);
    }
});

// gets all there is to know about an Establishment
router.use('/:id/alt', Authorization.hasAuthorisedEstablishment);
router.route('/:id/alt').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      include: [
        {
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
        },{
          model: models.establishmentCapacity,
          as: 'capacity',
          attributes: ['id', 'answer'],
          include: [{
            model: models.serviceCapacity,
            as: 'reference',
            attributes: ['id', 'question']
          }]
        },
        {
          model: models.establishmentJobs,
          as: 'jobs',
          attributes: ['id', 'type', 'total'],
          order: [
            ['type', 'ASC']
          ],
          include: [{
            model: models.job,
            as: 'reference',
            attributes: ['id', 'title'],
            order: [
              ['title', 'ASC']
            ]
          }]
        },
        {
          model: models.establishmentLocalAuthority,
          as: 'localAuthorities',
          attributes: ['id', 'cssrId', 'cssr'],
        }
      ]
    });


    if (results && results.id && (establishmentId === results.id)) {
      res.status(200);
      return res.json(formatEstablishmentResponse(results));
    } else {
      return res.status(404).send('Not found');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment root GET - failed', err);
    return res.status(503).send(`Unable to retrive Establishment: ${req.params.id}`);
  }
});

const formatEstablishmentResponse = (establishment) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes (viz. locationId below)
  return {
    id: establishment.id,
    uid: establishment.uid,
    name: establishment.name,
    address: establishment.address,
    postcode: establishment.postcode,
    locationRef: establishment.locationId,
    isRegulated: establishment.isRegulated,
    nmdsId: establishment.nmdsId,
    employerType: establishment.employerType,
    numberOfStaff: establishment.numberOfStaff,
    share: ShareFormatters.shareDataJSON(establishment, establishment.localAuthorities),
    mainService: ServiceFormatters.singleService(establishment.mainService),
    otherServices: ServiceFormatters.createServicesByCategoryJSON(establishment.otherServices),
    capacities: CapacityFormatters.capacitiesJSON(establishment.capacity),
    jobs: JobFormatters.jobsByTypeJSON(establishment),
    created: establishment.created,
    updated: establishment.updated,
    updatedBy: establishment.updatedBy
  };
}


module.exports = router;
