// default route and registration of all sub routes
const express = require('express');
const router = express.Router();

const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated');
const ServiceFormatters = require('../../models/api/services');
const CapacityFormatters = require('../../models/api/capacity');
const ShareFormatters = require('../../models/api/shareData');
const JobFormatters = require('../../models/api/jobs');

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

// gets all there is to know about an Establishment
router.route('/:id').get(async (req, res) => {
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
    jobs: JobFormatters.jobsByTypeJSON(establishment.jobs),
    created: establishment.created,
    updated: establishment.updated,
    updatedBy: establishment.updatedBy
  };
}

module.exports = router;
