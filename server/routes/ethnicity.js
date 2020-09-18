var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL ethnicities*/
router.route('/').get(async function (req, res) {
  try {
    let results = await models.ethnicity.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      ethnicities: {
        list: ethnicityJSON(results),
        byGroup: ethnicityByGroupJSON(results),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

function localFormat(givenEthncity, withGroup = true) {
  const ethnicityJson = {
    id: givenEthncity.id,
    ethnicity: givenEthncity.ethnicity,
  };

  if (withGroup) {
    ethnicityJson.group = givenEthncity.group;
  }

  return ethnicityJson;
}

function ethnicityJSON(givenEthnicities) {
  let ethnicities = [];

  //Go through any results found from DB and map to JSON
  givenEthnicities.forEach((thisEthnicity) => {
    ethnicities.push(localFormat(thisEthnicity));
  });

  return ethnicities;
}

function ethnicityByGroupJSON(givenEthnicities) {
  let ethnicityGroupsMap = new Map();

  if (givenEthnicities && Array.isArray(givenEthnicities)) {
    givenEthnicities.forEach((thisEthnicity) => {
      const mapKey = thisEthnicity.group;
      let thisEthnicityGroup = ethnicityGroupsMap.get(mapKey);
      if (!thisEthnicityGroup) {
        // group (job type) does not yet exist, so create the group hash
        //  with an array of one (this service type)
        ethnicityGroupsMap.set(mapKey, [localFormat(thisEthnicity, false)]);
      } else {
        // group (job type) already exists; it's already an array, so add this current service type
        thisEthnicityGroup.push(localFormat(thisEthnicity, false));
      }
    });
  }

  // now iterate over the map (group by job type) and construct the target Javascript object
  const ethnicityGroups = {};
  ethnicityGroupsMap.forEach((key, value) => {
    ethnicityGroups[value] = key;
  });

  return ethnicityGroups;
}

module.exports = router;
