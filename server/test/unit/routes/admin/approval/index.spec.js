const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../../models/index');

const approval = require('../../../../../routes/admin/approval');

var testWorkplace = {
  id: 4321,
  nmdsId: 'W1234567',
  ustatus: 'PENDING',
  update: (args) => {return true;},
  destroy: () => {return true;}
};

var testUser = {
  id: 1234,
  establishment: testWorkplace,
  destroy: () => {return true;} 
};

var testLogin = {
  id: testUser.id,
  username: 'pickle-pop-panda',
  isActive: false,
  status: 'PENDING',
  user: testUser,
  update: (args) => {return true;}
};

var testRequestBody = {
  username: testLogin.username,
  approve: true,
  establishmentId: testWorkplace.id,
  nmdsId: testWorkplace.nmdsId
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
    return testUser;
  } else {
    return null;
  }
});

sinon.stub(models.establishment, 'findOne').callsFake(async (args) => {
  if (args.where.id === testWorkplace.id) {
    return testWorkplace;
  } else {
    return null;
  }
});

const defaultUpdateJson = () => {};
const defaultUpdateStatus = (status) => { return {json: defaultUpdateJson, send: () => {} }; };

describe('admin/Approval route', () => {

  describe('approving a new user', () => {
    it('should return a confirmation message and status 200 when the user is approved', async() => {
      // Arrange
      testRequestBody.approve = true;

      // Assert
      const updateJson = (json) => {
        expect(typeof(json)).to.deep.equal('object');
        expect(json.status).to.deep.equal('0');
        expect(json.message).to.deep.equal('User has been set as active');
      };
      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
        return {json: updateJson, send: () => {} };
      };

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: updateStatus});
    });
    
    it('should mark the login as active when approving a new user', async () => {
      // Arrange 
      testRequestBody.approve = true;

      // Assert
      testLogin.update =  (args) => {
        expect(args.isActive).to.deep.equal(true);
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: defaultUpdateStatus});
    });
    
    it('should remove the pending status from the login when approving a new user', async () => {
      // Arrange 
      testRequestBody.approve = true;

      // Assert
      testLogin.update =  (args) => {
        expect(args.status).to.deep.equal(null);
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: defaultUpdateStatus});
    });
    
    it('should not approve a new user that does not have a login with matching username', async () => {
      // Arrange 
      testRequestBody.approve = true;
      testRequestBody.username = 'no matching login available';
      var loginUpdated = false;
      testLogin.update =  (args) => {
        loginUpdated = true;
        return true;
      }

      // Act
      await approval.adminApproval({
        body: testRequestBody
      }, {status: defaultUpdateStatus});

      expect(loginUpdated).to.equal(false);
    });
    
    //it('should return status 400 if there is no login with matching username', async () => {
    //it('should NOT mark the login as active when approving a new user with duplicate workplace Id', async () => {
    //it('should NOT remove the pending status from the login when approving a new user with duplicate workplace Id', async () => {
    //it('should NOT remove the pending status from the workplace when approving a new user with duplicate workplace Id', async () => {
    //it('!!! Write front end tests for the previous 3 scenarios !!!', async () => {
    //it('should return status 503 if it is not possible to update a user when approving a new user', async () => {
    //it('should return status 503 if it is not possible to update a workplace when approving a new user', async () => {
    //it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new user', async () => {
  });

  describe('rejecting a new user', () => {
    //it('should return a confirmation message and status 200 when the user is removed because the user is rejected', async () => {
    //it('should delete the user and workplace when rejecting a new user', async () => {
    //it('!! Why doesn't it delete the login?', async () => {
    //it('!!! Currently it will delete the login if it can't find as associated establishment. I'm not sure this would ever actually happen but doesn't seem right? Further investigation could be a big time sink for no good reason though. !!!', async () => {
    //it('!!! There's also no action taken if it can't find an associated user record? !!!', async () => {
    //it('should not reject a new user that does not have an associated user', async () => {
    //it('should not reject a new user that does not have an associated workplace', async () => {
    //it('should return status 503 if it is not possible to delete a user when rejecting a new user', async () => {
    //it('should return status 503 if it is not possible to delete a workplace when rejecting a new user', async () => {
  });

  describe('approving a new workplace', () => {
    //it('should return a confirmation message and status 200 when the workplace is approved', async () => {
    //it('should remove the pending status from the workplace when approving a new workplace', async () => {
    //it('should NOT remove the pending status from the workplace when approving a new workplace with duplicate workplace Id', async () => {
    //it('should NOT remove the pending status from the workplace when approving a new workplace with duplicate workplace Id', async () => {
    //it('should return status 503 if it is not possible to update a workplace when approving a new workplace', async () => {
    //it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new workplace', async () => {
  });

  describe('rejecting a new workplace', () => {
    //it('should return a confirmation message and status 200 when the workplace is removed because the workplace is rejected', async () => {
    //it('should delete the workplace when rejecting a new workplace', async () => {
    //it('should return status 503 if it is not possible to delete a workplace when rejecting a new workplace', async () => {
  });
});
