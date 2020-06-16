const faker = require('faker');
const expect = require('chai').expect;
const sinon = require('sinon');
const moment = require('moment-timezone');
const config = require('../../../../../config/config');
const Sequelize = require('sequelize');
const sinon_sandbox = sinon.createSandbox();

const models = require('../../../../../models/index');

const adminParentApproval = require('../../../../../routes/admin/parent-approval');

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

var approvalRequestBody = {};
const _initialiseTestRequestBody = () => {
  approvalRequestBody.parentRequestId = fakeApproval.ID;
  approvalRequestBody.establishmentId = testWorkplace.id;
  approvalRequestBody.userId = testUser.id;
  approvalRequestBody.rejectionReason = 'Because I felt like it.';
};

var returnedJson = null;
var returnedStatus = null;
const approvalJson = (json) => {
  returnedJson = json;
};
const approvalStatus = (status) => {
  returnedStatus = status;
  return {
    json: approvalJson, send: () => {
    }
  };
};

var throwErrorWhenFetchingAllRequests = false;
var throwErrorWhenFetchingSingleRequest = false;

describe('admin/parent-approval route', () => {

  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(async () => {
    sinon_sandbox.stub(models.Approvals, 'findbyId').callsFake(async (id) => {
      if (throwErrorWhenFetchingSingleRequest) {
        throw 'Oopsy!';
      } else if (id === fakeApproval.ID) {
        return fakeApproval;
      }
    });
    sinon_sandbox.stub(models.establishment, 'findbyId').callsFake(async (id) => {
      if (id === testWorkplace.id) {
        return testWorkplace;
      }
    });
    sinon_sandbox.stub(models.Approvals, 'findAllPending').callsFake(async (approvalType) => {
      if (throwErrorWhenFetchingAllRequests) {
        throw 'Oopsy!';
      } else {
        return [fakeApproval];
      }
    });


    _initialiseTestWorkplace();
    _initialiseTestUser();
    _initialiseTestRequestBody();
    returnedJson = null;
    returnedStatus = null;
    throwErrorWhenFetchingAllRequests = false;
    throwErrorWhenFetchingSingleRequest = false;
  });

  describe('fetching parent requests', () => {
    it('should return an array of parent requests', async () => {
      // Arrange (see beforeEach)

      // Act
      await adminParentApproval.getParentRequests({}, { status: approvalStatus });

      // Assert
      expect(returnedStatus).to.deep.equal(200);
      expect(returnedJson).to.deep.equal([{
        requestId: fakeApproval.ID,
        requestUUID: fakeApproval.UUID,
        establishmentId: fakeApproval.EstablishmentID,
        establishmentUid: fakeApproval.Establishment.uid,
        userId: fakeApproval.UserID,
        workplaceId: fakeApproval.Establishment.nmdsId,
        userName: fakeApproval.User.FullNameValue,
        orgName: fakeApproval.Establishment.NameValue,
        requested: moment.utc(fakeApproval.createdAt).tz(config.get('timezone')).format('D/M/YYYY h:mma')
      }]);
    });

    it('should return 400 on error', async () => {
      // Arrange
      throwErrorWhenFetchingAllRequests = true;

      // Act
      await adminParentApproval.getParentRequests({}, { status: approvalStatus });

      // Assert
      expect(returnedStatus).to.deep.equal(400);
    });
  });

  describe('approving a new parent organisation', () => {
    beforeEach(async () => {
      approvalRequestBody.approve = true;
    });

    it('should return a confirmation message and status 200 when parent status is approved for an org', async () => {
      // Arrange (see beforeEach)

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(adminParentApproval.parentApprovalConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });

    it('should change the approval status to Approved when approving a parent request', async () => {
      // Arrange
      fakeApproval.Status = 'Pending';

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(fakeApproval.Status).to.equal('Approved');
    });

    it('should save the approval object when approving a parent request', async () => {
      // Arrange
      approvalObjectWasSaved = false;

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(approvalObjectWasSaved).to.equal(true);
    });

    it('should change the workplace to a parent workplace when approving a parent request', async () => {
      // Arrange
      testWorkplace.isParent = false;

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(testWorkplace.isParent).to.equal(true);
    });

    it('should save the workplace object when approving a parent request', async () => {
      // Arrange
      workplaceObjectWasSaved = false;

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(workplaceObjectWasSaved).to.equal(true);
    });

    it('should return 400 on error', async () => {
      // Arrange
      throwErrorWhenFetchingSingleRequest = true;

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(returnedStatus).to.deep.equal(400);
    });
  });

  describe('rejecting a new parent organisation', () => {
    beforeEach(async () => {
      approvalRequestBody.approve = false;
    });

    it('should return a confirmation message and status 200 when the parent status is rejected', async () => {
      // Arrange (see beforeEach)

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(adminParentApproval.parentRejectionConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });

    it('should change the approval status to Rejected when rejecting a parent request', async () => {
      // Arrange
      fakeApproval.Status = 'Pending';

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(fakeApproval.Status).to.equal('Rejected');
    });

    it('should save the approval object when rejecting a parent request', async () => {
      // Arrange
      approvalObjectWasSaved = false;

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(approvalObjectWasSaved).to.equal(true);
    });

    it('should NOT save the workplace object when rejecting a parent request', async () => {
      // Arrange
      workplaceObjectWasSaved = false;

      // Act
      await adminParentApproval.parentApproval({
        body: approvalRequestBody
      }, { status: approvalStatus });

      // Assert
      expect(workplaceObjectWasSaved).to.equal(false);
    });
  });
});
