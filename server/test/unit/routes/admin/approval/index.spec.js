const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../../models/index');

const approval = require('../../../../../routes/admin/approval')

const testUser = {
  username: 'pickle-pop-panda'
};

sinon.stub(models.login, 'findOne').callsFake(async (args) => {
  if (args.where.username === testUser.username) {
    return testUser;
  } else {
    return null;
  }
});

describe('approval route', () => {
  describe('approval()', () => {
    it('should not return any result if invalid username', async() => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(400);
      };
      const updateJson = (json) => {
        expect(json).to.deep.equal();
      };
      await unlockAccount.unlockAccount({
        body: {
          username: testUser.username + 'X'
        }
      }, {status: updateStatus, json: updateJson, send: updateJson});
    });
  });
});
