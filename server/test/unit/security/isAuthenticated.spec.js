const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Sentry = require('@sentry/node');

const config = require('../../../config/config');
const models = require('../../../models');
const jwt = require('jsonwebtoken');

const {
  getTokenSecret,
  authorisedEstablishmentPermissionCheck,
  isAdmin,
  isAdminManager,
  isReadOnlyTryingToNotGET,
  parentNoWriteAccess,
} = require('../../../utils/security/isAuthenticated');

describe('isAuthenticated', () => {
  describe('getTokenSecret', () => {
    it('returns the default secret in the config', () => {
      const secret = getTokenSecret();
      expect(secret).to.equal('nodeauthsecret');
    });
  });

  describe('authorisedEstablishmentPermissionCheck', () => {
    const establishmentUid = '004aadf4-8e1a-4450-905b-6039179f5fff';
    let jwtStub;
    let sentrySetUserStub;
    let sentrySetContextStub;
    let dbStub;
    let claimReturn;

    beforeEach(() => {
      jwtStub = sinon.stub(jwt, 'verify');
      sentrySetUserStub = sinon.stub(Sentry, 'setUser');
      sentrySetContextStub = sinon.stub(Sentry, 'setContext');
      dbStub = sinon.stub(models.establishment, 'authenticateEstablishment');
      claimReturn = {
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: 123,
        EstablishmentUID: establishmentUid,
        sub: 'anySub',
        userUid: 'someUid',
        parentId: 123,
        isParent: false,
        role: 'Read',
      };
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
      expect(data).to.deep.equal({ success: false, message: 'token is invalid' });
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
      expect(data).to.deep.equal({ success: false, message: 'token is invalid' });
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
      expect(data).to.deep.equal({ success: false, message: 'token is invalid' });
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
      expect(data).to.equal('Unknown Establishment');
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
      expect(data).to.equal('Unknown Establishment');
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
      expect(data).to.equal('Unknown Establishment');
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
      expect(data).to.equal('Unknown Establishment');
    });

    it('returns a 403 if role check is request, req method is not GET, claim role is read only and the req.path is not /benchmarks/usage', async () => {
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
        path: '/something',
      });
      const res = httpMocks.createResponse();

      await authorisedEstablishmentPermissionCheck(req, res, sinon.fake(), true);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.deep.equal({ message: 'Not permitted' });
    });

    it('returns a 403 if param ID does not match the establishment ID and claim is not a parent', async () => {
      jwtStub.returns({ ...claimReturn, EstblishmentId: 13 });

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: 123,
        },
        establishmentId: 123,
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal(`Not permitted to access Establishment with id: ${req.params.id}`);
    });

    it('follows success path for authorised establishment when foundEstablishment is a subsidiary', async () => {
      jwtStub.returns(claimReturn);
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ id: 123 });
        return {
          id: 123,
          dataPermissions: null,
          dataOwner: 'Parent',
          parentId: 456,
          nmdsId: 'nmdsId',
          isParent: false,
        };
      });

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

      // Assert on sentry calls
      expect(
        sentrySetUserStub.calledOnceWith({
          username: req.username,
          id: req.userUid,
          ip_address: req.headers['x-forwarded-for'],
        }),
      ).to.be.true;

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

      expect(next.calledOnce).to.be.true;
    });

    it('follows success path for authorised establishment when foundEstablishment is a parent', async () => {
      jwtStub.returns({ ...claimReturn, parentId: null });
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ uid: establishmentUid });
        return {
          id: 123,
          dataPermissions: null,
          dataOwner: 'Parent',
          parentId: null,
          nmdsId: 'nmdsId',
          isParent: true,
        };
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: establishmentUid,
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

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
          isSubsidiary: false,
          isParent: true,
        },
        dataPermissions: null,
        parentIsOwner: true,
      });

      // Assert on sentry calls
      expect(
        sentrySetUserStub.calledOnceWith({
          username: req.username,
          id: req.userUid,
          ip_address: req.headers['x-forwarded-for'],
        }),
      ).to.be.true;

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

      expect(next.calledOnce).to.be.true;
    });

    it('returns a 403 if parent establishment only has "Read" access', async () => {
      jwtStub.returns({ ...claimReturn, parentId: 123, isParent: true });

      const req = httpMocks.createRequest({
        method: 'POST',
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

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.eql({ message: 'Not permitted' });
    });

    it('returns a 403 if a non-admin where the data owner is Workplace and parent has no data permissions', async () => {
      jwtStub.returns({ ...claimReturn, parentId: null, isParent: true, role: 'Edit' });
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ id: 13, parentId: 123 });
        return {
          id: 13,
          dataPermissions: null,
          dataOwner: 'Workplace',
          parentId: 123,
        };
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: 13,
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      const consoleSpy = sinon.spy(console, 'error');

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      expect(
        consoleSpy.calledOnceWithExactly(
          `Found subsidiary establishment (${req.params.id}) for this known parent (${claimReturn.EstblishmentId}/${claimReturn.EstablishmentUID}), but access has not been given`,
        ),
      ).to.be.true;

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.eql({ message: `Parent not permitted to access/update Establishment with id: ${req.params.id}` });
    });

    it('returns a 403 if parent with "Read" only access tried to update an establishment', async () => {
      jwtStub.returns({ ...claimReturn, parentId: null, isParent: true, role: 'Edit' });
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ id: 13, parentId: 123 });
        return {
          id: 13,
          dataPermissions: 'Workplace',
          dataOwner: 'Workplace',
          parentId: 123,
        };
      });

      const req = httpMocks.createRequest({
        method: 'PUT',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: 13,
        },
        path: '/not-the-path-i-wanted',
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.eql({
        message: `Parent not permitted to access/update Establishment with id: ${req.params.id}`,
      });
    });

    it('follows success if establishment ID does not match passed ID but token is from a parent - (Subsidiary path)', async () => {
      jwtStub.returns({ ...claimReturn, isParent: true, EstblishmentId: 123 });
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ id: 133, parentId: 123 });
        return {
          id: 133,
          dataPermissions: null,
          dataOwner: 'Parent',
          parentId: 123,
        };
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: 133,
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      // assert req object has been updated
      expect(req).to.deep.include({
        establishmentId: 133,
        parentIsOwner: true,
        dataPermissions: null,
        username: claimReturn.sub,
        userUid: claimReturn.userUid,
        user: {
          id: claimReturn.userUid,
        },
        isParent: true,
        role: claimReturn.role,
        establishment: {
          id: 123,
          uid: claimReturn.EstablishmentUID,
          isSubsidiary: true,
          isParent: false,
        },
      });

      expect(res.statusCode).to.equal(200), expect(next.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
    });

    it('follows success if establishment ID does not match passed ID but token is from a parent - (Parent path)', async () => {
      jwtStub.returns({ ...claimReturn, isParent: true, EstblishmentId: 123 });
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ id: 143, parentId: 123 });
        return {
          id: 143,
          dataPermissions: null,
          dataOwner: 'Parent',
          parentId: null,
          isParent: true,
        };
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: 143,
        },
        establishmentId: 143,
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      // assert req object has been updated
      expect(req).to.deep.include({
        establishmentId: 143,
        parentIsOwner: true,
        dataPermissions: null,
        username: claimReturn.sub,
        userUid: claimReturn.userUid,
        user: {
          id: claimReturn.userUid,
        },
        isParent: true,
        role: claimReturn.role,
        establishment: {
          id: claimReturn.EstblishmentId,
          uid: claimReturn.EstablishmentUID,
          isSubsidiary: false,
          isParent: true,
        },
      });

      expect(res.statusCode).to.equal(200), expect(next.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
    });

    it('follows success if establishment ID does not match passed ID but token is from a parent - (has establishment UID)', async () => {
      jwtStub.returns({ ...claimReturn, isParent: true, EstblishmentId: 123 });
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ parentId: 123, uid: '000aedf4-8e1a-4450-905b-6039179f5fff' });
        return {
          id: 133,
          dataPermissions: null,
          dataOwner: 'Parent',
          parentId: null,
          isParent: true,
        };
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: '000aedf4-8e1a-4450-905b-6039179f5fff',
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      // assert req object has been updated
      expect(req).to.deep.include({
        establishmentId: 133,
        parentIsOwner: true,
        dataPermissions: null,
        username: claimReturn.sub,
        userUid: claimReturn.userUid,
        user: {
          id: claimReturn.userUid,
        },
        isParent: true,
        role: claimReturn.role,
        establishment: {
          id: claimReturn.EstblishmentId,
          uid: claimReturn.EstablishmentUID,
          isSubsidiary: false,
          isParent: true,
        },
      });

      expect(res.statusCode).to.equal(200), expect(next.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
    });

    it('returns 403 if not GET and user has read-only permissions', async () => {
      jwtStub.returns({ ...claimReturn, isParent: true, EstblishmentId: 123 });
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ parentId: 123, uid: '000aedf4-8e1a-4450-905b-6039179f5fff' });
        return {
          id: 133,
          dataPermissions: null,
          dataOwner: 'Parent',
          parentId: null,
          isParent: true,
        };
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: '000aedf4-8e1a-4450-905b-6039179f5fff',
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      expect(res.statusCode).to.equal(403);
      expect(res._getData()).to.deep.equal({ message: 'Not permitted' });
    });

    it('returns 403 if the database call throws', async () => {
      jwtStub.returns({ ...claimReturn, isParent: true, EstblishmentId: 123 });
      dbStub.throws();

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: '000aedf4-8e1a-4450-905b-6039179f5fff',
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      expect(res.statusCode).to.equal(403);
      expect(res._getData()).to.equal(`Not permitted to access Establishment with id: ${req.params.id}`);
    });

    it('return a 403 when the token verify throws an expired token error', async () => {
      jwtStub.throws({ name: 'TokenExpiredError' });

      const req = httpMocks.createRequest({
        method: 'POST',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: '000aedf4-8e1a-4450-905b-6039179f5fff',
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      expect(res.statusCode).to.equal(403);
      expect(res._getData()).to.deep.equal({ success: false, message: 'token expired' });
    });

    it('does not add the parent ID to the database WHERE clause if establishment matches claim - (UID)', async () => {
      jwtStub.returns({ ...claimReturn, isParent: true, EstablishmentUID: establishmentUid });
      dbStub.callsFake((where) => {
        expect(where).to.deep.equal({ uid: establishmentUid });
        return {
          id: 143,
          dataPermissions: null,
          dataOwner: 'Parent',
          parentId: null,
          isParent: true,
        };
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        headers: {
          authorization: 'arealjwt',
          'x-forwarded-for': 'my-ip',
        },
        params: {
          id: establishmentUid,
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await authorisedEstablishmentPermissionCheck(req, res, next, true);

      expect(res.statusCode).to.equal(200), expect(next.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('isAdmin', () => {
    let jwtStub;
    let claimReturn;

    beforeEach(() => {
      jwtStub = sinon.stub(jwt, 'verify');

      claimReturn = {
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: null,
        EstablishmentUID: null,
        sub: 'anySub',
        userUid: 'someUid',
        parentId: 123,
        isParent: false,
        role: 'Admin',
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('returns a 401 if no token is available', async () => {
      const req = httpMocks.createRequest({ headers: {} });
      const res = httpMocks.createResponse();

      await isAdmin(req, res, sinon.fake());
      expect(res.statusCode).to.equal(401);
    });

    it('returns a 403 with error message if token is malformed', async () => {
      jwtStub.callsArgWith(2, 'Error', {});
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'foo',
        },
      });
      const res = httpMocks.createResponse();

      await isAdmin(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal('Invalid Token');
    });

    it('returns a 403 with error message if claim audience does not match', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn, aud: 'not-the-one' });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await isAdmin(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal('Invalid Token');
    });

    it('returns a 403 with error message if claim issue does not match', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn, iss: 'not-the-one' });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await isAdmin(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal('Invalid Token');
    });

    it('returns a 403 with error message if claim role is not an Admin', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn, role: 'Read' });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await isAdmin(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal(`You're not admin`);
    });

    it('returns a 401 with error message if there is not a token', async () => {
      const req = httpMocks.createRequest({
        headers: {
          authorization: '',
        },
      });
      const res = httpMocks.createResponse();

      await isAdmin(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(401);
      expect(data).to.equal('Requires authorisation');
    });

    it('follows success path if the claim role is an Admin', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });

      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await isAdmin(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it('follows success path if the claim role is an AdminManager', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn, role: 'AdminManager' });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });

      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await isAdmin(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  describe('isAdminManager', () => {
    let jwtStub;
    let claimReturn;

    beforeEach(() => {
      jwtStub = sinon.stub(jwt, 'verify');

      claimReturn = {
        aud: config.get('jwt.aud.login'),
        iss: config.get('jwt.iss'),
        EstblishmentId: null,
        EstablishmentUID: null,
        sub: 'anySub',
        userUid: 'someUid',
        parentId: 123,
        isParent: false,
        role: 'AdminManager',
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('returns a 401 if no token is available', async () => {
      const req = httpMocks.createRequest({ headers: {} });
      const res = httpMocks.createResponse();

      await isAdminManager(req, res, sinon.fake());
      expect(res.statusCode).to.equal(401);
    });

    it('returns a 403 with error message if token is malformed', async () => {
      jwtStub.callsArgWith(2, 'Error', {});
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'foo',
        },
      });
      const res = httpMocks.createResponse();

      await isAdminManager(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal('Invalid Token');
    });

    it('returns a 403 with error message if claim audience does not match', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn, aud: 'not-the-one' });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await isAdminManager(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal('Invalid Token');
    });

    it('returns a 403 with error message if claim issue does not match', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn, iss: 'not-the-one' });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await isAdminManager(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal('Invalid Token');
    });

    it('returns a 403 with error message if claim role is not an Admin Manager', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn, role: 'Read' });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await isAdminManager(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal(`You're not an admin manager`);
    });

    it('returns a 403 with error message if claim role is not an Admin Manager', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn, role: 'Admin' });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });
      const res = httpMocks.createResponse();

      await isAdminManager(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(403);
      expect(data).to.equal(`You're not an admin manager`);
    });

    it('returns a 401 with error message if there is not a token', async () => {
      const req = httpMocks.createRequest({
        headers: {
          authorization: '',
        },
      });
      const res = httpMocks.createResponse();

      await isAdminManager(req, res, sinon.fake());

      const data = res._getData();
      expect(res.statusCode).to.equal(401);
      expect(data).to.equal('Requires authorisation');
    });

    it('follows success path if the claim role is an AdminManager', async () => {
      jwtStub.callsArgWith(2, null, { ...claimReturn });
      const req = httpMocks.createRequest({
        headers: {
          authorization: 'arealjwt',
        },
      });

      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await isAdminManager(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  describe('isReadOnlyTryingToNotGET', () => {
    it('returns true if role check is true, req method is not GET, claim role is read only and the req.path is not /benchmarks/usage', async () => {
      const claim = { role: 'Read' };
      const req = {
        path: '/something',
        method: 'POST',
      };
      const roleCheck = true;

      const result = isReadOnlyTryingToNotGET(roleCheck, req, claim);
      expect(result).to.be.true;
    });

    it('returns false if role check is false, req method is not GET, claim role is read only and the req.path is not /benchmarks/usage', async () => {
      const claim = { role: 'Read' };
      const req = {
        path: '/something',
        method: 'POST',
      };
      const roleCheck = false;

      const result = isReadOnlyTryingToNotGET(roleCheck, req, claim);
      expect(result).to.be.false;
    });

    it('returns false if role check is true, req method is GET, claim role is read only and the req.path is not /benchmarks/usage', async () => {
      const claim = { role: 'Read' };
      const req = {
        path: '/something',
        method: 'GET',
      };
      const roleCheck = true;

      const result = isReadOnlyTryingToNotGET(roleCheck, req, claim);
      expect(result).to.be.false;
    });

    it('returns false if role check is true, req method is not GET, claim role is not read only and the req.path is not /benchmarks/usage', async () => {
      const claim = { role: 'Edit' };
      const req = {
        path: '/something',
        method: 'POST',
      };
      const roleCheck = true;

      const result = isReadOnlyTryingToNotGET(roleCheck, req, claim);
      expect(result).to.be.false;
    });

    it('returns false if role check is true, req method is not GET, claim role is read only and the req.path is /benchmarks/usage', async () => {
      const claim = { role: 'Read' };
      const req = {
        path: '/benchmarks/usage',
        method: 'POST',
      };
      const roleCheck = true;

      const result = isReadOnlyTryingToNotGET(roleCheck, req, claim);
      expect(result).to.be.false;
    });
  });

  describe('parentNoWriteAccess', () => {
    it('returns true if req method is not GET and if req.path is not /benchmarks/usage or /ownershipChange', async () => {
      const req = {
        path: '/something',
        method: 'POST',
      };

      const result = parentNoWriteAccess(req);
      expect(result).to.be.true;
    });

    it('returns false if req method is GET and if req.path is not /benchmarks/usage or /ownershipChange', async () => {
      const req = {
        path: '/something',
        method: 'GET',
      };

      const result = parentNoWriteAccess(req);
      expect(result).to.be.false;
    });

    it('returns false if req method is not GET and if req.path is not /benchmarks/usage but is /ownershipChange', async () => {
      const req = {
        path: '/ownershipChange',
        method: 'POST',
      };

      const result = parentNoWriteAccess(req);
      expect(result).to.be.false;
    });

    it('returns false if req method is not GET and if req.path is not /ownershipChange but is /benchmarks/usage', async () => {
      const req = {
        path: '/benchmarks/usage',
        method: 'POST',
      };

      const result = parentNoWriteAccess(req);
      expect(result).to.be.false;
    });
  });
});
