const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../models');
const LaFormatters = require('../models/api/la');


const returnDateTime = () => {
  return (new Date()).toISOString();
};
router.route('/hello').get(async (req, res) => {
  return res.status(200).send(returnDateTime());
});
router.route('/hello').put(async (req, res) => {
  return res.status(200).send(returnDateTime());
});
router.route('/hello').delete(async (req, res) => {
  return res.status(200).send(returnDateTime());
});
router.route('/hello').post(async (req, res) => {
  return res.status(200).send(returnDateTime());
});

// return the list of all Local Authorities
router.route('/').get(async (req, res) => {

  try {
    let results = await models.localAuthority.findAll({
      attributes: ['custodianCode', 'name'],
      order: [
        ['name', 'ASC']
      ]
    });

    if (results && Array.isArray(results) && results.length > 0) {
      res.status(200);
      return res.json(LaFormatters.listOfLAsJSON(results));
    } else {
      return res.status(404).send('Not found');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('jobs GET - failed', err);
    return res.status(503).send('Unable to retrive Local Authorities');
  }
});

module.exports = router;