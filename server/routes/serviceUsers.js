var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL Service Users*/
router.route('/').get(async function (req, res) {
  try {
    let results = await models.serviceUsers.findAll({
      order: [['seq', 'ASC']],
    });

    res.send(serviceUsersByGroupJSON(results));
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

function localFormat(givenService) {
  const theService = {
    id: givenService.id,
    service: givenService.service,
    other: givenService.other ? true : undefined,
  };

  return theService;
}

function serviceUsersByGroupJSON(givenServices) {
  let serviceUsersGroupsMap = new Map();

  if (givenServices && Array.isArray(givenServices)) {
    givenServices.forEach((thisServiceUser) => {
      const mapKey = thisServiceUser.group;
      let thisServiceUserGroup = serviceUsersGroupsMap.get(mapKey);
      if (!thisServiceUserGroup) {
        // group (job type) does not yet exist, so create the group hash
        //  with an array of one (this service type)
        serviceUsersGroupsMap.set(mapKey, [localFormat(thisServiceUser)]);
      } else {
        // group (job type) already exists; it's already an array, so add this current service type
        thisServiceUserGroup.push(localFormat(thisServiceUser));
      }
    });
  }

  // now iterate over the map (group by job type) and construct the target Javascript object
  const serviceUserGroups = [];
  serviceUsersGroupsMap.forEach((key, value) => {
    serviceUserGroups[value] = key;
    serviceUserGroups.push({
      group: value,
      services: key,
    });
  });

  return serviceUserGroups;
}

module.exports = router;
