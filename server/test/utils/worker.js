const faker = require('faker');
const jobsUtils = require('./jobs');
const Random = require('./random');

const lookupRandomContract = () => {
    const expectedContractTypeValues = ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'];
    const randomContractIndex = Random.randomInt(0, expectedContractTypeValues.length-1);
    return expectedContractTypeValues[randomContractIndex];
};

exports.newWorker = (jobs) => {
    const randomJob = jobsUtils.lookupRandomJob(jobs);
    return  {
        "nameOrId": faker.lorem.words(1),
        "contract": lookupRandomContract(),
        "mainJob": {
            "jobId" : randomJob.id,
            "title" : randomJob.title
        }
    };
};