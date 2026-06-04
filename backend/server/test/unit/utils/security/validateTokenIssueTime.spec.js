const chai = require('chai');
const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../models');

const { validateTokenIssueTimeAgainstPasswordChange } = require('../../../../utils/security/validateTokenIssueTime');

describe.only('validateTokenIssueTimeAgainstPasswordChange', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should pass if the token in request is issued later than the most recent password change', async () => {
    const mockPasswordChangeTime = new Date(1780582609 * 1000);
    const mockTokenIssueTime = 1780582609 + 10;

    const mockRequest = {
      tokenIssuedAt: mockTokenIssueTime,
    };
    sinon.stub(models.login, 'getPasswordLastChangedTime').returns(mockPasswordChangeTime);

    const req = httpMocks.createRequest(mockRequest);
    const res = httpMocks.createResponse();
    const next = sinon.spy();

    await validateTokenIssueTimeAgainstPasswordChange(req, res, next);

    expect(next).to.be.called;
  });

  it('should reject with 403 if the token is issued before the most recent password change', async () => {
    const mockPasswordChangeTime = new Date(1780582609 * 1000);
    const mockTokenIssueTime = 1780582609 - 10;

    const mockRequest = {
      tokenIssuedAt: mockTokenIssueTime,
    };
    sinon.stub(models.login, 'getPasswordLastChangedTime').returns(mockPasswordChangeTime);

    const req = httpMocks.createRequest(mockRequest);
    const res = httpMocks.createResponse();
    const next = sinon.spy();

    await validateTokenIssueTimeAgainstPasswordChange(req, res, next);

    expect(next).not.to.be.called;
    expect(res.statusCode).to.equal(403);
  });

  it('should pass if the most recent password change time is unknown', async () => {
    const mockTokenIssueTime = 1780582609 - 10;

    const mockRequest = {
      tokenIssuedAt: mockTokenIssueTime,
    };
    sinon.stub(models.login, 'getPasswordLastChangedTime').returns(null);

    const req = httpMocks.createRequest(mockRequest);
    const res = httpMocks.createResponse();
    const next = sinon.spy();

    await validateTokenIssueTimeAgainstPasswordChange(req, res, next);

    expect(next).to.be.called;
  });
});
