const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../models');

// return the list of known job titles
router.route('/').get(async (req, res) => {
  try {
    let results = await models.job.findAll({
      attributes: ['id', 'title', 'other'],
      order: [['title', 'ASC']],
    });

    if (results && Array.isArray(results) && results.length > 0) {
      res.status(200);
      return res.json(formatJobsResponse(results));
    } else {
      return res.status(404).send('Not found');
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('jobs GET - failed', err);
    return res.status(503).send('Unable to retrive Jobs');
  }
});

const formatJobsResponse = (jobs) => {
  let theseJobs = [];

  jobs.forEach((thisJob) =>
    theseJobs.push({
      id: thisJob.id,
      title: thisJob.title,
      other: thisJob.other ? thisJob.other : undefined,
    }),
  );

  return {
    jobs: theseJobs,
  };
};

module.exports = router;
