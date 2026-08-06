const expect = require('chai').expect;
const sinon = require('sinon');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const config = require('../../../config/config');
const { postToRegistrations, postToFeedback } = require('../../../aws/sns');

describe('AWS SNS', () => {
  afterEach(() => {
    sinon.restore();
  });

  const registrationsTopicArn = config.get('aws.sns.registrations');
  const feedbackTopicArn = config.get('aws.sns.feedback');

  describe('postToRegistrations', () => {
    it('should call sns.send() with PublishCommand and post to registration SNS topic', async () => {
      const sendSpy = sinon.stub(SNSClient.prototype, 'send');
      const mockMessage = {
        nmdsId: '1234',
        establishmentUid: 'mock-uid',
        user: {},
      };

      await postToRegistrations(mockMessage);

      expect(sendSpy).to.have.been.calledOnce;

      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(PublishCommand);
      expect(callArgument.input).to.deep.equal({
        Message: '{"nmdsId":"1234","establishmentUid":"mock-uid","user":{}}',
        TopicArn: registrationsTopicArn,
      });
    });
  });

  describe('postToFeedback', () => {
    it('should call sns.send() with PublishCommand and post to feedback SNS topic', async () => {
      const sendSpy = sinon.stub(SNSClient.prototype, 'send');
      const mockMessage = {
        nmdsId: '1234',
        establishmentUid: 'mock-uid',
        user: {},
      };

      await postToFeedback(mockMessage);

      expect(sendSpy).to.have.been.calledOnce;

      const callArgument = sendSpy.getCall(0).args[0];
      expect(callArgument).to.be.instanceOf(PublishCommand);
      expect(callArgument.input).to.deep.equal({
        Message: '{"nmdsId":"1234","establishmentUid":"mock-uid","user":{}}',
        TopicArn: feedbackTopicArn,
      });
    });
  });
});
