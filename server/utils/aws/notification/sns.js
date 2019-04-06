// handles posting of data to AWS SNS topics
const config = require('../../../config/config');
const AWS = require('../init').AWS;

const SNS = AWS && config.get('aws.sns.enabled') ? new AWS.SNS() : null;

exports.registrationTopic = async (registration) => {
  if (SNS) {
    console.log("WA DEBUG - notification for registration to AWS SNS: ", registration);
  } else {
    console.log("WA DEBUG - notifications are not diasbled");
  }
};

exports.feedbackTopic = async (feedback) => {
  if (SNS) {
    console.log("WA DEBUG - notification for feedback to AWS SNS: ", feedback);
  } else {
    console.log("WA DEBUG - notifications are not diasbled");
  }
};
