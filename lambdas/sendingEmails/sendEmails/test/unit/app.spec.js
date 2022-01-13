const SibApiV3Sdk = require('sib-api-v3-sdk');
const sinon = require('sinon');
const expect = require('chai').expect;
const app = require('../../app');
const event = require('../../../events/event.json');

let context;

describe('app.js', () => {
  it('should return a status of 200', async () => {
    const sendTransacEmail = sinon.stub();
    sinon.stub(SibApiV3Sdk, 'TransactionalEmailsApi').returns({
      sendTransacEmail,
    });

    const lambdaHandlerTest = await app.lambdaHandler(event, context);

    expect(lambdaHandlerTest.statusCode).to.equal(200);
    expect(lambdaHandlerTest.body).to.equal('Call Successful');
  });
});
