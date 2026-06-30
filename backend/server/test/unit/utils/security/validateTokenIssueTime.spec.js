const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../models');

const {
  validateTokenIssueTimeAgainstPasswordChange,
  validateTokenIssueTimeAgainstLastLogout,
} = require('../../../../utils/security/validateTokenIssueTime');
const cacheUserLogoutTime = require('../../../../utils/cacheUserLogoutTime');

describe('validate token issue time', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('validateTokenIssueTimeAgainstPasswordChange', () => {
    it('should pass if the token in request is issued later than the most recent password change', async () => {
      const mockPasswordChangeTime = new Date(1780582609 * 1000);
      const mockTokenIssueTime = 1780582609 + 10;

      const mockRequest = {
        tokenIssuedAt: mockTokenIssueTime,
      };
      sinon.stub(models.login, 'getPasswordLastChangedTime').resolves(mockPasswordChangeTime);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      const next = sinon.spy();

      await validateTokenIssueTimeAgainstPasswordChange(req, res, next);

      expect(next).to.have.been.called;
    });

    it('should reject with 403 if the token is issued before the most recent password change', async () => {
      const mockPasswordChangeTime = new Date(1780582609 * 1000);
      const mockTokenIssueTime = 1780582609 - 10;

      const mockRequest = {
        tokenIssuedAt: mockTokenIssueTime,
      };
      sinon.stub(models.login, 'getPasswordLastChangedTime').resolves(mockPasswordChangeTime);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      const next = sinon.spy();

      await validateTokenIssueTimeAgainstPasswordChange(req, res, next);

      expect(next).not.to.have.been.called;
      expect(res.statusCode).to.equal(403);
    });

    it('should pass if the password last changed time is unknown', async () => {
      const mockTokenIssueTime = 1780582609 - 10;

      const mockRequest = {
        tokenIssuedAt: mockTokenIssueTime,
      };
      sinon.stub(models.login, 'getPasswordLastChangedTime').resolves(null);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      const next = sinon.spy();

      await validateTokenIssueTimeAgainstPasswordChange(req, res, next);

      expect(next).to.have.been.called;
    });
  });

  describe('validateTokenIssueTimeAgainstLastLogout', () => {
    it('should pass if the token is issued after the last logout time', async () => {
      const mockLogoutTime = 1780582609;
      const mockTokenIssueTime = mockLogoutTime + 10;

      const mockRequest = {
        tokenIssuedAt: mockTokenIssueTime,
      };
      sinon.stub(cacheUserLogoutTime, 'getUserLastLogoutTime').resolves(mockLogoutTime);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      const next = sinon.spy();

      await validateTokenIssueTimeAgainstLastLogout(req, res, next);

      expect(next).to.have.been.called;
    });

    it('should reject with 403 if the token was issued before the last logout', async () => {
      const mockLogoutTime = 1780582609;
      const mockTokenIssueTime = mockLogoutTime - 10;

      const mockRequest = {
        tokenIssuedAt: mockTokenIssueTime,
      };
      sinon.stub(cacheUserLogoutTime, 'getUserLastLogoutTime').resolves(mockLogoutTime);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      const next = sinon.spy();

      await validateTokenIssueTimeAgainstLastLogout(req, res, next);

      expect(next).not.to.have.been.called;
      expect(res.statusCode).to.equal(403);
    });

    it('should pass if the last logout time is not in cache', async () => {
      const mockLogoutTime = 1780582609;
      const mockTokenIssueTime = mockLogoutTime - 10;

      const mockRequest = {
        tokenIssuedAt: mockTokenIssueTime,
      };
      sinon.stub(cacheUserLogoutTime, 'getUserLastLogoutTime').resolves(null);

      const req = httpMocks.createRequest(mockRequest);
      const res = httpMocks.createResponse();
      const next = sinon.spy();

      await validateTokenIssueTimeAgainstLastLogout(req, res, next);

      expect(next).to.have.been.called;
    });
  });
});
