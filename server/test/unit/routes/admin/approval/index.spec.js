const expect = require('chai').expect;
const sinon = require('sinon');
const util = require('util');
const Sequelize = require('sequelize');
// To console.log a deep object:
// console.log("*************************** json: " + util.inspect(json, false, null, true));

const models = require('../../../../../models/index');

const approval = require('../../../../../routes/admin/approval');

const boobyTrappedEstablishmentId = 'this will not be populated for new users';

var workplaceWithDuplicateId = null;
var establishmentIdUsedToCheckForDuplicate = false;

var testWorkplace = {};
var foundWorkplace = {};
const _initialiseTestWorkplace = () => {
  testWorkplace.id = 4321;
  testWorkplace.nmdsId = 'W1234567';
  testWorkplace.ustatus = 'PENDING';
  testWorkplace.update = (args) => { return true; };
  testWorkplace.destroy = () => {return true;}
  foundWorkplace = testWorkplace;
};

var testUser = {};
var foundUser = {};
const _initialiseTestUser = () => {
  testUser.id = 1234;
  testUser.establishment = testWorkplace;
  testUser.destroy = () => { return true; };
  foundUser = testUser;
};

var testLogin = {};
const _initialiseTestLogin = () => {
  testLogin.id = testUser.id;
  testLogin.username = 'pickle-pop-panda';
  testLogin.isActive = false;
  testLogin.status = 'PENDING';
  testLogin.user = testUser;
  testLogin.update = (args) => { return true; };
};

var testRequestBody = {};
const _initialiseTestRequestBody = () => {
  testRequestBody.username = testLogin.username;
  testRequestBody.approve = true;
  testRequestBody.establishmentId = testWorkplace.id;
  testRequestBody.nmdsId = testWorkplace.nmdsId;
};

sinon.stub(models.login, 'findOne').callsFake(async (args) => {
  if (args.where.username[models.Sequelize.Op.iLike] === testLogin.username) {
    return testLogin;
  } else {
    return null;
  }
});

sinon.stub(models.user, 'findOne').callsFake(async (args) => {
  if (args.where.id === testUser.id) {
    return foundUser;
  } else {
    return null;
  }
});

sinon.stub(models.establishment, 'findOne').callsFake(async (args) => {
  if (args.where.id === testWorkplace.id) {
    return foundWorkplace;
  } else if (args.where.id[Sequelize.Op.ne] === boobyTrappedEstablishmentId) {
    establishmentIdUsedToCheckForDuplicate = true;
    return null;
  } else if ((args.where.id[Sequelize.Op.ne] === testWorkplace.id)
            && (args.where.nmdsId === testWorkplace.nmdsId)) {
    return workplaceWithDuplicateId;
  } else {
    return null;
  }
});

var returnedJson = null;
var returnedStatus = null;
const approvalJson = (json) => { returnedJson = json; };
const approvalStatus = (status) => {
  returnedStatus = status;
  return {json: approvalJson, send: () => {} };
};

describe('admin/Approval route', () => {

  beforeEach(async() => {
    workplaceWithDuplicateId = null;
    establishmentIdUsedToCheckForDuplicate = false;
    _initialiseTestWorkplace();
    _initialiseTestUser();
    _initialiseTestLogin();
    _initialiseTestRequestBody();
    returnedJson = null;
    returnedStatus = null;
  });

  describe('approving a new user', () => {
    beforeEach(async() => {
      // For new user registrations, establishmentId is set to null. See onSubmit in registration.component.ts
      testRequestBody.establishmentId = null;
      testRequestBody.approve = true;
    });

    it('should return a confirmation message and status 200 when the user is approved', async() => {
      // Arrange (see beforeEach)

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(approval.userApprovalConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });
    
    it('should mark the login as active when approving a new user', async () => {
      // Arrange
      var loginIsActive = false;
      testLogin.update = (args) => {
        loginIsActive = args.isActive;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(loginIsActive).to.deep.equal(true, 'login should have isActive set to true');
    });
    
    it('should remove the pending status from the login when approving a new user', async () => {
      // Arrange
      var loginStatus = 'PENDING';
      testLogin.update =  (args) => {
        loginStatus = args.status;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(loginStatus).to.deep.equal(null, "login should have status set to null (instead of 'PENDING')");
    });

    it('should return status 400 if there is no login with matching username', async () => {
      // Arrange
      testRequestBody.username = 'no matching login available';

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(400);
    });

    it('should update the workplace Id when approving a new user', async () => {
      // Arrange
      testRequestBody.nmdsId = testWorkplace.nmdsId.concat('X');
      var workplaceId = testWorkplace.nmdsId;
      testWorkplace.update =  (args) => {
        workplaceId = args.nmdsId;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(workplaceId).to.deep.equal(testRequestBody.nmdsId);
    });
    
    it('should not use establishmentid to check for duplicate workplace id when approving new user', async () => {
      // Arrange 
      testRequestBody.establishmentId = boobyTrappedEstablishmentId;

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(establishmentIdUsedToCheckForDuplicate).to.deep.equal(false, 'should not use establishment id to check for duplicate');
    });
    
    it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new user', async () => {
      // Arrange 
      workplaceWithDuplicateId = { nmdsId: testWorkplace.nmdsId };

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.nmdsId).to.not.equal(undefined, 'returned json should have an nmdsId value');
      expect(returnedJson.nmdsId).to.deep.equal(`This workplace ID (${testWorkplace.nmdsId}) belongs to another workplace. Enter a different workplace ID.`);
      expect(returnedStatus).to.deep.equal(400);
    });
    
    it('should NOT update the login when approving a new user with duplicate workplace Id', async () => {
      // Arrange 
      workplaceWithDuplicateId = { nmdsId: testWorkplace.nmdsId };
      var loginUpdated = false;
      testLogin.update =  (args) => {
        loginUpdated = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});
      
      // Assert
      expect(loginUpdated).to.equal(false, "login should not have been updated");
    });
    
    it('should NOT remove the pending status from the workplace when approving a new user with duplicate workplace Id', async () => {
      // Arrange 
      workplaceWithDuplicateId = { nmdsId: testWorkplace.nmdsId };
      var workplaceUpdated = false;
      testWorkplace.update =  (args) => {
        workplaceUpdated = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});
      
      // Assert
      expect(workplaceUpdated).to.equal(false, "workplace should not have been updated");
    });
    
    it('should return status 503 if login update returns false when approving a new user', async () => {
      // Arrange 
      testLogin.update = () => { return false; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });
    
    it('should return status 503 if workplace update returns false when approving a new user', async () => {
      // Arrange 
      testWorkplace.update = () => { return false; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });
    
    it('should return status 503 if login update throws exception when approving a new user', async () => {
      // Arrange 
      testLogin.update = () => { throw "Error"; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });
    
    it('should return status 503 if workplace update throws exception when approving a new user', async () => {
      // Arrange 
      testWorkplace.update = () => { throw "Error"; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });
  });

  describe('rejecting a new user', () => {
    beforeEach(async() => {
      // For new user registrations, establishmentId is set to null. See onSubmit in registration.component.ts
      testRequestBody.establishmentId = null;
      testRequestBody.approve = false;
    });

    it('should return a confirmation message and status 200 when the user is removed because the user is rejected', async () => {
      // Arrange (see beforeEach)

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(approval.userRejectionConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });

    it('should delete the user when rejecting a new user', async () => {
      // Arrange 
      var userDestroyed = false;
      testUser.destroy =  (args) => {
        userDestroyed = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(userDestroyed).to.deep.equal(true, "user should have been destroyed");
    });

    it('should delete the workplace when rejecting a new user', async () => {
      // Arrange 
      var workplaceDestroyed = false;
      testWorkplace.destroy =  (args) => {
        workplaceDestroyed = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(workplaceDestroyed).to.deep.equal(true, "workplace should have been destroyed");
    });

    it('should not reject a new login that does not have an associated user', async () => {
      // Arrange 
      foundUser = null;
      var workplaceDestroyed = false;
      testWorkplace.destroy =  (args) => {
        workplaceDestroyed = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});
      
      // Assert
      expect(workplaceDestroyed).to.equal(false, "workplace should not have been destroyed");
    });

    it('should not reject a new user that does not have an associated workplace', async () => {
      // Arrange 
      foundWorkplace = null;
      var userDestroyed = false;
      testUser.destroy =  (args) => {
        userDestroyed = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});
      
      // Assert
      expect(userDestroyed).to.equal(false, "user should not have been destroyed");
    });

    it('should return status 503 if it is not possible to delete a user when rejecting a new user', async () => {
      // Arrange 
      testUser.destroy = () => { return false; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });

    it('should return status 503 if it is not possible to delete a workplace when rejecting a new user', async () => {
      // Arrange 
      testWorkplace.destroy = () => { return false; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });
  });

  describe('approving a new workplace', () => {
    beforeEach(async() => {
      // For new workplace registrations, username is set to null. See onSubmit in registration.component.ts
      testRequestBody.username = null;
      testRequestBody.approve = true;
    });

    it('should return a confirmation message and status 200 when the workplace is approved', async () => {
      // Arrange (see beforeEach)

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(approval.workplaceApprovalConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });

    it('should remove the pending status from the workplace when approving a new workplace', async () => {
      // Arrange 
      var workplaceStatus = 'PENDING';
      testWorkplace.update =  (args) => {
        workplaceStatus = args.ustatus;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(workplaceStatus).to.deep.equal(null, "workplace should have status set to null (instead of 'PENDING')");
    });

    it('should update the workplace Id when approving a new workplace', async () => {
      // Arrange 
      testRequestBody.nmdsId = testWorkplace.nmdsId.concat('X');
      var workplaceId = testWorkplace.nmdsId;
      testWorkplace.update =  (args) => {
        workplaceId = args.nmdsId;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(workplaceId).to.deep.equal(testRequestBody.nmdsId);
    });

    it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new workplace', async () => {
      // Arrange 
      workplaceWithDuplicateId = { nmdsId: testWorkplace.nmdsId };

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.nmdsId).to.not.equal(undefined, 'returned json should have an nmdsId value');
      expect(returnedJson.nmdsId).to.deep.equal(`This workplace ID (${testWorkplace.nmdsId}) belongs to another workplace. Enter a different workplace ID.`);
      expect(returnedStatus).to.deep.equal(400);
    });

    it('should NOT remove the pending status from the workplace when approving a new workplace with duplicate workplace Id', async () => {
      // Arrange 
      workplaceWithDuplicateId = { nmdsId: testWorkplace.nmdsId };
      var workplaceUpdated = false;
      testWorkplace.update =  (args) => {
        workplaceUpdated = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});
      
      // Assert
      expect(workplaceUpdated).to.equal(false, "workplace should not have been updated");
    });

    it('should return status 503 if workplace update returns false when approving a new workplace', async () => {
      // Arrange 
      testWorkplace.update = () => { return false; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });

    it('should return status 503 if workplace update throws exception when approving a new workplace', async () => {
      // Arrange 
      testWorkplace.update = () => { throw "Error"; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });
  });

  describe('rejecting a new workplace', () => {
    beforeEach(async() => {
      // For new workplace registrations, username is set to null. See onSubmit in registration.component.ts
      testRequestBody.username = null;
      testRequestBody.approve = false;
    });

    it('should return a confirmation message and status 200 when the workplace is removed because the workplace is rejected', async () => {
      // Arrange (see beforeEach)

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
      expect(returnedJson.message).to.deep.equal(approval.workplaceRejectionConfirmation);
      expect(returnedStatus).to.deep.equal(200);
    });

    it('should delete the workplace when rejecting a new workplace', async () => {
      // Arrange 
      var workplaceDestroyed = false;
      testWorkplace.destroy =  (args) => {
        workplaceDestroyed = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(workplaceDestroyed).to.deep.equal(true, "workplace should have been destroyed");
    });

    it('should return status 503 if it is not possible to delete a workplace when rejecting a new workplace', async () => {
      // Arrange 
      testWorkplace.destroy = () => { return false; }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: approvalStatus});

      // Assert
      expect(returnedStatus).to.deep.equal(503);
    });
  });
});
