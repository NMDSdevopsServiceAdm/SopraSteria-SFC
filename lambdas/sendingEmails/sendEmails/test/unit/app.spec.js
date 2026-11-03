const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);

const SibApiV3Sdk = require('sib-api-v3-sdk');
const app = require('../../app');
const event = require('../../../events/event.json');
const redisStore = require('../../storeSendEmailResult');

let context;

describe('app.js', () => {
  beforeEach(() => {
    sinon.restore();
  });

  it('should return a status of 200', async () => {
    const sendTransacEmail = sinon.stub();
    sinon.stub(SibApiV3Sdk, 'TransactionalEmailsApi').returns({
      sendTransacEmail,
    });

    const lambdaHandlerTest = await app.lambdaHandler(event, context);

    expect(lambdaHandlerTest.statusCode).to.equal(200);
    expect(lambdaHandlerTest.body).to.equal('Call Successful');
  });

  it('should store a record in redis(valkey) if successfuly sent an email', async () => {
    const sendTransacEmail = sinon.stub();
    sinon.stub(SibApiV3Sdk, 'TransactionalEmailsApi').returns({
      sendTransacEmail,
    });
    sinon.stub(redisStore, 'storeSendEmailResult').resolves(true);

    await app.lambdaHandler(event, context);

    expect(redisStore.storeSendEmailResult).to.be.calledOnceWith({
      result: 'successful',
      templateId: 1,
      to: { name: 'test', email: 'test@test.com' },
      messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
    });
  });

  it('should store a record in redis(valkey) if failed to send the email', async () => {
    sinon.stub(console, 'error');

    const sendTransacEmail = sinon.stub().rejects(new Error({ statusCode: 401, message: 'unauthorised' }));
    sinon.stub(SibApiV3Sdk, 'TransactionalEmailsApi').returns({
      sendTransacEmail,
    });
    sinon.stub(redisStore, 'storeSendEmailResult').resolves(true);

    await app.lambdaHandler(event, context);

    expect(redisStore.storeSendEmailResult).to.be.calledOnceWith({
      result: 'failed',
      templateId: 1,
      to: { name: 'test', email: 'test@test.com' },
      messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
    });
  });

  it('should be able to record the error even if the input event is invalid', async () => {
    sinon.stub(console, 'error');

    const sendTransacEmail = sinon.stub();
    sinon.stub(SibApiV3Sdk, 'TransactionalEmailsApi').returns({
      sendTransacEmail,
    });
    sinon.stub(redisStore, 'storeSendEmailResult').resolves(true);

    await app.lambdaHandler('some invalid input', context);

    expect(redisStore.storeSendEmailResult).to.be.calledOnceWith({
      result: 'failed',
      templateId: undefined,
      to: undefined,
      messageId: undefined,
    });
  });
});
