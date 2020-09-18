const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../../models/index');

const unlockAccount = require('../../../../../routes/admin/unlock-account');

const user = {
  username: 'fred123',
  id: 12345,
  isActive: false,
  invalidAttempt: 10,
  update: (args) => {
    expect(args.isActive).to.deep.equal(true);
    expect(args.invalidAttempt).to.deep.equal(9);
    return true;
  },
};

describe('unlock-account route', () => {
  before(() => {
    sinon.stub(models.login, 'findOne').callsFake(async (args) => {
      if (args.where.username === user.username) {
        return user;
      } else {
        return null;
      }
    });
  });

  after(() => {
    sinon.restore();
  });

  describe('unlockAccount()', () => {
    it('should return with an unlocked account status', async () => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
      };
      const updateJson = (json) => {
        expect(typeof json).to.deep.equal('object');
        expect(json.status).to.deep.equal('0');
        expect(json.message).to.deep.equal('User has been set as active');
      };
      await unlockAccount.unlockAccount(
        {
          body: {
            username: user.username,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
      );
    });

    it('should not return with an unlocked account status if invalid username', async () => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(400);
      };
      const updateJson = (json) => {
        expect(json).to.deep.equal();
      };
      await unlockAccount.unlockAccount(
        {
          body: {
            username: user.username + '1',
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
      );
    });

    it('should not return with an unlocked account status if no username', async () => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(400);
      };
      const updateJson = (json) => {
        expect(json).to.deep.equal();
      };
      await unlockAccount.unlockAccount(
        {
          body: {},
        },
        { status: updateStatus, json: updateJson, send: updateJson },
      );
    });
  });
});
