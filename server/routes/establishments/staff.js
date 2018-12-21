const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');

// parent route defines the "id" parameter

// gets current staff for the known establishment
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'numberOfStaff']
    });

    if (results && results.id && (establishmentId === results.id)) {
      res.status(200);
      return res.json(formatStaffResponse(results));
    } else {
      return res.status(404).send('Not found');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::staff GET - failed', err);
    return res.status(503).send(`Unable to retrive Establishment: ${req.params.id}`);
  }
});

// updates the current employer type for the known establishment
router.route('/:staffNumber').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const givenStaffNumber = parseInt(req.params.staffNumber);

  // must provide staff number and must be integer and must be less than 999
  const maxNumberOfStaff=999;
  if (!givenStaffNumber ||
      givenStaffNumber < 0 ||
      givenStaffNumber > maxNumberOfStaff) {
    console.error('establishment::staff POST - unexpected number of staff: ', givenStaffNumber);
    return res.status(400).send(`Unexpected  number of staff: ${givenStaffNumber}`);
  }

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'numberOfStaff']
    });

    if (results && results.id && (establishmentId === results.id)) {
      // we have found the establishment, update the number of staff
      await results.update({
        numberOfStaff: givenStaffNumber
      });
      
      res.status(200);
      return res.json(formatStaffResponse(results));
    } else {
      console.error('establishment::staff POST - Not found establishment having id: ${establishmentId}', err);
      return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::staff POST - failed', err);
    return res.status(503).send(`Unable to update Establishment with staff number: ${req.params.id}/${givenEmployerType}`);
  }
});


const formatStaffResponse = (establishment) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes (viz. locationId below)
  return {
    id: establishment.id,
    name: establishment.name,
    employerType: establishment.numberOfStaff
  };
}

module.exports = router;