const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../models');
const { User } = require('../../../../models/classes/user');

describe('server/models/classes/user.js', () => {
  afterEach(() => {
    sinon.restore();
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
