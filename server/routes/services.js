var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL services*/
router.route('/')
  .get(async function (req, res) {

    //Find matching postcode data
    let results = await models.services.findAll({
    });

    console.log('Results');
    console.log(results);

    let servicesData = await createServicesJSON(results);

    console.log('Service Data');
    console.log(servicesData);

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

async function createServicesJSON(results){

  let servicesData =[];
  //Go through any results found from DB and map to JSON
  for (let i=0, len=results.length; i<len; i++){

    let data=results[i].dataValues;

    let myObject = {
      serviceId: data.id,
      category: data.category,
      name: data.name,
      cqcRegistered: data.iscqcregistered,
      capacityQuestion: data.capacityquestion,
      currentUptakeQuestion: data.currentuptakequestion
    };

    servicesData.push(myObject);
  }

  return servicesData;

};



module.exports = router;
