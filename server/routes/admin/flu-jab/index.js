const express = require('express');
const router = express.Router();

const workplaceFluJabs = async function (req, res) {
  try {
    return res.status(200).json({'Flu': 'YES'});
  } catch (err) {
    return res.status(500).send();
  }
}

router.route('/workplace').get(workplaceFluJabs);

module.exports = router;
module.exports.workplaceFluJabs = workplaceFluJabs;
