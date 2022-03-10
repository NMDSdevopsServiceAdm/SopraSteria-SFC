const AWS = require('aws-sdk');
const config = require('../../config/config');

const sendToSQSQueue = async (to, templateId, params, index) => {
  const queueUrl = config.get('aws.sqsqueue').toString();
  const sqs = new AWS.SQS({
    region: config.get('aws.region').toString(),
  });

  try {
    await sqs
      .sendMessage({
        MessageGroupId: String(templateId),
        MessageDeduplicationId: String(index),
        MessageBody: JSON.stringify({
          to,
          templateId,
          params,
        }),
        QueueUrl: queueUrl,
      })
      .promise();
  } catch (error) {
    console.error(error);
  }
};

exports.sendToSQSQueue = sendToSQSQueue;
