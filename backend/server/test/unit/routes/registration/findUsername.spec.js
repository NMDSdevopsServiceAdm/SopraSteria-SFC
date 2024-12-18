const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');

const { findUsername } = require('../../../../routes/registration/findUsername');
const models = require('../../../../models/index');

describe('backend/server/routes/registration/findUsername', () => {
  const mockRequestBody = {
    uid: 'mock-uid',
    securityQuestionAnswer: '42',
  };

  const buildRequest = (body) => {
    const request = {
      method: 'POST',
      url: '/api/registration/findUsername',
      body,
    };
    return httpMocks.createRequest(request);
  };

  let stubGetUsername;

  beforeEach(() => {
    stubGetUsername = sinon
      .stub(models.user, 'getUsernameWithSecurityQuestionAnswer')
      .callsFake(({ securityQuestionAnswer }) => {
        if (securityQuestionAnswer === '42') {
          return { username: 'test-user' };
        }
        return null;
      });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should respond with 200 and username if securityQuestionAnswer is correct', async () => {
    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();

    await findUsername(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._getJSONData()).to.deep.equal({
      answerCorrect: true,
      username: 'test-user',
    });

    expect(stubGetUsername).to.have.been.calledWith({
      uid: 'mock-uid',
      securityQuestionAnswer: '42',
    });
  });

  it('should respond with 401 Unauthorised and number of remainingAttempts if securityQuestionAnswer is incorrect', async () => {
    const req = buildRequest({ uid: 'mock-uid', securityQuestionAnswer: 'some random thing' });
    const res = httpMocks.createResponse();

    await findUsername(req, res);

    expect(res.statusCode).to.equal(401);
    expect(res._getJSONData()).to.deep.equal({
      answerCorrect: false,
      remainingAttempts: 4,
    });
  });

  it('should respond with 400 error if request does not have a body', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/registration/findUsername',
    });
    const res = httpMocks.createResponse();

    await findUsername(req, res);

    expect(res.statusCode).to.equal(400);
  });

  it('should respond with 400 error if request body is empty', async () => {
    const req = buildRequest({});
    const res = httpMocks.createResponse();

    await findUsername(req, res);

    expect(res.statusCode).to.equal(400);
  });

  it('should respond with 400 error if securityQuestionAnswer is missing', async () => {
    const req = buildRequest({ uid: mockRequestBody.uid });
    const res = httpMocks.createResponse();

    await findUsername(req, res);

    expect(res.statusCode).to.equal(400);
  });

  it('should respond with 400 error if uid is missing', async () => {
    const req = buildRequest({ securityQuestionAnswer: mockRequestBody.securityQuestionAnswer });
    const res = httpMocks.createResponse();

    await findUsername(req, res);

    expect(res.statusCode).to.equal(400);
  });

  it('should respond with 500 Internal server error if an error occur when finding user', async () => {
    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();

    sinon.stub(console, 'error'); // suppress noisy logging
    stubGetUsername.rejects(new Error('mock database error'));

    await findUsername(req, res);

    expect(res.statusCode).to.equal(500);
    expect(res._getData()).to.equal('Internal server error');
  });
});
