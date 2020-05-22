const expect = require('chai').expect;
const sinon = require('sinon');
const util = require('util');
const Sequelize = require('sequelize');
// To console.log a deep object:
// console.log("*************************** json: " + util.inspect(json, false, null, true));

const models = require('../../../../../models/index');

const parentApproval = require('../../../../../routes/admin/parent-approval');

var testWorkplace = {};
const _initialiseTestWorkplace = () => {
  testWorkplace.id = 4321;
};

var testUser = {};
const _initialiseTestUser = () => {
  testUser.id = 1234;
};

var fakeApproval = {
  ID: 9,
  UUID: 'bbd54f18-f0bd-4fc2-893d-e492faa9b278',
  EstablishmentID: testWorkplace.id,
  UserID: testUser.id,
  createdAt: '27/8/2019 9:16am',
  Establishment: {
    nmdsId: 'I1234567',
    NameValue: 'Marvellous Mansions'
  },
  User: {
    FullNameValue: 'Magnificent Maisie'
  }
};

var approvalRequestBody = {};
const _initialiseTestRequestBody = () => {
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

sinon.stub(models.Approvals, 'findAllPending').callsFake(async (approvalType) => {
  return [ fakeApproval ];
});

describe('admin/parent-approval route', () => {

  beforeEach(async() => {
    _initialiseTestWorkplace();
    _initialiseTestUser();
    _initialiseTestRequestBody();
    returnedJson = null;
    returnedStatus = null;
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
  });
});
