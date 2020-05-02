const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../../models/index');

const approval = require('../../../../../routes/admin/approval');

const testEstablishment = {
  id: 4321,
  nmdsId: 'W1234567',
  ustatus: 'PENDING',
  update: (args) => {return true;},
  destroy: () => {return true;}
};

const testUser = {
  id: 1234,
  establishment: testEstablishment,
  destroy: () => {return true;} 
};

const testLogin = {
  id: testUser.id,
  username: 'pickle-pop-panda',
  isActive: false,
  status: 'PENDING',
  user: testUser,
  update: (args) => {return true;}
};

const testRequestBody = {
  username: testLogin.username,
  approve: true,
  establishmentId: testEstablishment.id,
  nmdsId: testEstablishment.nmdsId
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
  if (args.where.id === testEstablishment.id) {
    return testEstablishment;
  } else {
    return null;
  }
});

describe('admin/Approval route', () => {

  describe('approving a new user', () => {
    it('should return a confirmation message and status 200 when the user is approved', async() => {
      const updateJson = (json) => {
        expect(typeof(json)).to.deep.equal('object');
        expect(json.status).to.deep.equal('0');
        expect(json.message).to.deep.equal('User has been set as active');
      };
      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
        return {json: updateJson, send: () => {} };
      };
      testRequestBody.approve = true;
      await approval.adminApproval({
        body: testRequestBody
      }, {status: updateStatus});
    });
    //it('should return a confirmation message and status 200 when the user is approved', async () => {
    //it('should mark the login as active when approving a new user', async () => {
    //it('should remove the pending status from the login when approving a new user', async () => {
    //it('should remove the pending status from the workplace when approving a new user', async () => {
    //it('should not approve a new user that doesn't have an associated login', async () => {
    //it('should not approve a new user that doesn't have an associated user', async () => {
    //it('should not approve a new user that doesn't have an associated workplace', async () => {
    //it('should NOT mark the login as active when approving a new user with duplicate workplace Id', async () => {
    //it('should NOT remove the pending status from the login when approving a new user with duplicate workplace Id', async () => {
    //it('should NOT remove the pending status from the workplace when approving a new user with duplicate workplace Id', async () => {
    //it('!!! Write front end tests for the previous 3 scenarios !!!', async () => {
    //it('should return status 400 if there is no login with matching username', async () => {
    //it('should return status 503 if it is not possible to update a user when approving a new user', async () => {
    //it('should return status 503 if it is not possible to update a workplace when approving a new user', async () => {
    //it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new user', async () => {
  });

  describe('rejecting a new user', () => {
    //it('should return a confirmation message and status 200 when the user is removed because the user is rejected', async () => {
    //it('should delete the user and workplace when rejecting a new user', async () => {
    //it('!! Why doesn't it delete the login?', async () => {
    //it('should return status 503 if it is not possible to delete a user when rejecting a new user', async () => {
    //it('should return status 503 if it is not possible to delete a workplace when rejecting a new user', async () => {
  });

  describe('approving a new workplace', () => {
    //it('should return a confirmation message and status 200 when the workplace is approved', async () => {
    //it('should remove the pending status from the workplace when approving a new workplace', async () => {
    //it('should NOT remove the pending status from the workplace when approving a new workplace with duplicate workplace Id', async () => {
    //it('!!! Currently it will delete the login if it can't find as associated establishment. I'm not sure this would ever actually happen but doesn't seem right? Further investigation could be a big time sink for no good reason though. !!!', async () => {
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
