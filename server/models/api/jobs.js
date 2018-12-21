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

  return jobTypeGroup;
};
