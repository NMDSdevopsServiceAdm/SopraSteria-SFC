var express = require('express');
var router = express.Router();
const models = require('../models/index');
const ServiceFormatters = require('../models/api/services');

/* GET ALL services*/
router.route('/')
  .get(async function (req, res) {

    //Find matching postcode data
    let results = await models.services.findAll({
      where: {
        isMain: true
      }
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

    //Find matching postcode data
    let results = null;

    if (filterByCqc) {
      results = await models.services.findAll({
        where: {
          iscqcregistered: true,
          isMain: true
        },
        order: [
          ['category', 'ASC'],
          ['name', 'ASC']
        ]
      });
    } else {
      results = await models.services.findAll({
        where: {
          iscqcregistered: false,
          isMain: true
        },
        order: [
          ['category', 'ASC'],
          ['name', 'ASC']
        ]
      });  
    }

    let servicesData = ServiceFormatters.createServicesByCategoryJSON(results);

    if (servicesData.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(servicesData);
    }
});

// deprecated
// router.route('/:cqcRegistered')
//   .get(async function (req, res) {

//     //Find matching postcode data
//     let results = await models.services.findAll({
//       where: {
//         iscqcregistered: req.params.cqcRegistered
//       }
//     });

//     let servicesData = await createServicesJSON(results);

//     if (servicesData.length === 0) {
//       res.sendStatus(404);
//     } else {
//       res.send(servicesData);
//     }
// });

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


module.exports = router;
