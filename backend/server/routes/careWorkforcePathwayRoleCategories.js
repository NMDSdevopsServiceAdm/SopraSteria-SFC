const express = require('express');
const router = express.Router();
const models = require('../models/index');

const getAllCareWorkforcePathwayRoleCategories = async (req, res) => {
  try {
    let results = await models.careWorkforcePathwayRoleCategory.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({careWorkforcePathwayRoleCategories: careWorkforcePathwayRoleCategoryJSON(results)});
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

function careWorkforcePathwayRoleCategoryJSON(givenCareWorkforcePathwayRoleCategories) {
  let careWorkforcePathwayRoleCategories = [];

  givenCareWorkforcePathwayRoleCategories.forEach((thisCareWorkforcePathwayRoleCategory) => {
    careWorkforcePathwayRoleCategories.push({
      id: thisCareWorkforcePathwayRoleCategory.id,
      title: thisCareWorkforcePathwayRoleCategory.title,
      description: thisCareWorkforcePathwayRoleCategory.description,
    });
  });

  return careWorkforcePathwayRoleCategories;
}

router.route('/').get(getAllCareWorkforcePathwayRoleCategories);
module.exports = router;
module.exports.getAllCareWorkforcePathwayRoleCategories = getAllCareWorkforcePathwayRoleCategories;
