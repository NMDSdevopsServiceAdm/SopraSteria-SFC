const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../models');
const { User } = require('../../../../models/classes/user');

describe('server/models/classes/user.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('get userResearchInviteResponse', () => {
    it('should return yes if the property manager returns yes', () => {
      const user = new User(123);
      sinon.stub(user._properties, 'get').returns({ property: 'Yes' });

      expect(user.userResearchInviteResponse).to.equal('Yes');
    });

    it('should return null if the property manager returns null', () => {
      const user = new User(123);
      sinon.stub(user._properties, 'get').returns({ property: null});

      expect(user.userResearchInviteResponse).to.equal(null);
    });

    it('should return null if the property does not exist', () => {
      const user = new User(123);
      sinon.stub(user._properties, 'get').returns(null);

      expect(user.userResearchInviteResponse).to.equal(null);
    });

  });

  describe('isUserResearchInviteResponseValid', () => {
    it('should return true if the property manager returns Yes', () => {
      const user = new User(123);
      sinon.stub(user._properties, 'get').returns({ property: 'Yes' });
      expect(user.isUserResearchInviteResponseValid).to.equal(true);
    });

    it('should return true if the property manager returns null', () => {
      const user = new User(123);
      sinon.stub(user._properties, 'get').returns({ property: null });
      expect(user.isUserResearchInviteResponseValid).to.equal(true);
    });

    it('should return false if the property manager returns a boolean', () => {
      const user = new User(123);
      const logStub = sinon.stub(user, '_log');

      sinon.stub(user._properties, 'get').returns({ property: true });
      expect(user.isUserResearchInviteResponseValid).to.equal(false);
      expect(logStub.calledOnce).to.equal(true);
    });

    it('should return false if the property manager returns an valid string in lower case', () => {
      const user = new User(123);
      const logStub = sinon.stub(user, '_log');

      sinon.stub(user._properties, 'get').returns({ property: 'yes' });
      expect(user.isUserResearchInviteResponseValid).to.equal(false);
      expect(logStub.calledOnce).to.equal(true);
    });

    it('should return false if the property manager returns an invalid string ', () => {
      const user = new User(123);
      const logStub = sinon.stub(user, '_log');

      sinon.stub(user._properties, 'get').returns({ property: 'cat' });
      expect(user.isUserResearchInviteResponseValid).to.equal(false);
      expect(logStub.calledOnce).to.equal(true);
    });
  });

  describe('isValid', () => {
    it('should return true if all properties are valid', () => {
      const user = new User(123);

      sinon.stub(user._properties, 'isValid').value(true);
      sinon.stub(user, 'isUsernameValid').value(true);
      sinon.stub(user, 'isPasswordValid').value(true);
      sinon.stub(user, 'isUserResearchInviteResponseValid').value(true);

      expect(user.isValid()).to.equal(true);
    });

    it('should return false if a property is not valid', () => {
      const user = new User(123);
      const logStub = sinon.stub(user, '_log');

      sinon.stub(user._properties, 'isValid').value(false);
      sinon.stub(user, 'isUsernameValid').value(true);
      sinon.stub(user, 'isPasswordValid').value(true);
      sinon.stub(user, 'isUserResearchInviteResponseValid').value(true);

      expect(user.isValid()).to.equal(false);
      expect(logStub.calledOnce).to.equal(true);
    });

    it('should return false if the UserResearchInviteResponse is not valid', () => {
      const user = new User(123);
      const logStub = sinon.stub(user, '_log');

      sinon.stub(user._properties, 'isValid').value(true);
      sinon.stub(user, 'isUsernameValid').value(true);
      sinon.stub(user, 'isPasswordValid').value(true);
      sinon.stub(user, 'isUserResearchInviteResponseValid').value(false);

      expect(user.isValid()).to.equal(false);
      expect(logStub.calledOnce).to.equal(true);
    });
  });

  describe('statusTranslator', () => {
    it('should return "Pending" when login attributes are null', () => {
      const result = User.statusTranslator(null);

      expect(result).to.equal('Pending');
    });

    it('should return "Pending" when a user has empty login attributes', () => {
      const loginDetails = {};

      const result = User.statusTranslator(loginDetails);

      expect(result).to.equal('Pending');
    });

    it('should return "Active" when a user has a username but no login status', () => {
      const loginDetails = {
        username: 'Jimmy User',
      };

      const result = User.statusTranslator(loginDetails);

      expect(result).to.equal('Active');
    });

    it('should return the login status if it exists', () => {
      const loginDetails = {
        username: 'Jimmy User',
        status: 'Another Status',
      };

      const result = User.statusTranslator(loginDetails);

      expect(result).to.equal('Another Status');
    });
  });

  describe('fetchAdminUsers', () => {
    const mockAdminUserDetails = {
      uid: 'mocked-uid',
      FullNameValue: 'Admin User',
      UserRoleValue: 'Admin',
      EmailValue: 'admin@email.com',
      PhoneValue: '01234567890',
      JobTitleValue: 'admin',
      updated: new Date('01/02/2022'),
      IsPrimary: null,
      login: {
        username: 'adminUser',
        status: null,
      },
    };

    const mockAdminManagerUserDetails = {
      uid: 'mocked-uid2',
      FullNameValue: 'Admin Manager',
      UserRoleValue: 'AdminManager',
      EmailValue: 'adminManager@email.com',
      PhoneValue: '01928374650',
      JobTitleValue: 'admin manager',
      updated: new Date('12/05/2022'),
      IsPrimary: null,
      login: {
        username: null,
        status: null,
      },
    };

    const expectedResponse = [
      {
        uid: 'mocked-uid2',
        fullname: 'Admin Manager',
        role: 'AdminManager',
        email: 'adminManager@email.com',
        phone: '01928374650',
        jobTitle: 'admin manager',
        updated: '2022-12-05T00:00:00.000Z',
        username: null,
        isPrimary: null,
        status: 'Pending',
      },
      {
        uid: 'mocked-uid',
        fullname: 'Admin User',
        role: 'Admin',
        email: 'admin@email.com',
        phone: '01234567890',
        jobTitle: 'admin',
        updated: '2022-01-02T00:00:00.000Z',
        username: 'adminUser',
        isPrimary: null,
        status: 'Active',
      },
    ];

    it('should return a status of 200 and an array of all the admin users', async () => {
      sinon.stub(models.user, 'fetchAdminUsers').returns([mockAdminUserDetails, mockAdminManagerUserDetails]);
      const adminUsers = await User.fetchAdminUsers();

      expect(adminUsers).to.deep.equal(expectedResponse);
    });

    it('should pass the back an empty array, if there are no admin users', async () => {
      sinon.stub(models.user, 'fetchAdminUsers').returns([]);
      const adminUsers = await User.fetchAdminUsers();

      expect(adminUsers).to.deep.equal([]);
    });
  });
});
