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

    const expectedInput = {
      MessageGroupId: '1',
      MessageBody: JSON.stringify({ to, templateId, params }),
      QueueUrl: '',
    };
    expect(SQSClient.prototype.send).to.have.been.calledOnce;

    const callArgument = SQSClient.prototype.send.getCall(0).args[0];
    expect(callArgument).to.be.instanceOf(SendMessageCommand);
    expect(callArgument.input.MessageGroupId).to.deep.equal(expectedInput.MessageGroupId);
    expect(callArgument.input.MessageBody).to.deep.equal(expectedInput.MessageBody);
    expect(callArgument.input.QueueUrl).to.deep.equal(expectedInput.QueueUrl);
  });
});
