const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');

const getChildWorkplaces = async (req, res) => {
  try {
    const childWorkplaces = await models.establishment.getChildWorkplaces(req.params.id);
    return res.status(200).json({ childWorkplaces });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').get(getChildWorkplaces);

module.exports = router;
module.exports.getChildWorkplaces = getChildWorkplaces;
