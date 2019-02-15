const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../models');
const LaFormatters = require('../models/api/la');

// return the list of all Local Authorities
router.route('/').get(async (req, res) => {

  try {
    let results = await models.cssr.findAll({
      attributes: ['id', 'name'],
      group: ['id', 'name'],
      order: [
        ['name', 'ASC']
      ]
    });

    if (results && Array.isArray(results) && results.length > 0) {
      res.status(200);
      return res.json(LaFormatters.listOfLAsJSON(results.map(thisCssr => { return {custodianCode: thisCssr.id, name: thisCssr.name};})));
    } else {
      return res.status(404).send('Not found');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('la GET - failed', err);
    return res.status(503).send('Unable to retrive Local Authorities');
  }
});

module.exports = router;
