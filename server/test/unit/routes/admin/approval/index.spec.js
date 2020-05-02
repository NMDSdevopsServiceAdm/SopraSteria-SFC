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
  describe('adminApproval()', () => {
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
  });
});
