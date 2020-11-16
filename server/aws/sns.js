const AWS = require('aws-sdk');
const config = require('../config/config');

let sns = null;

const initialise = (region) => {
  sns = new AWS.SNS({
    apiVersion: '2010-03-31',
    region,
  });
};

const postToRegistrations = async (registration) => {
  if (!sns) return;
  if (!config.get('aws.sns.enabled')) return;

  // remove sensitive/unnecessary data

  const params = {
    Message: JSON.stringify(registration),
    TopicArn: config.get('aws.sns.registrations'),
  };

  try {
    await sns.publish(params).promise();
    // console.log("postToRegistrations status: ", status)
  } catch (err) {
    // trap any errors - stop them from propagating - an error on kinesis stop not interfere with the application
    console.error('postToRegistrations error: ', err);
  }
};

const postToFeedback = async (feedback) => {
  if (!sns) return;
  if (!config.get('aws.sns.enabled')) return;

  // remove sensitive/unnecessary data

  const params = {
    Message: JSON.stringify(feedback),
    TopicArn: config.get('aws.sns.feedback'),
  };

  try {
    await sns.publish(params).promise();
    // console.log("postToFeedback status: ", status)
  } catch (err) {
    // trap any errors - stop them from propagating - an error on kinesis stop not interfere with the application
    console.error('postToFeedback error: ', err);
  }
};

module.exports.initialise = initialise;
module.exports.postToRegistrations = postToRegistrations;
module.exports.postToFeedback = postToFeedback;
