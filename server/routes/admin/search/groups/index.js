const express = require('express');
const router = express.Router();
const models = require('../../../../models');

const search = async function (req, res) {
  try {

    return res.status(200).json();
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
};

router.route('/').post(search);

module.exports = router;
module.exports.search = search;
