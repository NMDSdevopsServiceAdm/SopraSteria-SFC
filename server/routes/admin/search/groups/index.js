const express = require('express');
const router = express.Router();
const models = require('../../../../models');

const search = async function (req, res) {
  try {
    const searchFields = req.body;
    const establishments = await models.establishment.byEstablishmentType(searchFields.employerType);
    // console.log(JSON.stringify(establishments));
    return res.status(200).json(establishments);
  } catch (err) {
    console.error(err.type)
    console.error(err.message);
    return res.status(503).send();
  }
};

router.route('/').post(search);

module.exports = router;
module.exports.search = search;
