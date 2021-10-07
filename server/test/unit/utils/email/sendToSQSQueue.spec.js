const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const expect = require('chai').expect;
const { sendToSQSQueue } = require('../../../../utils/email/sendToSQSQueue');

describe('sendToSQSQueue', () => {
  it('should call send a message to the SQS queue', async () => {
    AWSMock.mock('SQS', 'sendMessage', (params, callback) => {
      expect(params).to.have.property('MessageBody');
      expect(params).to.have.property('QueueUrl');
      callback(null, 'successfully received message');
    });

    const to = {
      name: 'test',
      email: 'test@test.com',
    };
    const templateId = 1;
    const params = {
      firstName: 'Test',
    };

    await sendToSQSQueue(to, templateId, params);

    const input = {
      MessageBody: '{ to, templateId, params}',
      QueueUrl: 'someUrl',
    };
    const sqs = new AWS.SQS();
    expect(await sqs.sendMessage(input).promise()).to.deep.equal('successfully received message');
  });
});
