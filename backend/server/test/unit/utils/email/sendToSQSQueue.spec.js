const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const sinon = require('sinon');
const expect = require('chai').expect;
const { sendToSQSQueue } = require('../../../../utils/email/sendToSQSQueue');

describe('sendToSQSQueue', () => {
  it('should call send a message to the SQS queue', async () => {
    sinon.stub(SQSClient.prototype, 'send');

    const to = {
      name: 'test',
      email: 'test@test.com',
    };
    const templateId = 1;
    const params = {
      firstName: 'Test',
    };
    const index = 19;

    await sendToSQSQueue(to, templateId, params, index);

    const input = {
      MessageGroupId: '1',
      MessageDeduplicationId: '19',
      MessageBody: JSON.stringify({ to, templateId, params }),
      QueueUrl: '',
    };
    expect(SQSClient.prototype.send).to.have.been.calledOnce;

    const callArgument = SQSClient.prototype.send.getCall(0).args[0];
    expect(callArgument).to.be.instanceOf(SendMessageCommand);
    expect(callArgument.input).to.deep.equal(input);
  });
});
