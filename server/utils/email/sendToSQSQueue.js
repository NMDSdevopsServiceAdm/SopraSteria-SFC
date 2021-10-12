const AWS = require('aws-sdk');
const appConfig = require('../../config/config');

const QueueUrl = appConfig.get('aws.sqsqueue').toString();

const sendToSQSQueue = async (to, templateId, params, index) => {
  const sqs = new AWS.SQS({
    region: appConfig.get('aws.region').toString(),
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
        QueueUrl,
      })
      .promise();
  } catch (error) {
    console.error(error);
  }
};

exports.sendToSQSQueue = sendToSQSQueue;
