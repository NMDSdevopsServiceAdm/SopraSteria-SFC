const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');
const JobFormatters = require('../../models/api/jobs');

// parent route defines the "id" parameter

// gets current job quotas for the known establishment
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name'],
      include: [
        {
          model: models.establishmentJobs,
          as: 'jobs',
          attributes: ['id', 'type', 'total'],
          order: [
            ['type', 'ASC']
          ],
          include: [{
            model: models.job,
            as: 'reference',
            attributes: ['id', 'title'],
            order: [
              ['title', 'ASC']
            ]
          }]
        }
      ]
    });

    if (results && results.id && (establishmentId === results.id)) {
      res.status(200);
      return res.json(formatJobResponse(results));
    } else {
      return res.status(404).send('Not found');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::jobs GET - failed', err);
    return res.status(503).send(`Unable to retrive Establishment: ${req.params.id}`);
  }
});

// updates the current jobs  for the known establishment
const EXPECTED_JOB_TYPES = ['Vacancies', 'Starters', 'Leavers'];
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const givenJobs = req.body.jobs;

  // must provide jobs and must be an OBJECT
  if (!givenJobs || Array.isArray(givenJobs)) {
    console.error('establishment::jobs POST - unexpected jobs: ', givenJobs);
    return res.status(400).send(`Unexpected jobs: ${givenJobs}`);
  }

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name']
    });

    if (results && results.id && (establishmentId === results.id)) {
      // when processing the job, we need to ensure they are one of the known jobs
      const allJobsResult = await models.job.findAll({
        attributes: ['id']
      });
      if (!allJobsResult) {
        console.error('establishment::jobs POST - unable to retrieve all known jobs');
        return res.status(503).send('Unable to retrieve all jobs');
      }
      const allJobs = [];
      allJobsResult.forEach(thisRes => allJobs.push(thisRes.id));

      // we are expecting one of a given job type; if the job type is given, we are
      //  deleting all existing records for that job type
      // we must process all or nothing; within a job type and across a job type
      // TODO: Could do with some refactoring for each job type
      await models.sequelize.transaction(async t => {
        // first process vacancies
        if (givenJobs.vacancies && Array.isArray(givenJobs.vacancies)) {
          await models.establishmentJobs.destroy({
            where: {
              type: 'Vacancies',
              establishmentId
            }
          });

          // now iterate through the vacancies
          const vacancyRecords = [];
          givenJobs.vacancies.forEach(thisVacancy => {
            if (isValidJobEntry(thisVacancy, allJobs)) {
              vacancyRecords.push(
                models.establishmentJobs.create({
                  jobId: thisVacancy.jobId,
                  total: thisVacancy.total,
                  establishmentId,
                  type: 'Vacancies'
                })
              );
            }
          });
          await Promise.all(vacancyRecords);
        }

        if (givenJobs.starters && Array.isArray(givenJobs.starters)) {
          await models.establishmentJobs.destroy({
            where: {
              type: 'Starters',
              establishmentId
            }
          });

          // now iterate through the vacancies
          const starterRecords = [];
          givenJobs.starters.forEach(thisStarter => {
            if (isValidJobEntry(thisStarter, allJobs)) {
              starterRecords.push(
                models.establishmentJobs.create({
                  jobId: thisStarter.jobId,
                  total: thisStarter.total,
                  establishmentId,
                  type: 'Starters'
                })
              );
            }
          });
          await Promise.all(starterRecords);
        }

        if (givenJobs.leavers && Array.isArray(givenJobs.leavers)) {
          await models.establishmentJobs.destroy({
            where: {
              type: 'Leavers',
              establishmentId
            }
          });

          // now iterate through the vacancies
          const leaverRecords = [];
          givenJobs.leavers.forEach(thisLeaver => {
            if (isValidJobEntry(thisLeaver, allJobs)) {
              leaverRecords.push(
                models.establishmentJobs.create({
                  jobId: thisLeaver.jobId,
                  total: thisLeaver.total,
                  establishmentId,
                  type: 'Leavers'
                })
              );
            }
          });
          await Promise.all(leaverRecords);
        }
      });

      // having completed on all updates, re-fetch the jobs for displaying back
      let results = await models.establishment.findOne({
        where: {
          id: establishmentId
        },
        attributes: ['id', 'name'],
        include: [{
          model: models.establishmentJobs,
          as: 'jobs',
          attributes: ['id', 'type', 'total'],
          order: [
            ['type', 'ASC']
          ],
          include: [{
            model: models.job,
            as: 'reference',
            attributes: ['id', 'title'],
            order: [
              ['title', 'ASC']
            ]
          }]
        }]
      });
      
      res.status(200);
      return res.json(formatJobResponse(results));
    } else {
      console.error('establishment::jobs POST - Not found establishment having id: ${establishmentId}');
      return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::jobs POST - failed', err);
    return res.status(503).send(`Unable to update Establishment with jobs: ${req.params.id}/${givenEmployerType}`);
  }
});


// TODO - ensure the jobId is valid
const isValidJobEntry = (entry, allKnownJobs) => {
  const maxNumberOfStaff=1000;

  if (entry && 
      entry.total &&
      parseInt(entry.total) === entry.total &&
      entry.total < maxNumberOfStaff &&
      entry.jobId &&
      parseInt(entry.jobId) === entry.jobId) {

      // now check the job id is within range
      if (allKnownJobs &&
          Array.isArray(allKnownJobs) &&
          allKnownJobs.includes(entry.jobId)) {
        return true;
      } else {
        return false;
      }
  } else {
    return false;
  }
};

const formatJobResponse = (establishment) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes (viz. locationId below)
  return {
    id: establishment.id,
    name: establishment.name,
    jobs: JobFormatters.jobsByTypeJSON(establishment.jobs)
  };
}

module.exports = router;