const models = require('../../../../models/index');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const expect = require('chai').expect;
const { validateBecomeAParentRequest } = require('../../../../routes/approvals/becomeAParent');

describe('test become a parent endpoint functions', () => {
  describe('validateBecomeAParentRequest', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('sets user id on the request object', async () => {
      const userId = '123';
      const establishmentId = '123';

      sinon.stub(models.user, 'findByUUID').returns({
        id: userId,
      });

      sinon.stub(models.establishment, 'findByPk').returns({
        id: establishmentId,
      });

      sinon.stub(models.Approvals, 'canRequestToBecomeAParent').returns(true);

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/approvals/become-a-parent`,
      });

      req.userUid = '123';
      req.establishment = {
        id: establishmentId,
      };

      const res = httpMocks.createResponse();

      const next = function () {};

      await validateBecomeAParentRequest(req, res, next);

      expect(req.userId).equals('123');
    });

    it('errors out when giving a non-existant user uuid', async () => {
      const establishmentId = '123';

      sinon.stub(models.user, 'findByUUID').returns(null);

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/approvals/become-a-parent`,
      });

      req.userUid = '123';
      req.establishment = {
        id: establishmentId,
      };

      const res = httpMocks.createResponse();

      const next = function () {};

      await validateBecomeAParentRequest(req, res, next);

      const { message } = res._getJSONData();
      expect(res.statusCode).to.equal(404);
      expect(message).to.equal('User not found.');
    });

    it('errors out when giving a non-existant establishment id', async () => {
      const userId = '123';
      const establishmentId = '123';

      sinon.stub(models.user, 'findByUUID').returns({
        id: userId,
      });

      sinon.stub(models.establishment, 'findByPk').returns(null);

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/approvals/become-a-parent`,
      });

      req.userUid = '123';
      req.establishment = {
        id: establishmentId,
      };

      const res = httpMocks.createResponse();

      const next = function () {};

      await validateBecomeAParentRequest(req, res, next);

      const { message } = res._getJSONData();
      expect(res.statusCode).to.equal(404);
      expect(message).to.equal('Establishment not found.');
    });

    it('errors out when a request already exists', async () => {
      const userId = '123';
      const establishmentId = '123';

      sinon.stub(models.user, 'findByUUID').returns({
        id: userId,
      });

      sinon.stub(models.establishment, 'findByPk').returns({
        id: establishmentId,
      });

      sinon.stub(models.Approvals, 'canRequestToBecomeAParent').returns(false);

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/approvals/become-a-parent`,
      });

      req.userUid = '123';
      req.establishment = {
        id: establishmentId,
      };

      const res = httpMocks.createResponse();

      const next = function () {};

      await validateBecomeAParentRequest(req, res, next);

      const { message } = res._getJSONData();
      expect(res.statusCode).to.equal(422);
      expect(message).to.equal('There is already an existing Become a Parent request.');
    });

    it('errors out when an exception is thrown', async () => {
      sinon.stub(console, 'error'); // Hide error messages

      const userUid = '123';
      const establishmentId = '123';

      sinon.stub(models.user, 'findByUUID').throws(function() { return new Error(); });

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/approvals/become-a-parent`,
      });

      req.userUid = userUid;
      req.establishment = {
        id: establishmentId,
      };

      const res = httpMocks.createResponse();

      const next = function () {};

      await validateBecomeAParentRequest(req, res, next);

      const { message } = res._getJSONData();
      expect(res.statusCode).to.equal(500);
      expect(message).to.equal('Something went wrong validating the Become a Parent request.');
    });
  });
});
