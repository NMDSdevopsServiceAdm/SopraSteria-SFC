const express = require('express');
const router = express.Router({ mergeParams: true });

const getChildWorkplaces = async (req, res) => {
  return res.status(200).json({ establishmentId: req.params.id });
};

router.route('/').get(getChildWorkplaces);

module.exports = router;
module.exports.getChildWorkplaces = getChildWorkplaces;
