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

var testRequestBody = {};
const _initialiseTestRequestBody = () => {
  testRequestBody.userId = testUser.id;
  testRequestBody.rejectionReason = "Because I felt like it.";
  testRequestBody.establishmentId = testWorkplace.id;
};

var returnedJson = null;
var returnedStatus = null;
const approvalJson = (json) => { returnedJson = json; };
const approvalStatus = (status) => {
  returnedStatus = status;
  return {json: approvalJson, send: () => {} };
};

describe('admin/parent-approval route', () => {

  beforeEach(async() => {
    _initialiseTestWorkplace();
    _initialiseTestUser();
    _initialiseTestRequestBody();
    returnedJson = null;
    returnedStatus = null;
  });

  describe('approving a new parent organisation', () => {
    beforeEach(async() => {
      testRequestBody.approve = true;
    });

    it('should return a confirmation message and status 200 when parent status is approved for an org', async() => {
      // Arrange (see beforeEach)

      // Act
      await parentApproval.parentApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(parentApproval.parentApprovalConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });
  });

  describe('rejecting a new parent organisation', () => {
    beforeEach(async() => {
      testRequestBody.approve = false;
    });

    it('should return a confirmation message and status 200 when the parent status is rejected', async () => {
      // Arrange (see beforeEach)

      // Act
      await parentApproval.parentApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(parentApproval.parentRejectionConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });
  });
});
