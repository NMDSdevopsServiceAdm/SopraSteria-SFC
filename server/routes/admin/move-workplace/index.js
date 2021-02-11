'use strict';
const router = require('express').Router();

const moveWorkplaceAdmin = async (req, res) => {
  console.log('workplace Admin');
  res.status(200).send;
};

router.route('/').post(moveWorkplaceAdmin);

module.exports = router;
module.exports.moveWorkplaceAdmin = moveWorkplaceAdmin;
