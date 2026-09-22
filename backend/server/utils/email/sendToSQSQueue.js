const { SendMessageCommand, SQSClient } = require('@aws-sdk/client-sqs');
const config = require('../../config/config');
const { fromContainerMetadata } = require('@aws-sdk/credential-providers');
const env = String(config.get('env'));

const getRegionFromQueueUrl = (queueUrl) => {
  const match = /sqs\.(.*)\.amazonaws.com/.exec(queueUrl);
  if (match) {
    return match.at(1);
  }

  return config.get('aws.region').toString();
};

const getSqsClient = () => {
  const region = getRegionFromQueueUrl(queueUrl);
  if (env === 'localhost') {
    return new SQSClient({
      region,
    });
  }

  return new SQSClient({
    credentials: fromContainerMetadata({
      timeout: 1000,
      maxRetries: 0,
    }),
    region,
  });
};

const queueUrl = config.get('aws.sqsqueue').toString();
const sqsClient = getSqsClient(queueUrl);

const sendToSQSQueue = async (to, templateId, params, index) => {
  try {
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
