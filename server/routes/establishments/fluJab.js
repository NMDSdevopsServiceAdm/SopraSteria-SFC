const express = require('express');
const router = express.Router();
const models = require('../../models');
const FluJabTransformer = require('../../transformers/fluJabTransformer').FluJabTransformer;

const workplaceFluJabs = async function (req, res) {
  try {
    const workers = await models.worker.retrieveEstablishmentFluJabs(req.establishmentId);
    const results = await FluJabTransformer(workers);

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).send();
  }
}

router.route('/').get(workplaceFluJabs);

module.exports = router;
module.exports.workplaceFluJabs = workplaceFluJabs;
