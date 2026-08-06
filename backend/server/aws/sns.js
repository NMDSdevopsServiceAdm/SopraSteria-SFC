const config = require('../config/config');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const region = config.get('aws.region');

const snsClient = new SNSClient({ region, signatureVersion: 'v4' });

const SNSTopics = {
  Registration: config.get('aws.sns.registrations'),
  Feedback: config.get('aws.sns.feedback'),
};

const postToSNSTopic = async (snsTopic, messageBody) => {
  try {
    if (!config.get('aws.sns.enabled')) {
      console.error('trying to post to SNS topic but SNS was not enabled in env config');
      return;
    }
    if (!snsTopic || !messageBody) {
      console.error('failed to post to SNS topic due to missing params');
      return;
    }

    const command = new PublishCommand({
      Message: JSON.stringify(messageBody),
      TopicArn: snsTopic,
    });

    return snsClient.send(command);
  } catch (err) {
    console.log('failed to post to SNS topic:', snsTopic);
    console.error('postToSNSTopic error: ', err);
  }
};

const postToRegistrations = async (registration) => {
  return postToSNSTopic(SNSTopics.Registration, registration);
};

const postToFeedback = async (feedback) => {
  return postToSNSTopic(SNSTopics.Feedback, feedback);
};

module.exports = { postToSNSTopic, postToRegistrations, postToFeedback };
