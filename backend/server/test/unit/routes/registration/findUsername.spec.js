const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');

const { findUsername } = require('../../../../routes/registration/findUsername');
const models = require('../../../../models/index');
const { MaxFindUsernameAttempts, UserAccountStatus } = require('../../../../data/constants');

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

  let stubFindUserByUUID;
  let mockLoginModel;
  let mockUserModel;

  beforeEach(() => {
    mockLoginModel = {
      invalidFindUsernameAttempts: 0,
      status: null,
      lockAccount: sinon.stub(),
      recordInvalidFindUsernameAttempts: sinon.stub(),
    };
    mockLoginModel.recordInvalidFindUsernameAttempts.callsFake(() => {
      mockLoginModel.invalidFindUsernameAttempts += 1;
    });

    mockUserModel = {
      uid: 'mock-uid',
      securityQuestionAnswer: '42',
      username: 'test-user',
      getLogin: () => mockLoginModel,
    };
    stubFindUserByUUID = sinon.stub(models.user, 'findByUUID').callsFake((uid) => {
      return uid === mockUserModel.uid ? mockUserModel : null;
    });
    sinon.stub(models.sequelize, 'transaction').callsFake((dbOperations) => dbOperations());
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

    expect(stubFindUserByUUID).to.have.been.calledWith('mock-uid');
    expect(mockLoginModel.recordInvalidFindUsernameAttempts).not.to.have.been.called;
    expect(mockLoginModel.lockAccount).not.to.have.been.called;
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

    expect(mockLoginModel.recordInvalidFindUsernameAttempts).to.have.been.calledOnce;
    expect(mockLoginModel.lockAccount).not.to.have.been.called;
  });

  it('should respond with reducing number of remainingAttempts on successive wrong answers', async () => {
    for (const i of [1, 2, 3, 4, 5]) {
      const expectedRemainingAttempts = 5 - i;
      const req = buildRequest({ uid: 'mock-uid', securityQuestionAnswer: 'some random answer' });
      const res = httpMocks.createResponse();

      await findUsername(req, res);

      expect(res.statusCode).to.equal(401);
      expect(res._getJSONData()).to.deep.equal({
        answerCorrect: false,
        remainingAttempts: expectedRemainingAttempts,
      });
      expect(mockLoginModel.recordInvalidFindUsernameAttempts).to.have.been.callCount(i);

      if (i === 5) {
        expect(mockLoginModel.lockAccount).to.have.been.called;
      } else {
        expect(mockLoginModel.lockAccount).not.to.have.been.called;
      }
    }
  });

  it('should respond with 401 Unauthorised if account is locked, even if the answer is correct', async () => {
    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();
    mockLoginModel.status = UserAccountStatus.Locked;

    await findUsername(req, res);

    expect(res.statusCode).to.equal(401);
    expect(res._getJSONData()).to.deep.equal({
      answerCorrect: false,
      remainingAttempts: 0,
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

  it('should respond with 404 error if cannot find a user with the given uid', async () => {
    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();
    stubFindUserByUUID.resolves(null);

    await findUsername(req, res);

    expect(res.statusCode).to.equal(404);
  });

  it('should respond with 404 error if the user does not have login info setup yet', async () => {
    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();
    mockUserModel.getLogin = () => null;

    await findUsername(req, res);

    expect(res.statusCode).to.equal(404);
  });

  it('should respond with 500 Internal server error if an error is thrown', async () => {
    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();

    sinon.stub(console, 'error'); // suppress noisy logging
    stubFindUserByUUID.rejects(new Error('mock database error'));

    await findUsername(req, res);

    expect(res.statusCode).to.equal(500);
    expect(res._getData()).to.equal('Internal server error');
  });
});
