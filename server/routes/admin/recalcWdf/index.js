// default route for admin/search
const express = require('express');
const router = express.Router();

const Establishment = require('../../../models/classes/establishment').Establishment;
const Worker = require('../../../models/classes/worker').Worker;

router.route('/').post(async function (req, res) {
  console.log('WA DEBUUG api/admin/recalcWdf: ', req.body.establishments);

  const listOfEstablishments =
    req.body.establishments && Array.isArray(req.body.establishments) ? req.body.establishments : [];
  const recalculatedEstablishments = [];

  try {
    const establishmentPromises = [];
    listOfEstablishments.forEach((thisEstablishmentId) => {
      console.log(`WA - admin recalcWdf establishment - (${thisEstablishmentId})`);
      establishmentPromises.push(Establishment.recalcWdf(req.username, thisEstablishmentId));
      recalculatedEstablishments.push(thisEstablishmentId);
    });

    await Promise.all(establishmentPromises);

    return res.status(200).json({
      establishments: recalculatedEstablishments,
    });
  } catch (err) {
    console.error('admin recalcWdf error: ', err);
    return res.status(503).send();
  }
});

module.exports = router;
