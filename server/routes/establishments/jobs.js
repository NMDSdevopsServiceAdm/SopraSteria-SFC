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
      attributes: ['id', 'name', 'VacanciesValue', 'StartersValue', 'LeaversValue'],
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

  // each of vacancies, starters or leavers (if defined) must either by an array or
  //  a string of "None" or "Don't know"
  const jobDeclaration = ["None", "Don't know"];
  if (givenJobs.vacancies) {
    if (!(Array.isArray(givenJobs.vacancies) ||
         jobDeclaration.includes(givenJobs.vacancies))) {
          console.error('establishment::jobs POST - unexpected  vacancies: ', givenJobs.vacancies);
          return res.status(400).send(`Unexpected vacancies: ${givenJobs.vacancies}`);
    }
  }
  if (givenJobs.starters) {
    if (!(Array.isArray(givenJobs.starters) ||
         jobDeclaration.includes(givenJobs.starters))) {
          console.error('establishment::jobs POST - unexpected  starters: ', givenJobs.starters);
          return res.status(400).send(`Unexpected starters: ${givenJobs.starters}`);
    }
  }
  if (givenJobs.leavers) {
    if (!(Array.isArray(givenJobs.leavers) ||
         jobDeclaration.includes(givenJobs.leavers))) {
          console.error('establishment::jobs POST - unexpected  leavers: ', givenJobs.leavers);
          return res.status(400).send(`Unexpected leavers: ${givenJobs.leavers}`);
    }
  }

  try {
    let thisEstablishment = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'VacanciesValue', 'StartersValue', 'LeaversValue']
    });

    if (thisEstablishment && thisEstablishment.id && (establishmentId === thisEstablishment.id)) {
      const establishmentRecord = thisEstablishment;

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
        if (givenJobs.vacancies) {
          // vacancies is defined; delete all known vanancies for this Establishment
          await models.establishmentJobs.destroy(
            {
              where: {
                type: 'Vacancies',
                establishmentId
              }
            },
            {transaction: t}
          );

          // now iterate through the vacancies
          if (Array.isArray(givenJobs.vacancies)) {
            const vacancyRecords = [];
            givenJobs.vacancies.forEach(thisVacancy => {
              if (isValidJobEntry(thisVacancy, allJobs)) {
                vacancyRecords.push(
                  models.establishmentJobs.create({
                    jobId: thisVacancy.jobId,
                    total: thisVacancy.total,
                    establishmentId,
                    type: 'Vacancies'
                  }, {transaction: t})
                );
              }
            });
            await Promise.all(vacancyRecords);

            // update the Establishment vacancies declaration
            await establishmentRecord.update({
              VacanciesValue: 'With Jobs'
            }, {transaction: t});
          } else {
            // no vacancies given, so simply update the Establishment vacancies declaration
            await establishmentRecord.update({
              VacanciesValue: givenJobs.vacancies
            }, {transaction: t});
          }
        }

        if (givenJobs.starters) {
          // starters are declared; delete all existing starter records for this Establishment
          await models.establishmentJobs.destroy(
            {
              where: {
                type: 'Starters',
                establishmentId
              }
            },
            {transaction: t}
          );

          // now iterate through the vacancies
          if (Array.isArray(givenJobs.starters)) {
            const starterRecords = [];
            givenJobs.starters.forEach(thisStarter => {
              if (isValidJobEntry(thisStarter, allJobs)) {
                starterRecords.push(
                  models.establishmentJobs.create({
                    jobId: thisStarter.jobId,
                    total: thisStarter.total,
                    establishmentId,
                    type: 'Starters'
                  }, {transaction: t})
                );
              }
            });
            await Promise.all(starterRecords);

            // update the Establishment starters declaration
            await establishmentRecord.update({
              StartersValue: 'With Jobs'
            }, {transaction: t});

          } else {
            // no starters given, so simply update the Establishment starters declaration
            await establishmentRecord.update({
              StartersValue: givenJobs.starters
            }, {transaction: t});
          }

        }

        if (givenJobs.leavers) {
          // leavers are declared; delete all existing leaver records for this Establishment
          await models.establishmentJobs.destroy(
            {
              where: {
                type: 'Leavers',
                establishmentId
              }
            },
            {transaction: t}
          );

          // now iterate through the vacancies
          if (Array.isArray(givenJobs.leavers)) {
            const leaverRecords = [];
            givenJobs.leavers.forEach(thisLeaver => {
              if (isValidJobEntry(thisLeaver, allJobs)) {
                leaverRecords.push(
                  models.establishmentJobs.create({
                    jobId: thisLeaver.jobId,
                    total: thisLeaver.total,
                    establishmentId,
                    type: 'Leavers'
                  }, {transaction: t})
                );
              }
            });
            await Promise.all(leaverRecords);

            // update the Establishment leavers declaration
            await establishmentRecord.update({
              LeaversValue: 'With Jobs'
            }, {transaction: t});

          } else {
            // no leavers given, so simply update the Establishment leavers declaration
            await establishmentRecord.update({
              LeaversValue: givenJobs.leavers
            }, {transaction: t});
          }
        }
      });

      // having completed on all updates, re-fetch the jobs for displaying back
      let results = await models.establishment.findOne({
        where: {
          id: establishmentId
        },
        attributes: ['id', 'name', 'VacanciesValue', 'StartersValue', 'LeaversValue'],
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
    return res.status(503).send(`Unable to update Establishment with jobs: ${req.params.id}`);
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
    jobs: JobFormatters.jobsByTypeJSON(establishment)
  };
}

module.exports = router;
