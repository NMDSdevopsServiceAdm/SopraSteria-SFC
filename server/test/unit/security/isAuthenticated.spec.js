const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Sentry = require('@sentry/node');

const config = require('../../../config/config');
const models = require('../../../models');
const jwt = require('jsonwebtoken');

const { getTokenSecret, authorisedEstablishmentPermissionCheck } = require('../../../utils/security/isAuthenticated');

describe('isAuthenticated', () => {
  describe('getTokenSecret', () => {
    it('returns the default secret in the config', () => {
      const secret = getTokenSecret();
      expect(secret).to.equal('nodeauthsecret');
    });
  });

  describe('authorisedEstablishmentPermissionCheck', () => {
    let jwtStub;
    let sentrySetUserStub;
    let sentrySetContextStub;
    let initialiseDbMock;

    beforeEach(() => {
      jwtStub = sinon.stub(jwt, 'verify');
      sentrySetUserStub = sinon.stub(Sentry, 'setUser');
      sentrySetContextStub = sinon.stub(Sentry, 'setContext');
      initialiseDbMock = (
        parentId = 'my-parentId',
        isParent = false,
        id = 1,
        dataPermissions = null,
        nmdsId = 'nmdsId',
        dataOwner = 'Parent',
      ) =>
        sinon.replace(models.establishment, 'findOne', () => {
          return {
            parentId,
            isParent,
            id,
            dataPermissions,
            nmdsId,
            dataOwner,
          };
        });
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

    it('returns a 403 if role check is request, req method is not GET and claim role is read only', async () => {
      const establishmentUid = '004aadf4-8e1a-4450-905b-6039179f52da';
      jwtStub.returns({
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: 1,
        EstablishmentUID: establishmentUid,
        role: 'Read',
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        headers: {
          authorization: 'arealjwt',
        },
        params: {
          id: establishmentUid,
        },
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), true);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.deep.equal({ message: 'Not permitted' });
    });

    it('returns a 403 if param ID does not match the establishment ID and claim is not a parent', async () => {
      const establishmentUid = '004aadf4-8e1a-4450-905b-6039179f5fff';
      const claimReturn = {
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: 13,
        EstablishmentUID: establishmentUid,
        sub: 'anySub',
        userUid: 'someUid',
        parentId: 123,
        isParent: false,
        role: 'Read',
      };
      jwtStub.returns(claimReturn);

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: 123,
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();
      initialiseDbMock();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal(`Not permitted to access Establishment with id: ${req.params.id}`);
    });

    it('follows happy path for authorised establishment when foundEstablishment is a subsidiary', async () => {
      const establishmentUid = '004aadf4-8e1a-4450-905b-6039179f5fff';
      const claimReturn = {
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: 13,
        EstablishmentUID: establishmentUid,
        sub: 'anySub',
        userUid: 'someUid',
        parentId: 123,
        isParent: false,
        role: 'Read',
      };
      jwtStub.returns(claimReturn);
      const sqreenIdentifyFake = sinon.fake();

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: establishmentUid,
        },
        sqreen: {
          identify: (arg1, arg2, arg3) => sqreenIdentifyFake(arg1, arg2, arg3),
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();
      initialiseDbMock();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);
      // check req object is updated
      expect(req).to.deep.include({
        username: claimReturn.sub,
        userUid: claimReturn.userUid,
        user: { id: claimReturn.userUid },
        isParent: claimReturn.isParent,
        role: claimReturn.role,
        establishment: {
          id: claimReturn.EstblishmentId,
          uid: claimReturn.EstablishmentUID,
          isSubsidiary: Boolean(claimReturn.parentId),
          isParent: false,
        },
        dataPermissions: null,
        parentIsOwner: true,
      });

      // check squeen is called with correct payload
      expect(
        sqreenIdentifyFake.calledWith(
          req,
          {
            userId: req.userUid,
            establishmentId: req.establishment.uid,
          },
          {
            isParent: req.establishment.isParent,
            role: req.role,
          },
        ),
      ).to.equal(true);

      // Assert on sentry calls
      expect(
        sentrySetUserStub.calledOnceWith({
          username: req.username,
          id: req.userUid,
          ip_address: req.headers['x-forwarded-for'],
        }),
      ).to.equal(true);

      expect(sentrySetContextStub.getCall(0).args[0]).to.equal('establishment');
      expect(sentrySetContextStub.getCall(0).args[1]).to.eql({
        id: req.establishment.id,
        uid: req.establishment.uid,
        isParent: req.isParent,
        nmdsID: 'nmdsId',
      });

      expect(sentrySetContextStub.getCall(1).args[0]).to.equal('user');
      expect(sentrySetContextStub.getCall(1).args[1]).to.eql({
        username: req.username,
        id: req.userUid,
        ip_address: req.headers['x-forwarded-for'],
        role: req.role,
      });

      expect(next.calledOnce).to.equal(true);
    });

    it('follows happy path for authorised establishment when foundEstablishment is a parent', async () => {
      const establishmentUid = '004aadf4-8e1a-4450-905b-6039179f52da';
      const claimReturn = {
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: 1,
        EstablishmentUID: establishmentUid,
        sub: null,
        userUid: 'someUid',
        parentId: null,
        isParent: false,
        role: 'Read',
      };
      jwtStub.returns(claimReturn);
      const sqreenIdentifyFake = sinon.fake();

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: establishmentUid,
        },
        sqreen: {
          identify: (arg1, arg2, arg3) => sqreenIdentifyFake(arg1, arg2, arg3),
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();
      initialiseDbMock(null, true); // make db return as a parent

      await authorisedEstablishmentPermissionCheck(req, res, next, true);
      // check req object is updated
      expect(req).to.deep.include({
        username: claimReturn.sub,
        userUid: claimReturn.userUid,
        user: { id: claimReturn.userUid },
        isParent: claimReturn.isParent,
        role: claimReturn.role,
        establishment: {
          id: claimReturn.EstblishmentId,
          uid: claimReturn.EstablishmentUID,
          isSubsidiary: Boolean(claimReturn.parentId),
          isParent: true,
        },
        dataPermissions: null,
        parentIsOwner: true,
      });

      // check squeen is called with correct payload
      expect(
        sqreenIdentifyFake.calledWith(
          req,
          {
            userId: req.userUid,
            establishmentId: req.establishment.uid,
          },
          {
            isParent: req.establishment.isParent,
            role: req.role,
          },
        ),
      ).to.equal(true);

      // Assert on sentry calls
      expect(
        sentrySetUserStub.calledOnceWith({
          username: req.username,
          id: req.userUid,
          ip_address: req.headers['x-forwarded-for'],
        }),
      ).to.equal(true);

      expect(sentrySetContextStub.getCall(0).args[0]).to.equal('establishment');
      expect(sentrySetContextStub.getCall(0).args[1]).to.eql({
        id: req.establishment.id,
        uid: req.establishment.uid,
        isParent: req.isParent,
        nmdsID: 'nmdsId',
      });

      expect(sentrySetContextStub.getCall(1).args[0]).to.equal('user');
      expect(sentrySetContextStub.getCall(1).args[1]).to.eql({
        username: req.username,
        id: req.userUid,
        ip_address: req.headers['x-forwarded-for'],
        role: req.role,
      });

      expect(next.calledOnce).to.equal(true);
    });
  });
});
