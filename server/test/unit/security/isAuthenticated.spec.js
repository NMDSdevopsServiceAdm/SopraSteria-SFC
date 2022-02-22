const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Sentry = require('@sentry/node');
const squeen = require('sqreen');

const config = require('../../../config/config');
const jwt = require('jsonwebtoken');

const { getTokenSecret, authorisedEstablishmentPermissionCheck } = require('../../../utils/security/isAuthenticated');

describe.only('isAuthenticated', () => {
  describe('getTokenSecret', () => {
    it('returns the default secret in the config', () => {
      const secret = getTokenSecret();
      expect(secret).to.equal('nodeauthsecret');
    });
  });

  describe('authorisedEstablishmentPermissionCheck', () => {
    let jwtStub;
    beforeEach(() => {
      sinon.stub(squeen);
      sinon.stub(Sentry);
      jwtStub = sinon.stub(jwt, 'verify');
    });
    afterEach(() => {
      sinon.restore();
    });
    it('returns a 401 if no token is available', async () => {
      const req = httpMocks.createRequest({ headers: {} });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), null);
      expect(res.statusCode).to.equal(401);
    });

    it('returns a 403 with error message if token is malformed', async () => {
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'foo',
        },
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), null);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.deep.equal({ sucess: false, message: 'token is invalid' });
    });

    it('returns a 403 with error message if claim audience does not match', async () => {
      jwtStub.returns({ aud: 'not-the-one', iss: config.get('jwt.iss') });

      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), null);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.deep.equal({ sucess: false, message: 'token is invalid' });
    });

    it('returns a 403 with error message if claim issue does not match', async () => {
      jwtStub.returns({ aud: config.get('jwt.aud.login'), iss: 'not-the-one' });

      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), null);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.deep.equal({ sucess: false, message: 'token is invalid' });
    });

    it('returns a 400 status if EstblishmentId is missing from claim', async () => {
      jwtStub.returns({ aud: config.get('jwt.aud.login'), iss: config.get('jwt.iss') });

      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), null);

      const data = res._getData();
      expect(res.statusCode).to.equal(400);
      expect(data).to.equal('Unknown Establishment ID');
    });

    it('returns a 400 status if EstblishmentId is not a number', async () => {
      jwtStub.returns({
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: 'foo',
      });

      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), null);

      const data = res._getData();
      expect(res.statusCode).to.equal(400);
      expect(data).to.equal('Unknown Establishment ID');
    });

    it('returns a 400 status if EstablishmentUID is missing from claim', async () => {
      jwtStub.returns({
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: 1,
      });

      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), null);

      const data = res._getData();
      expect(res.statusCode).to.equal(400);
      expect(data).to.equal('Unknown Establishment UID');
    });

    it('returns a 400 status if EstablishmentUID is not a UID format', async () => {
      jwtStub.returns({
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: 1,
        EstablishmentUID: 'not-a-uid',
      });

      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), null);

      const data = res._getData();
      expect(res.statusCode).to.equal(400);
      expect(data).to.equal('Unknown Establishment UID');
    });
  });
});
