const { SendMessageCommand, SQSClient } = require('@aws-sdk/client-sqs');
const config = require('../../config/config');

const getRegionFromQueueUrl = (queueUrl) => {
  const match = /sqs\.(.*)\.amazonaws.com/.exec(queueUrl);
  if (match) {
    return match.at(1);
  }

  return config.get('aws.region').toString();
};

const sendToSQSQueue = async (to, templateId, params, index) => {
  try {
    const queueUrl = config.get('aws.sqsqueue').toString();
    const region = getRegionFromQueueUrl(queueUrl);

    const sqsClient = new SQSClient({ region, signatureVersion: 'v4' });

    const command = new SendMessageCommand({
      MessageGroupId: String(templateId),
      MessageDeduplicationId: String(index),
      MessageBody: JSON.stringify({
        to,
        templateId,
        params,
      }),
      QueueUrl: queueUrl,
    });

    await sqsClient.send(command);
  } catch (error) {
    console.error(error);
  }
};

exports.sendToSQSQueue = sendToSQSQueue;
