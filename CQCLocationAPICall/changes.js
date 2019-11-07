const AWS = require('aws-sdk');
const appConfig = require('./config/config');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const models = require('./models/index');

//CQC Endpoint
const url = 'https://api.cqc.org.uk/public/v1';

const QueueUrl = appConfig.get('aws.sqsqueue').toString();
axiosRetry(axios, { retries: 3 });

const s3 = new AWS.S3({
  region: appConfig.get('aws.region').toString()
});

const sqs = new AWS.SQS({
  region: appConfig.get('aws.region').toString()
});

// Get a list of all the CQC Location ID's that jhave changed between 2 timestamps
async function getChangedIds(startTimestamp, endTimestamp) {
  let changes = [];
  let nextPage='/changes/location?page=1&perPage=1000&startTimestamp=' + startTimestamp + '&endTimestamp=' + endTimestamp;
  console.log('Getting the changes');
  do {
    let changeUrl = url + nextPage;
    let response = await axios.get(changeUrl);
    nextPage = response.data.nextPageUri;
    for (let i=0, len=response.data.changes.length; i<len; i++) {
      changes.push({
        "locationId": response.data.changes[i],
        "status": ""
      });
    }
  } while (nextPage != null);
  console.log('There are ' + changes.length + ' changes');
  return changes;
}

// Upload a list of all the changed location ID's along with timings to S3
async function uploadToS3(locationIds, startdate, enddate) {
  const locations ={
    "changes": locationIds,
    "startDate": startdate,
    "endDate": enddate
  };
  console.log('Putting the JSON onto S3');
  try {
    await s3.putObject({
      Bucket: appConfig.get('aws.bucketname').toString(),
      Key: `cqcChanges-${startdate}`,
      Body: JSON.stringify(locations),
      ContentType: 'application/json; charset=utf-8'
    }).promise();
  } catch(error) {
    console.error(error);
  }
}

// Send each of the location ID's to SQS for them to run a SQS
async function sendMessages(locationIds, startdate, enddate) {
  console.log('Adding messages to SQS');
  await Promise.all(locationIds.map(async locationId => {
    const location = {
      ...locationId,
      "startDate": startdate,
      "endDate": enddate
    };
    try {
      console.log('Pushing new item onto ' + QueueUrl);
      const sqsReq = await sqs.sendMessage({
        MessageBody: JSON.stringify(location),
        QueueUrl
      }).promise();
      console.log(sqsReq);
    } catch(error) {
      console.error(error);
    }
  }));
}

module.exports.handler =  async (event, context) => {
  const endDate=new Date().toISOString().split('.')[0]+"Z";
  let startDate = null;
  console.log('Looking for latest run');
  try {
    const log = await models.cqclog.findAll({
      limit: 1,
      where: {
        success:true
      },
      order: [ [ 'createdat', 'DESC' ]]
    });
    if (log) {
      startDate = log[0].dataValues.lastUpdatedAt;
    }
    console.log('Was last ran on ' + startDate);
    const locations = await getChangedIds(startDate, endDate);
    await uploadToS3(locations, startDate, endDate);
    await sendMessages(locations, startDate, endDate);
    models.sequelize.close();

    return {
      status: 200,
      body: "Call Successful"
    };
  } catch (error) {
    return  error.message;
  }
};
