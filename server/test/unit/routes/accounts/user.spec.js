const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const { meetsMaxUserLimit } = require('../../../../routes/accounts/user');
const User = require('../../../../models/classes/user');

describe('user.js', () => {
  let req;

  beforeEach(() => {
    sinon.stub(User.User, 'fetchUserTypeCounts').returns({ Edit: 2, Read: 2 });
    req = {
      establishmentId: 123,
      establishment: { id: 123 },
      role: 'Edit',
      isParent: false,
      body: {
        role: 'Edit',
      },
    };
  });

  afterEach(() => sinon.restore());

  it('should return false if user is an admin', async () => {
    req = {
      ...req,
      role: 'Admin',
    };
    const meetLimit = await meetsMaxUserLimit(123, req);

    expect(meetLimit).to.be.false;
  });

  describe('not parent', () => {
    it('should return false if edit user is under the edit user limit', async () => {
      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.false;
    });

    it('should return true if edit user is over the edit user limit', async () => {
      sinon.restore();
      sinon.stub(User.User, 'fetchUserTypeCounts').returns({ Edit: 3, Read: 3 });

      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.true;
    });

    it('should return false if read user is under the read user limit', async () => {
      req.body.role = 'Read';

      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.false;
    });

    it('should return true if read user is over the read user limit', async () => {
      req.body.role = 'Read';

      sinon.restore();
      sinon.stub(User.User, 'fetchUserTypeCounts').returns({ Edit: 3, Read: 3 });

      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.true;
    });
  });
  describe('parent', () => {
    beforeEach(() => {
      req.isParent = true;
    });
    it('should return false if edit user is under the edit user limit', async () => {
      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.false;
    });

    it('should return true if edit user is over the edit user limit', async () => {
      sinon.restore();
      sinon.stub(User.User, 'fetchUserTypeCounts').returns({ Edit: 3, Read: 3 });

      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.true;
    });

    it('should return false if read user is under the read user limit', async () => {
      req.body.role = 'Read';

      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.false;
    });

    it('should return true if read user is over the read user limit', async () => {
      req.body.role = 'Read';

      sinon.restore();
      sinon.stub(User.User, 'fetchUserTypeCounts').returns({ Edit: 3, Read: 20 });

      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.true;
    });
  });
});
