const AWS = require('aws-sdk');
const appConfig = require('./config/config');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const models = require('./models/index');

//CQC Endpoint
const url = 'https://api.cqc.org.uk/public/v1';
axiosRetry(axios, { retries: 3 });

const s3 = new AWS.S3({
  region: appConfig.get('aws.region').toString()
});

const sqs = new AWS.SQS({
  region: appConfig.get('aws.region').toString()
});

// Upload a list of all the changed location ID's along with timings to S3
async function updateComplete(locations) {
  let completionCount = 0;
  let failed = false;
  console.log('Update Complete');
  console.log('Checking to see failure status');
  locations.changes.forEach(location => {
    if (location.status !== '') {
      completionCount++;
    }
    if (location.status !== 'success') {
      failed = true;
    }
  });
  console.log('Checked ' + completionCount);
  if (completionCount === locations.changes.length) {
    if (failed) {
      console.log('One or more updates failed');
      await models.logMock.create({
        success:false,
        message: e.message
      });
      return false;
    } else {
      console.log('All went successfully');
      await models.logMock.create({
        success: true,
        message: "Call Successful",
        lastUpdatedAt: endDate
      });
      return true;
    }
  } else {
    return false;
  }
}

// Upload a list of all the changed location ID's along with timings to S3
async function updateS3(location, status) {
  console.log('Getting S3 object');
  const locations = await s3.getObject({
    Bucket: appConfig.get('aws.bucketname').toString(),
    Key: `cqcChanges-${location.startDate}`
  }).promise();
  const locationJSON = JSON.parse(locations.Body.toString());
  if (locationJSON) {
    console.log('Looking for location in array');
    await locationJSON.changes.forEach(async (item) => {
      if (item.locationId === location.locationId) {
        console.log('Updating status');
        item.status = status;
      }
    });
  }
  if (await updateComplete(locationJSON)) {
    // await s3.deleteObject({
    //   Bucket: appConfig.get('aws.bucketname').toString(),
    //   Key: `cqcChanges-${location.startDate}`
    // }).promise();
  } else {
    console.log('Putting object back into S3');
    await s3.putObject({
      Bucket: appConfig.get('aws.bucketname').toString(),
      Key: `cqcChanges-${location.startDate}`,
      Body: JSON.stringify(locationJSON),
      ContentType: 'application/json; charset=utf-8'
    }).promise();
  }
}

async function deleteSQSMessage(ReceiptHandle) {
  await sqs.deleteMessage({
    QueueUrl: appConfig.get('aws.sqsqueue').toString(),
    ReceiptHandle: ReceiptHandle
  }).promise();
}

module.exports.handler =  async (event, context) => {
  const location = JSON.parse(event.Records[0].body);
  try {
    console.log('Getting information about ' + location.locationId + ' from CQC');
    const individualLocation = await axios.get(url+'/locations/'+ location.locationId);
    if (!individualLocation.data.deregistrationDate) {
      // not deregistered so must exist
      console.log('Updating/Inserting information into database');
      await models.LocationMock.upsert({
        locationid:individualLocation.data.locationId,
        locationname: individualLocation.data.name,
        addressline1: individualLocation.data.postalAddressLine1,
        addressline2: individualLocation.data.postalAddressLine2,
        towncity: individualLocation.data.postalAddressTownCity,
        county: individualLocation.data.postalAddressCounty,
        postalcode: individualLocation.data.postalCode,
        mainservice: (individualLocation.data.gacServiceTypes.length>0) ? individualLocation.data.gacServiceTypes[0].name : null
      });
    }
    await updateS3(location, 'success');
    // await deleteSQSMessage(event.ReceiptHandle);
    // models.sequelize.close();

    return {
      status: 200,
      body: "Call Successful"
    };
  } catch (error) {
    await updateS3(location, `failed: ${error}`);
    models.sequelize.close();
    return  error.message;
  }
};
