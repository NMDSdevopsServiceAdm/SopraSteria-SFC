// database models
const models = require('../../../index');

const _valid = (thisJob) => {
  if (!thisJob) return false;

  // must exist a jobId or title (job title)
  if (!(thisJob.jobId || thisJob.title)) return false;

  // if job idis given, it must be an integer
  if (thisJob.jobId && !Number.isInteger(thisJob.jobId)) return false;

  // must also exist a total and it must be an integer
  if (!Number.isInteger(thisJob.total)) return false;

  // total must be between 0 and 999
  const MIN_JOB_TOTAL = 0;
  const MAX_JOB_TOTAL = 999;
  if (thisJob.total < MIN_JOB_TOTAL || thisJob.total > MAX_JOB_TOTAL) return false;

  // gets here, and it's valid
  return true;
};

// returns false if job definitions are not valid, otherwise returns
//  a well formed set of job definitions using data as given in jobs reference lookup
exports.validateJobs = async (jobDefs) => {
  const setOfValidatedJobs = [];
  let setOfValidatedJobsInvalid = false;

  // need a set of LAs (CSSRs) to validate against
  const allJobs = await models.job.findAll({
    attributes: ['id', 'title'],
  });
  if (!allJobs) {
    console.error('validateJobs - unable to retrieve all known jobs');
    return false;
  }

  for (let thisJob of jobDefs) {
    if (!_valid(thisJob)) {
      // first check the given data structure
      setOfValidatedJobsInvalid = true;
      break;
    }

    // jobId overrides title, because jobId is indexed whereas title is not!
    let referenceJob = null;
    if (thisJob.jobId) {
      referenceJob = allJobs.find((thisKnownjob) => {
        return thisKnownjob.id === thisJob.jobId;
      });
    } else {
      referenceJob = allJobs.find((thisKnownjob) => {
        return thisKnownjob.title === thisJob.title;
      });
    }

    if (referenceJob && referenceJob.id) {
      // found a job  match - prevent duplicates by checking if the reference job already exists
      if (!setOfValidatedJobs.find((thisExistingJob) => thisExistingJob.jobId === referenceJob.id)) {
        setOfValidatedJobs.push({
          jobId: referenceJob.id,
          title: referenceJob.title,
          total: thisJob.total,
        });
      }
    } else {
      setOfValidatedJobsInvalid = true;
      break;
    }
  }

  // if having processed each service correctly, return the set of now validated services
  if (!setOfValidatedJobsInvalid) return setOfValidatedJobs;

  return false;
};

exports.formatJSON = (jobs, propName, propTotalName) => {
  let jobTotal = 0;
  const jsonResponse = {};

  if (Array.isArray(jobs)) {
    jsonResponse[propName] = jobs.map((thisJob) => {
      jobTotal += thisJob.total;
      return {
        // id: thisJob.id,      // the primary key of the job record does not need to be exposed
        jobId: thisJob.jobId,
        title: thisJob.title,
        total: thisJob.total,
      };
    });
    jsonResponse[propTotalName] = jobTotal;
  } else {
    jsonResponse[propName] = jobs;
    jsonResponse[propTotalName] = 0;
  }

  return jsonResponse;
};
