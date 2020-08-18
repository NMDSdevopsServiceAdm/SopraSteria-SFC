const express = require('express');
const router = express.Router();
const models = require('../../../../models');
const EstablishmentTransformer = require('../../../../transformers/adminSearchTransformer').EstablishmentTransformer;

const search = async function (req, res) {
  try {
    const searchFields = req.body;
    const where = {};

    if (models.establishment.rawAttributes.EmployerTypeValue.values.includes(searchFields.employerType)) {
      where.EmployerTypeValue = searchFields.employerType;
    }

    if (searchFields.parent === true) where.isParent = true;

    const establishments = await models.establishment.searchEstablishments(where);
    const results = await EstablishmentTransformer(establishments);

    return res.status(200).json(results);
  } catch (err) {
    console.error(err.type)
    console.error(err.message);
    return res.status(503).send();
  }
};

router.route('/').post(search);

module.exports = router;
module.exports.search = search;
