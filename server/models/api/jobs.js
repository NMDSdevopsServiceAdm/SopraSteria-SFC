const localformatJob = (thisJob) => {
  return {
    id: thisJob.id,
    total: thisJob.total,
    jobId: thisJob.reference.id,
    title: thisJob.reference.title
  }
};

exports.jobsByTypeJSON = (givenJobs) => {
  let jobGroupsMap = new Map();

  if (givenJobs && Array.isArray(givenJobs)) {
    givenJobs.forEach(thisJob => {
      const mapKey = thisJob.type;

      let thisJobGroup = jobGroupsMap.get(mapKey);
      if (!thisJobGroup) {
        // group (job type) does not yet exist, so create the group hash
        //  with an array of one (this service type)
        jobGroupsMap.set(mapKey, [localformatJob(thisJob)]);
      } else {
        // group (job type) already exists; it's already an array, so add this current service type
        thisJobGroup.push(localformatJob(thisJob));
      }
    });
  }

  // now iterate over the map (group by job type) and construct the target Javascript object
  const jobTypeGroup = {};
  jobGroupsMap.forEach((key,value) => {
    jobTypeGroup[value] = key;
  });


  // have default (if simply empty) set of vacancies, starters and leavers
  if (typeof jobTypeGroup['Vacancies'] === 'undefined') {
    jobTypeGroup['Vacancies'] = [];
  }
  if (typeof jobTypeGroup['Starters'] === 'undefined') {
    jobTypeGroup['Starters'] = [];
  }
  if (typeof jobTypeGroup['Leavers'] === 'undefined') {
    jobTypeGroup['Leavers'] = [];
  }

  // add the totals; totals must always be given even if there no associated jobs
  let totalVacancies = 0;
  if (jobTypeGroup['Vacancies']) {
    jobTypeGroup['Vacancies'].forEach(thisJob => {
      totalVacancies += thisJob.total;
    });
  }
  let totalStarters = 0;
  if (jobTypeGroup['Starters']) {
    jobTypeGroup['Starters'].forEach(thisJob => {
      totalStarters += thisJob.total;
    });
   }
  let totalLeavers = 0;
  if (jobTypeGroup['Leavers']) {
    jobTypeGroup['Leavers'].forEach(thisJob => {
      totalLeavers += thisJob.total;
    });
  }

  jobTypeGroup[`TotalVacencies`] = totalVacancies;
  jobTypeGroup[`TotalStarters`] = totalStarters;
  jobTypeGroup[`TotalLeavers`] = totalLeavers;

  return jobTypeGroup;
};
