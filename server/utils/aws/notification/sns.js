// handles posting of data to AWS SNS topics
const config = require('../../../config/config');
const AWS = require('../init').AWS;

const SNS = AWS && config.get('aws.sns.enabled') ? new AWS.SNS({region: config.get('aws.region')}) : null;

exports.registrationTopic = async (registration) => {
  if (SNS) {
    const params = {
      Message: JSON.stringify(registration),
      TopicArn: config.get('aws.sns.registrations')
    };

    try {
      await SNS.publish(params).promise();
    } catch (err) {
      console.error('registrationTopic failed: ', err);
    }
  } else {
    console.log("WA DEBUG - notifications are not diasbled");
  }
};

exports.feedbackTopic = async (feedback) => {
  if (SNS) {
    const params = {
      Message: JSON.stringify(feedback),
      TopicArn: config.get('aws.sns.feedback')
    };

    try {
      await SNS.publish(params).promise();
    } catch (err) {
      console.error('feedbackTopic failed: ', err);
    }
  } else {
    console.log("WA DEBUG - notifications are not diasbled");
  }
};
