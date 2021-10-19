const AWS = require('aws-sdk');
const config = require('../../config/config');

const sendToSQSQueue = async (to, templateId, params, index) => {
  const QueueUrl = config.get('aws.sqsqueue').toString();
  const sqs = new AWS.SQS({
    region: config.get('aws.region').toString(),
  });

  console.log('***********************');
  console.log('QueueUrl:', QueueUrl);
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
