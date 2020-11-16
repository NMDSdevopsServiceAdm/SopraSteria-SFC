var express = require('express');
var router = express.Router();

/* GET all location and POST new locations */
router.route('/500').get(function (req, res) {
  res.status(500).send('Location Tracker server error.');
});

router.route('/401').get(function (req, res) {
  res.status(401).send('Location Tracker unauthorized.');
});

module.exports = router;
