const models = require('../../../models');

const updatePostcode = async (req, res) => {
  try {
    const postcode = req.body.postcode;

    const workplace = await models.establishment.findByUid(req.body.uid);

    workplace.postcode = postcode;
    workplace.save();

    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};


const router = require('express').Router();

router.route('/').post(updatePostcode);

module.exports = router;
module.exports.updatePostcode = updatePostcode;
