const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../models');
const LaFormatters = require('../models/api/la');

// return the list of all Local Authorities
router.route('/').get(async (req, res) => {
  try {
    let results = await models.cssr.findAll({
      attributes: ['id', 'name'],
      group: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    if (results && Array.isArray(results) && results.length > 0) {
      res.status(200);
      return res.json(
        LaFormatters.listOfLAsJSON(
          results.map((thisCssr) => {
            return { cssrId: thisCssr.id, name: thisCssr.name };
          }),
        ),
      );
    } else {
      return res.status(404).send('Not found');
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('la GET - failed', err);
    return res.status(500).send('Unable to retrive Local Authorities');
  }
});

// returns the primary Local Authority for the given postcode
router.route('/:postcode').get(async (req, res) => {
  const givenPostcode = req.params.postcode;
  let primaryAuthorityCssr = null;

  try {
    const cssrResults = await models.pcodedata.getLinkedCssrRecordsFromPostcode(givenPostcode);

    if (!cssrResults || cssrResults.length == 0) {
      console.log('------------------------------------');
      console.log('Could not retrieve cssr record');
      console.log('------------------------------------');
    }

    primaryAuthorityCssr = {
      id: cssrResults.theAuthority.id,
      name: cssrResults.theAuthority.name,
    };

    if (primaryAuthorityCssr) {
      res.status(200);
      return res.status(200).json({
        id: primaryAuthorityCssr.id,
        name: primaryAuthorityCssr.name,
      });
    } else {
      return res.status(404).send('Not found');
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('la GET:postcode - failed', err);
    return res.status(500).send('Unable to retrive primary authority');
  }
});

module.exports = router;
