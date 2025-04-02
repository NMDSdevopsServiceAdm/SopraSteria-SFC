const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const {
  addUser,
  meetsMaxUserLimit,
  partAddUser,
  listAdminUsers,
  updateUser,
  updateLastViewedVacanciesAndTurnoverMessage,
} = require('../../../../routes/accounts/user');
const User = require('../../../../models/classes/user').User;
const models = require('../../../../models');

describe('user.js', () => {
  let req;
  let res;

  beforeEach(() => {
    sinon.stub(User, 'fetchUserTypeCounts').returns({ Edit: 2, Read: 2 });
    req = {
      establishmentId: 123,
      establishment: { id: 123 },
      role: 'Edit',
      isParent: false,
      body: {
        role: 'Edit',
      },
      username: 'mocked-username',
      get() {
        return 'localhost';
      },
    };

    res = httpMocks.createResponse();
  });

  afterEach(() => sinon.restore());

  describe('meetsMaxUserLimit()', () => {
    it('should return false if user has Admin role', async () => {
      req = {
        ...req,
        role: 'Admin',
      };
      const meetLimit = await meetsMaxUserLimit(123, req);

      expect(meetLimit).to.be.false;
    });

    it('should return false if user has AdminManager role', async () => {
      req = {
        ...req,
        role: 'AdminManager',
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
        sinon.stub(User, 'fetchUserTypeCounts').returns({ Edit: 3, Read: 3 });

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
        sinon.stub(User, 'fetchUserTypeCounts').returns({ Edit: 3, Read: 3 });

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
        sinon.stub(User, 'fetchUserTypeCounts').returns({ Edit: 3, Read: 3 });

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
        sinon.stub(User, 'fetchUserTypeCounts').returns({ Edit: 3, Read: 20 });

        const meetLimit = await meetsMaxUserLimit(123, req);

        expect(meetLimit).to.be.true;
      });
    });
  });

  describe('partAddUser()', () => {
    describe('/api/add/admin', () => {
      const newAdmin = {
        fullname: 'admin user',
        jobTitle: 'administrator',
        email: 'admin@email.com',
        phone: '01234567890',
        role: 'Admin',
      };

      const adminToJSON = {
        uid: 'mocked-uid',
        username: null,
        created: '01/02/2022',
        updated: '01/02/20220',
        updatedBy: 'mocked-username',
        isPrimary: false,
        lastLoggedIn: null,
        establishmentId: null,
        agreedUpdatedTerms: false,
        migratedUserFirstLogon: false,
        migratedUser: false,
        registrationSurveyCompleted: null,
        fullname: 'admin user',
        jobTitle: 'administrator',
        email: 'admin@email.com',
        phone: '01234567890',
        role: 'Admin',
      };

      beforeEach(() => {
        sinon.stub(User.prototype, 'load').returns(true);
        sinon.stub(User.prototype, 'save').returns();

        req = {
          ...req,
          body: newAdmin,
          role: 'Admin',
          establishmentId: null,
        };

        res = httpMocks.createResponse();
      });

      it('should return a status of 200 and the new admin when successfully creating an admin', async () => {
        sinon.stub(User.prototype, 'toJSON').returns(adminToJSON);
        await partAddUser(req, res);

        const returnedAdmin = { ...adminToJSON, trackingUUID: null };
        expect(res.statusCode).to.equal(200);
        expect(res._getJSONData()).to.deep.equal(returnedAdmin);
      });

      it('should return a status of 200 and the new admin manager when successfully creating an admin manager', async () => {
        req = { ...req, role: 'AdminManager' };
        sinon.stub(User.prototype, 'toJSON').returns({ ...adminToJSON, role: 'AdminManager' });
        await partAddUser(req, res);

        const returnedAdmin = { ...adminToJSON, role: 'AdminManager', trackingUUID: null };
        expect(res.statusCode).to.equal(200);
        expect(res._getJSONData()).to.deep.equal(returnedAdmin);
      });
    });

    it('should return 401 status if user attempting to add is Read user', async () => {
      req.role = 'Read';

      await partAddUser(req, res);

      expect(res.statusCode).to.equal(401);
    });

    it('should return 401 status if user attempting to add is None user', async () => {
      req.role = 'None';

      await partAddUser(req, res);

      expect(res.statusCode).to.equal(401);
    });

    it('should return 401 status if user attempting to add has no role', async () => {
      req.role = null;

      await partAddUser(req, res);

      expect(res.statusCode).to.equal(401);
    });

    it('should return 403 status if new user is not a valid role', async () => {
      req.body.role = 'Hello';

      await partAddUser(req, res);

      expect(res.statusCode).to.equal(403);
    });
  });

  describe('listAdminUsers', () => {
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

    beforeEach(() => {
      const request = {
        method: 'GET',
        url: 'api/users/admin',
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    it('should return a status of 200 and an array of all the admin users', async () => {
      sinon.stub(User, 'fetchAdminUsers').returns(expectedResponse);
      await listAdminUsers(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getJSONData()).to.deep.equal({ adminUsers: expectedResponse });
    });

    it('should pass the back an empty array, if there are no admin users', async () => {
      sinon.stub(User, 'fetchAdminUsers').returns([]);
      await listAdminUsers(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getJSONData()).to.deep.equal({ adminUsers: [] });
    });

    it('should throw an error if there is a problem retrieving admin users', async () => {
      sinon.stub(User, 'fetchAdminUsers').throws(() => new Error());
      await listAdminUsers(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.deep.equal('Failed to get admin users');
    });
  });

  describe('updateUser', () => {
    describe('/api/user/admin/:userId', () => {
      const updatedAdmin = {
        fullname: 'admin manager',
        jobTitle: 'administrator manager',
        email: 'adminmanager@email.com',
        phone: '09876543210',
        role: 'AdminManager',
      };

      const restoredAdmin = {
        uid: 'mocked-uid',
        username: null,
        created: '01/02/2022',
        updated: '01/02/20220',
        updatedBy: 'mocked-username',
        isPrimary: false,
        lastLoggedIn: null,
        establishmentId: null,
        agreedUpdatedTerms: false,
        migratedUserFirstLogon: false,
        migratedUser: false,
        registrationSurveyCompleted: null,
        fullname: 'admin user',
        jobTitle: 'administrator',
        email: 'admin@email.com',
        phone: '01234567890',
        role: 'Admin',
      };

      beforeEach(() => {
        sinon.stub(User.prototype, 'restore').returns(restoredAdmin);
        sinon.stub(User.prototype, 'load').returns(true);
        sinon.stub(User.prototype, 'save').returns();

        req = {
          ...req,
          body: updatedAdmin,
          role: 'AdminManager',
          establishmentId: null,
          params: { userId: 'mocked-uid' },
        };

        res = httpMocks.createResponse();
      });

      it('should return a status of 200 and a success message when successfully creating an admin', async () => {
        const adminToJSON = { ...restoredAdmin, ...updatedAdmin };
        sinon.stub(User.prototype, 'toJSON').returns(adminToJSON);
        await updateUser(req, res);

        expect(res.statusCode).to.equal(200);
        expect(res._getJSONData()).to.deep.equal(adminToJSON);
      });
    });
  });

  describe('updateLastViewedVacanciesAndTurnoverMessage', () => {
    let req;
    let res;

    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });

    it('should return 200 response if userUid in params is valid and database call successful', async () => {
      req.params = { userUid: '6b6885fa-340d-4d59-8720-c03d8845e603' };
      sinon.stub(models.user, 'setDateForLastViewedVacanciesAndTurnoverMessage').returns(null);

      await updateLastViewedVacanciesAndTurnoverMessage(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal('Last viewed date updated');
    });

    it('should return 400 response if userUid in params invalid', async () => {
      req.params = { userUid: 'invalid-uid' };
      sinon.stub(models.user, 'setDateForLastViewedVacanciesAndTurnoverMessage').returns(null);

      await updateLastViewedVacanciesAndTurnoverMessage(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.deep.equal('User UID invalid');
    });

    it('should return 500 response if unexpected error', async () => {
      req.params = { userUid: '6b6885fa-340d-4d59-8720-c03d8845e603' };
      sinon.stub(models.user, 'setDateForLastViewedVacanciesAndTurnoverMessage').throws();

      await updateLastViewedVacanciesAndTurnoverMessage(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.deep.equal('Failed to update last viewed date');
    });
  });

  describe('POST /api/user/add', () => {
    let stubUserSave;
    let stubAddUserTrackingFindOne;
    const requestBody = {
      email: 'test@example.com',
      fullname: 'new user',
      jobTitle: 'test user',
      password: 'Some very secure password e.g. Password!1',
      phone: '0123456789',
      securityQuestion: 'what is the colour of a blue orange?',
      securityQuestionAnswer: 'blue',
      username: 'test-user',
      addUserUUID: '09009bc3-409b-49ff-aa67-9c9c64339cbf',
    };
    const addUserTrackingRecord = {
      uuid: '09009bc3-409b-49ff-aa67-9c9c64339cbf',
      user: {
        id: 'userId',
        uid: 'some-uuid',
        UserRoleValue: 'Read',
        establishmentId: 'mock-establishment-id',
      },
      completed: null,
    };

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/add',
        body: requestBody,
      });
      res = httpMocks.createResponse();

      stubAddUserTrackingFindOne = sinon.stub(models.addUserTracking, 'findOne').resolves(addUserTrackingRecord);
      sinon.stub(User.prototype, 'restore').resolves(true);
      sinon.stub(User.prototype, 'load').resolves(true);
      sinon.stub(User.prototype, 'hasDefaultNewUserProperties').value(true);
      stubUserSave = sinon.stub(User.prototype, 'save');
      sinon.stub(User.prototype, 'toJSON');
    });

    it('should respond with 200 and save a new user to database', async () => {
      await addUser(req, res);
      expect(res.statusCode).to.equal(200);
      expect(stubUserSave).to.have.been.calledOnce;
    });

    it('should respond with 401 error and not save the user if the addUserTracking uuid token is already used', async () => {
      stubAddUserTrackingFindOne.resolves({ ...addUserTrackingRecord, completed: '2025-01-01 12:00:00:000' });

      await addUser(req, res);
      expect(res.statusCode).to.equal(401);
      expect(res._getData()).to.deep.equal({ message: 'Activation link expired' });
      expect(stubUserSave).not.to.be.called;
    });
  });
});
