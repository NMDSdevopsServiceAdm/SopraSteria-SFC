const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');

const { findUserAccount } = require('../../../../routes/registration/findUserAccount');
const findUserAccountUtils = require('../../../../utils/findUserAccountUtils');
const models = require('../../../../models/index');

describe.only('backend/server/routes/registration/findUserAccount', () => {
  const mockRequestBody = { name: 'Test User', workplaceIdOrPostcode: 'A1234567', email: 'test@example.com' };

  const buildRequest = (body) => {
    const request = {
      method: 'POST',
      url: '/api/registration/findUserAccount',
      body,
    };
    return httpMocks.createRequest(request);
  };

  let stubFindUser;
  let stubGetNumberOfFailedAttempts;
  let stubRecordFailedAttempt;

  beforeEach(() => {
    stubFindUser = sinon.stub(models.user, 'findByRelevantInfo').callsFake(({ workplaceId, postcode }) => {
      if (workplaceId === 'A1234567' || postcode === 'LS1 2RP') {
        return { uid: 'mock-uid', SecurityQuestionValue: 'What is your favourite colour?' };
      }
      return null;
    });

    let failedAttempts = 0;
    stubGetNumberOfFailedAttempts = sinon
      .stub(findUserAccountUtils, 'getNumberOfFailedAttempts')
      .resolves(failedAttempts);
    stubRecordFailedAttempt = sinon.stub(findUserAccountUtils, 'recordFailedAttempt').callsFake(async () => {
      failedAttempts += 1;
      return failedAttempts;
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should respond with 200 and accountFound: true if user account is found', async () => {
    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();

    await findUserAccount(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._getJSONData()).to.deep.equal({
      accountFound: true,
      accountUid: 'mock-uid',
      securityQuestion: 'What is your favourite colour?',
    });

    expect(stubFindUser).to.have.been.calledWith({
      name: 'Test User',
      workplaceId: 'A1234567',
      email: 'test@example.com',
    });
    expect(stubRecordFailedAttempt).not.to.be.called;
  });

  it('should find user with postcode if request body contains a postcode', async () => {
    const req = buildRequest({ ...mockRequestBody, workplaceIdOrPostcode: 'LS1 2RP' });
    const res = httpMocks.createResponse();

    await findUserAccount(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._getJSONData()).to.deep.equal({
      accountFound: true,
      accountUid: 'mock-uid',
      securityQuestion: 'What is your favourite colour?',
    });

    expect(stubFindUser).to.have.been.calledWith({
      name: 'Test User',
      postcode: 'LS1 2RP',
      email: 'test@example.com',
    });
  });

  it('should try to search with both postcode and workplace ID if incoming param is not distinguishable', async () => {
    const req = buildRequest({ ...mockRequestBody, workplaceIdOrPostcode: 'AB101AB' });
    const res = httpMocks.createResponse();

    await findUserAccount(req, res);

    expect(stubFindUser).to.have.been.calledWith({
      name: 'Test User',
      postcode: 'AB10 1AB',
      email: 'test@example.com',
    });

    expect(stubFindUser).to.have.been.calledWith({
      name: 'Test User',
      workplaceId: 'AB101AB',
      email: 'test@example.com',
    });
  });

  it('should respond with 200 and accountFound: false if user account was not found', async () => {
    const req = buildRequest({ ...mockRequestBody, workplaceIdOrPostcode: 'non-exist-workplace-id' });
    const res = httpMocks.createResponse();

    await findUserAccount(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._getJSONData()).to.deep.equal({
      accountFound: false,
      remainingAttempts: 4,
    });
    expect(stubRecordFailedAttempt).to.have.been.calledOnce;
  });

  it('should respond with reducing number of remainingAttempts on successive failure', async () => {
    for (const expectedRemainingAttempts of [4, 3, 2, 1, 0]) {
      const req = buildRequest({ ...mockRequestBody, workplaceIdOrPostcode: 'non-exist-workplace-id' });
      const res = httpMocks.createResponse();

      await findUserAccount(req, res);

      expect(res._getJSONData()).to.deep.equal({
        accountFound: false,
        remainingAttempts: expectedRemainingAttempts,
      });
    }
    expect(stubRecordFailedAttempt).to.have.been.callCount(5);
  });

  it('should not run user search if already failed for 5 times', async () => {
    stubGetNumberOfFailedAttempts.resolves(5);

    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();

    await findUserAccount(req, res);

    expect(res._getJSONData()).to.deep.equal({
      accountFound: false,
      remainingAttempts: 0,
    });
    expect(stubFindUser).not.to.be.called;
  });

  it('should respond with 400 error if request does not have a body', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/registration/findUserAccount',
    });
    const res = httpMocks.createResponse();

    await findUserAccount(req, res);
    expect(res.statusCode).to.equal(400);
  });

  it('should respond with 400 error if request body is empty', async () => {
    const req = buildRequest({});
    const res = httpMocks.createResponse();

    await findUserAccount(req, res);
    expect(res.statusCode).to.equal(400);
  });

  Object.keys(mockRequestBody).forEach((field) => {
    it(`should respond with 400 error if ${field} is missing from request body`, async () => {
      const body = { ...mockRequestBody };
      delete body[field];

      const req = buildRequest(body);
      const res = httpMocks.createResponse();

      await findUserAccount(req, res);
      expect(res.statusCode).to.equal(400);
    });
  });

  it('should respond with 500 Internal server error if an error occur when finding user', async () => {
    const req = buildRequest(mockRequestBody);
    const res = httpMocks.createResponse();

    sinon.stub(console, 'error'); // suppress noisy logging
    stubFindUser.rejects(new Error('mock database error'));

    await findUserAccount(req, res);

    expect(res.statusCode).to.equal(500);
    expect(res._getData()).to.equal('Internal server error');
  });
});
