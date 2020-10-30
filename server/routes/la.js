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
    return res.status(503).send('Unable to retrive Local Authorities');
  }
});

// returns the primary Local Authority for the given postcode
router.route('/:postcode').get(async (req, res) => {
  const givenPostcode = req.params.postcode;
  let primaryAuthorityCssr = null;

  try {
    // lookup primary authority by trying to resolve on specific postcode code
    const cssrResults = await models.pcodedata.findOne({
      where: {
        postcode: givenPostcode,
      },
      include: [
        {
          model: models.cssr,
          as: 'theAuthority',
          attributes: ['id', 'name', 'nmdsIdLetter'],
        },
      ],
    });

    if (
      cssrResults &&
      cssrResults.postcode === givenPostcode &&
      cssrResults.theAuthority &&
      cssrResults.theAuthority.id &&
      Number.isInteger(cssrResults.theAuthority.id)
    ) {
      primaryAuthorityCssr = {
        id: cssrResults.theAuthority.id,
        name: cssrResults.theAuthority.name,
      };
    } else {
      //  using just the first half of the postcode
      const [firstHalfOfPostcode] = givenPostcode.split(' ');

      // must escape the string to prevent SQL injection
      const fuzzyCssrIdMatch = await models.sequelize.query(
        `select "Cssr"."CssrID", "Cssr"."CssR" from cqcref.pcodedata, cqc."Cssr" where postcode like \'${escape(
          firstHalfOfPostcode,
        )}%\' and pcodedata.local_custodian_code = "Cssr"."LocalCustodianCode" group by "Cssr"."CssrID", "Cssr"."CssR" limit 1`,
        {
          type: models.sequelize.QueryTypes.SELECT,
        },
      );
      if (fuzzyCssrIdMatch && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0].CssrID) {
        primaryAuthorityCssr = {
          id: fuzzyCssrIdMatch[0].CssrID,
          name: fuzzyCssrIdMatch[0].CssR,
        };
      }
    }

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
    return res.status(503).send('Unable to retrive primary authority');
  }
});

module.exports = router;
