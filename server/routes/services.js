var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL services*/
router.route('/')
  .get(async function (req, res) {

    //Find matching postcode data
    let results = await models.services.findAll({
    });

    let servicesData = createServicesJSON(results);

    if (servicesData.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(servicesData);
    }
});

// takes optional query paramter "cqc" - values 'true' or 'false', return filter services for those that are CQC registered
router.route('/byCategory')
  .get(async function (req, res) {
    const filterByCqc = req.query.cqc && req.query.cqc === 'true' ? true : false;

    console.log('WA DEBUG: query parameters: ', req.query)
    console.log('WA DEBUG: filter by: ', filterByCqc)


    //Find matching postcode data
    let results = null;

    if (filterByCqc) {
      results = await models.services.findAll({
        where: {
          iscqcregistered: true
        },
        order: [
          ['category', 'ASC'],
          ['name', 'ASC']
        ]
      });
    } else {
      results = await models.services.findAll({
        order: [
          ['category', 'ASC'],
          ['name', 'ASC']
        ]
      });  
    }

    let servicesData = createServicesByCategoryJSON(results);

    if (servicesData.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(servicesData);
    }
});

router.route('/:cqcRegistered')
  .get(async function (req, res) {

    //Find matching postcode data
    let results = await models.services.findAll({
      where: {
        iscqcregistered: req.params.cqcRegistered
      }
    });

    let servicesData = await createServicesJSON(results);

    if (servicesData.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(servicesData);
    }
});

router.route('/id/:id')
  .get(async function (req, res) {

    //Find matching postcode data
    let results = await models.services.findAll({
      where: {
        id: req.params.id
      }
    });

    let servicesData = await createServicesJSON(results);

    if (servicesData.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(servicesData);
    }
});

function createServicesJSON(results){
  let servicesData =[];
  //Go through any results found from DB and map to JSON
  for (let i=0, len=results.length; i<len; i++){

    let data=results[i].dataValues;

    let myObject = {
      serviceId: data.id,
      category: data.category,
      name: data.name,
      // cqcRegistered: data.iscqcregistered,
      // capacityQuestion: data.capacityquestion,
      // currentUptakeQuestion: data.currentuptakequestion
    };

    servicesData.push(myObject);
  }

  return servicesData;
};

function localformatService(thisService) {
  return {
    id: thisService.id,
    key: thisService.name.replace(/\W/g, '_').toUpperCase(),  // any non-alphanumeric to underscore
    name: thisService.name,
    category: thisService.category,
    isCQC: thisService.iscqcregistered
  };
}

function createServicesByCategoryJSON(results){
  let serviceGroupsMap = new Map();

  //Go through any results found from DB and map to JSON
  results.forEach(thisService => {
    let thisCategoryGroup = serviceGroupsMap.get(thisService.category);
    if (!thisCategoryGroup) {
      // group (category) does not yet exist, so create the group hash
      //  with an array of one (this service type)
      serviceGroupsMap.set(thisService.category, [localformatService(thisService)]);
    } else {
      // group (category) already exists; it's already an array, so add this current service type
      thisCategoryGroup.push(localformatService(thisService));
    }
  });

  // now iterate over the map (group by category) and construct the target Javascript object
  const serviceGroups = [];
  serviceGroupsMap.forEach((key,value) => {
    serviceGroups.push({
      category: value,
      services: key
    });
  });


  return serviceGroups;
};


module.exports = router;
