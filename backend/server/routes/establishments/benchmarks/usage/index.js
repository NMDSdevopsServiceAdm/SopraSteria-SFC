const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../../models');

const postBenchmarkTabUsage = async (req, res) => {
  const { viewedTime } = req.body;

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
router.route('/').post(postBenchmarkTabUsage);

module.exports = router;
module.exports.postBenchmarkTabUsage = postBenchmarkTabUsage;
