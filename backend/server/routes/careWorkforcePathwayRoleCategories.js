const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../models');

const getAllCareWorkforcePathwayRoleCategories = async (req, res) => {
  try {
    const results = await models.careWorkforcePathwayRoleCategory.findAll();

    res.status(200);

    return res.send({ careWorkforcePathwayRoleCategories: results });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

router.route('/').get(getAllCareWorkforcePathwayRoleCategories);

module.exports = router;
module.exports.getAllCareWorkforcePathwayRoleCategories = getAllCareWorkforcePathwayRoleCategories;
