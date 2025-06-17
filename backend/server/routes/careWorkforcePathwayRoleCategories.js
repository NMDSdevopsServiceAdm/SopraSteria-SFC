const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../models');

const getAllCareWorkforcePathwayRoleCategories = async (req, res) => {
  try {
    const results = await models.careWorkforcePathwayRoleCategory.findAll({
      order: [['seq', 'ASC']],
    });

    res.status(200);

    return res.send({ careWorkforcePathwayRoleCategories: careWorkforcePathwayRoleCategoryJSON(results) });
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
