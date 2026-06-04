const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const generateJWT = require('../../../utils/security/generateJWT');

const { refreshToken } = require('../../../routes/login')._controllers;

describe.only('login', () => {
  afterEach(() => {
    sinon.restore();
  });

  const defaultMockRequest = {
    method: 'GET',
    url: '/api/login/refresh',
    establishment: { id: 123, uid: 'mock-uid' },
  };

  describe('GET /login/refresh/   refreshToken', () => {
    it('should respond with 200 and a refreshed token', async () => {
      sinon.stub(generateJWT, 'regenerateLoginToken').returns('mock-new-token');

      const req = httpMocks.createRequest(defaultMockRequest);
      const res = httpMocks.createResponse();

      await refreshToken(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.getHeader('Authorization')).to.deep.equal('Bearer mock-new-token');
    });
  });
});
