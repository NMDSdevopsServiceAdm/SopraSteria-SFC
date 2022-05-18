const express = require('express');
const router = express.Router();
const models = require('../../../../models');
const moment = require('moment');

const postBenchmarkTabUsage = async (req, res) => {
  const viewedTime = moment();
  try {
    await models.benchmarksViewed.create({
      EstablishmentID: req.establishmentId,
      ViewedTime: viewedTime,
    });
    res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({});
  }
};

const getBenchmarskTabUsage = async (req, res) => {
  try {
    const benchmarkUsage = await models.benchmarksViewed.getBenchmarskTabUsage(req.establishment.id);

    const benchmarkUsageDate = benchmarkUsage.get('ViewedTime');
    const benchmarkUsageId = benchmarkUsage.get('ID');

    return res.status(200).json({ benchmarkUsageDate, benchmarkUsageId });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').post(postBenchmarkTabUsage);
router.route('/getBenchmarskTabUsage').get(getBenchmarskTabUsage);

module.exports = router;
module.exports.postBenchmarkTabUsage = postBenchmarkTabUsage;
module.exports.getBenchmarskTabUsage = getBenchmarskTabUsage;
