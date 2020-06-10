const models = require('../../../../models/index');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const expect = require('chai').expect;
const {
   validateBecomeAParentRequest,
   getParentRequestByEstablishmentId
} = require('../../../../routes/approvals/becomeAParent');
const sinon_sandbox = sinon.createSandbox();
const faker = require('faker');
const moment = require('moment-timezone');
const config = require('../../../../config/config');


var testWorkplace = {};
var workplaceObjectWasSaved = false;
const _initialiseTestWorkplace = () => {
  testWorkplace.id = 4321;
  testWorkplace.isParent = false;
  testWorkplace.nmdsId = 'I1234567';
  testWorkplace.NameValue = faker.lorem.words(4);
  testWorkplace.save = () => {
    workplaceObjectWasSaved = true;
  };
};

var testUser = {};
const _initialiseTestUser = () => {
  testUser.id = 1234;
};

var approvalObjectWasSaved = false;
var fakeApproval = {
  ID: 9,
  UUID: 'bbd54f18-f0bd-4fc2-893d-e492faa9b278',
  EstablishmentID: testWorkplace.id,
  UserID: testUser.id,
  createdAt: '2020-05-18 09:25:12.896+01',
  Status: 'Pending',
  Establishment: {
    uid: 'f61696f7-30fe-441c-9c59-e25dfcb51f59',
    nmdsId: testWorkplace.nmdsId,
    NameValue: testWorkplace.NameValue
  },
  User: {
    FullNameValue: faker.name.findName()
  },
  save: () => {
    approvalObjectWasSaved = true;
  }
};

var returnedJson = null;
var returnedStatus = null;
const parentRequestJson = (json) => {
  returnedJson = json;
};
const parentRequestStatus = (status) => {
  returnedStatus = status;
  return {
    json: parentRequestJson, send: () => {
    }
  };
};

var noMatchingRequestByEstablishmentId = false;

describe('test becomeAParent fetching requests by establishment id', () => {
  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(async () => {
    sinon_sandbox.stub(models.Approvals, 'findbyEstablishmentId').callsFake(async (approvalType) => {
      if (noMatchingRequestByEstablishmentId) {
        return null;
      } else {
        return fakeApproval;
      }
    });

    _initialiseTestWorkplace();
    _initialiseTestUser();
    returnedJson = null;
    returnedStatus = null;
    noMatchingRequestByEstablishmentId = false;
  });

  describe('fetching parent request by establishment id', () => {
    it('should return a pending parent request for a specified establishment', async () => {
      // Arrange (see beforeEach)

      // Act
      await getParentRequestByEstablishmentId({
        params: {
          establishmentId: fakeApproval.EstablishmentID
        }
      }, { status: parentRequestStatus });

      // Assert
      expect(returnedStatus).to.deep.equal(200);
      expect(returnedJson).to.deep.equal({
        requestId: fakeApproval.ID,
        requestUUID: fakeApproval.UUID,
        establishmentId: fakeApproval.EstablishmentID,
        establishmentUid: fakeApproval.Establishment.uid,
        userId: fakeApproval.UserID,
        workplaceId: fakeApproval.Establishment.nmdsId,
        userName: fakeApproval.User.FullNameValue,
        orgName: fakeApproval.Establishment.NameValue,
        requested: moment.utc(fakeApproval.createdAt).tz(config.get('timezone')).format('D/M/YYYY h:mma'),
        data: undefined
      });
    });

    it('should return null when there is no matching parent request', async () => {
      // Arrange
      noMatchingRequestByEstablishmentId = true;

      // Act
      await getParentRequestByEstablishmentId({
        params: {
          establishmentId: fakeApproval.EstablishmentID
        }
      }, { status: parentRequestStatus });

      // Assert
      expect(returnedStatus).to.deep.equal(200);
      expect(returnedJson).to.deep.equal(null);
    });
  });
});

describe('test become a parent request functionality', () => {
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
