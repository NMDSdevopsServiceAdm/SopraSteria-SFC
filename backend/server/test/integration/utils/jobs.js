const Random = require('./random');

exports.lookupRandomJob = (jobs) => {
    const randomJobIndex = Random.randomInt(0, jobs.length-1);
    return jobs[randomJobIndex];
};