const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const uuid = require('uuid');

const models = require('../../../../../models');
const {
  fetchAdminUsers,
  transformAdminUsers,
  statusTranslator,
  createAdminUser,
} = require('../../../../../routes/admin/admin-users');

describe('routes/admin/admin-user', () => {
  let req, res;

  const mockAdminUserDetails = {
    uid: 'mocked-uid',
    FullNameValue: 'Admin User',
    UserRoleValue: 'Admin',
    EmailValue: 'admin@email.com',
    PhoneValue: '01234567890',
    JobTitleValue: 'admin',
    updated: '2022-01-02T00:00:00.000Z',
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
    updated: '2022-05-01T23:00:00.000Z',
    IsPrimary: null,
    login: {
      username: null,
      status: null,
    },
  };

  const expectedResponse = [
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
    {
      uid: 'mocked-uid2',
      fullname: 'Admin Manager',
      role: 'AdminManager',
      email: 'adminManager@email.com',
      phone: '01928374650',
      jobTitle: 'admin manager',
      updated: '2022-05-01T23:00:00.000Z',
      username: null,
      isPrimary: null,
      status: 'Pending',
    },
  ];

  afterEach(() => {
    sinon.restore();
  });

  describe('statusTranslator', () => {
    it('should return the status if the login details have a status', () => {
      const loginDetails = { ...mockAdminUserDetails.login, status: 'Waiting' };
      const updatedStatus = statusTranslator(loginDetails);

      expect(updatedStatus).to.equal('Waiting');
    });

    it('should return Active if the login details do not have a status but do have a username', () => {
      const updatedStatus = statusTranslator(mockAdminUserDetails.login);

      expect(updatedStatus).to.equal('Active');
    });

    it('should return Pending if the login details do not have a status but do have a username', () => {
      const loginDetails = { ...mockAdminUserDetails.login, username: null };
      const updatedStatus = statusTranslator(loginDetails);

      expect(updatedStatus).to.equal('Pending');
    });
  });

  describe('transformAdminUsers', () => {
    const adminUsers = [mockAdminUserDetails, mockAdminManagerUserDetails];

    it('should return the adminUsers array formatted correctly', () => {
      const formattedAdminUsers = transformAdminUsers(adminUsers);

      expect(formattedAdminUsers).to.deep.equal(expectedResponse);
    });
  });

  describe('fetchAdminUsers', () => {
    beforeEach(() => {
      const request = {
        method: 'GET',
        url: 'api/admin/admin-users',
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    it('should return a status of 200 and an array of all the admin users', async () => {
      sinon.stub(models.user, 'fetchAdminUsers').returns([mockAdminUserDetails, mockAdminManagerUserDetails]);
      await fetchAdminUsers(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getJSONData()).to.deep.equal({ adminUsers: expectedResponse });
    });

    it('should pass the back an empty array, if there are no admin users', async () => {
      sinon.stub(models.user, 'fetchAdminUsers').returns([]);
      await fetchAdminUsers(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getJSONData()).to.deep.equal({ adminUsers: [] });
    });

    it('should throw an error if there is a problem retrieving admin users', async () => {
      sinon.stub(models.user, 'fetchAdminUsers').throws(() => new Error());
      await fetchAdminUsers(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getJSONData()).to.deep.equal({ message: 'Could not fetch admin users' });
    });
  });

  describe('createAdminUser', () => {
    const newAdmin = {
      fullname: 'admin user',
      jobTitle: 'administrator',
      email: 'admin@email.com',
      phone: '01234567890',
      role: 'Admin',
    };

    beforeEach(() => {
      const request = {
        method: 'POST',
        url: 'api/admin/admin-user/create-admin-user',
        body: { adminUser: newAdmin },
        userUid: 'mocked-user-uid',
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(uuid, 'v4').returns('mocked-uid');
    });

    it('should return a status of 200 and a success message when successfully creating and admin', async () => {
      sinon.stub(models.user, 'findByUUID').returns({ FullNameValue: 'Mock User' });
      sinon.stub(models.user, 'createAdminUser');
      await createAdminUser(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getJSONData()).to.deep.equal({ message: 'Admin user successfully created' });
    });

    it('should return a status of 400 if the user cannot be found', async () => {
      sinon.stub(models.user, 'findByUUID').returns(null);
      await createAdminUser(req, res);

      expect(res.statusCode).to.equal(401);
      expect(res._getJSONData()).to.deep.equal({ message: 'The user creating the new admin cannot be found' });
    });

    it('should throw an error if there is a problem getting the user', async () => {
      sinon.stub(models.user, 'findByUUID').throws(() => new Error());
      await createAdminUser(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getJSONData()).to.deep.equal({ message: 'Admin user could not be created' });
    });

    it('should throw an error if there is a problem creating the new admin', async () => {
      sinon.stub(models.user, 'findByUUID').returns({ FullNameValue: 'Mock User' });
      sinon.stub(models.user, 'createAdminUser').throws(() => new Error());
      await createAdminUser(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getJSONData()).to.deep.equal({ message: 'Admin user could not be created' });
    });
  });
});
