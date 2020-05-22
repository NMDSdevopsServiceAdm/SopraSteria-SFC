const expect = require('chai').expect;
const sinon = require('sinon');
const util = require('util');
const Sequelize = require('sequelize');
// To console.log a deep object:
// console.log("*************************** json: " + util.inspect(json, false, null, true));

const models = require('../../../../../models/index');

const parentApproval = require('../../../../../routes/admin/parent-approval');

var testWorkplace = {};
var workplaceObjectWasSaved = false;
const _initialiseTestWorkplace = () => {
  testWorkplace.id = 4321;
  testWorkplace.isParent = false;
  testWorkplace.nmdsId = 'I1234567';
  testWorkplace.NameValue = 'Marvellous Mansions';
  testWorkplace.save = () => { workplaceObjectWasSaved = true; };
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
  createdAt: '27/8/2019 9:16am',
  Status: 'Pending',
  Establishment: {
    nmdsId: testWorkplace.nmdsId,
    NameValue: testWorkplace.NameValue
  },
  User: {
    FullNameValue: 'Magnificent Maisie'
  },
  save: () => { approvalObjectWasSaved = true; }
};

var approvalRequestBody = {};
const _initialiseTestRequestBody = () => {
  approvalRequestBody.parentRequestId = fakeApproval.ID;
  approvalRequestBody.establishmentId = testWorkplace.id;
  approvalRequestBody.userId = testUser.id;
  approvalRequestBody.rejectionReason = "Because I felt like it.";
};

var returnedJson = null;
var returnedStatus = null;
const approvalJson = (json) => { returnedJson = json; };
const approvalStatus = (status) => {
  returnedStatus = status;
  return {json: approvalJson, send: () => {} };
};

var throwErrorWhenFetchingAllRequests = false;
sinon.stub(models.Approvals, 'findAllPending').callsFake(async (approvalType) => {
  if (throwErrorWhenFetchingAllRequests) {
    throw 'Oopsy!';
  } else {
    return [ fakeApproval ];
  }
});

var throwErrorWhenFetchingSingleRequest = false;
sinon.stub(models.Approvals, 'findbyId').callsFake(async (id) => {
  if (throwErrorWhenFetchingSingleRequest) {
    throw 'Oopsy!';
  } else if (id === fakeApproval.ID) {
    return fakeApproval;
  }
});

sinon.stub(models.establishment, 'findbyId').callsFake(async (id) => {
  if (id === testWorkplace.id) {
    return testWorkplace;
  }
});

describe('admin/parent-approval route', () => {

  beforeEach(async() => {
    _initialiseTestWorkplace();
    _initialiseTestUser();
    _initialiseTestRequestBody();
    returnedJson = null;
    returnedStatus = null;
    throwErrorWhenFetchingAllRequests = false;
    throwErrorWhenFetchingSingleRequest = false;
  });

  describe('fetching parent requests', () => {
    it('should return an array of parent requests', async() => {
      // Arrange (see beforeEach)

      // Act
      await parentApproval.getParentRequests({
        body: {}
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(200);
      expect(returnedJson).to.deep.equal([{
        requestId: fakeApproval.ID,
        requestUUID: fakeApproval.UUID,
        establishmentId: fakeApproval.EstablishmentID,
        userId: fakeApproval.UserID,
        workplaceId: fakeApproval.Establishment.nmdsId,
        userName: fakeApproval.User.FullNameValue,
        orgName: fakeApproval.Establishment.NameValue,
        requested: fakeApproval.createdAt
      }]);
    });

    it('should return 400 on error', async() => {
      // Arrange
      throwErrorWhenFetchingAllRequests = true;

      // Act
      await parentApproval.getParentRequests({
        body: {}
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(400);
    });
  });

  describe('approving a new parent organisation', () => {
    beforeEach(async() => {
      approvalRequestBody.approve = true;
    });

    it('should return a confirmation message and status 200 when parent status is approved for an org', async() => {
      // Arrange (see beforeEach)

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(parentApproval.parentApprovalConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });

    it('should change the approval status to Approved when approving a parent request', async() => {
      // Arrange
      fakeApproval.Status = 'Pending';

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(fakeApproval.Status).to.equal('Approved');
    });

    it('should save the approval object when approving a parent request', async() => {
      // Arrange
      approvalObjectWasSaved = false;

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(approvalObjectWasSaved).to.equal(true);
    });

    it('should change the workplace to a parent workplace when approving a parent request', async() => {
      // Arrange
      testWorkplace.isParent = false;

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(testWorkplace.isParent).to.equal(true);
    });

    it('should save the workplace object when approving a parent request', async() => {
      // Arrange
      workplaceObjectWasSaved = false;

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(workplaceObjectWasSaved).to.equal(true);
    });

    it('should return 400 on error', async() => {
      // Arrange
      throwErrorWhenFetchingSingleRequest = true;

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(400);
    });
  });

  describe('rejecting a new parent organisation', () => {
    beforeEach(async() => {
      approvalRequestBody.approve = false;
    });

    it('should return a confirmation message and status 200 when the parent status is rejected', async () => {
      // Arrange (see beforeEach)

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(parentApproval.parentRejectionConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });

    it('should change the approval status to Rejected when rejecting a parent request', async() => {
      // Arrange
      fakeApproval.Status = 'Pending';

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(fakeApproval.Status).to.equal('Rejected');
    });

    it('should save the approval object when rejecting a parent request', async() => {
      // Arrange
      approvalObjectWasSaved = false;

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(approvalObjectWasSaved).to.equal(true);
    });

    it('should NOT save the workplace object when rejecting a parent request', async() => {
      // Arrange
      workplaceObjectWasSaved = false;

      // Act
      await parentApproval.parentApproval({
        body: approvalRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(workplaceObjectWasSaved).to.equal(false);
    });
  });
});
