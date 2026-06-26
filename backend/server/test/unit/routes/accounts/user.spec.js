const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const {
  addUser,
  meetsMaxUserLimit,
  listAdminUsers,
  updateLastViewedVacanciesAndTurnoverMessage,
  partAddNormalUser,
  partAddAdminUser,
  updateNormalUser,
  updateAdminUser,
  updateTrainingCoursesMessageViewedQuantity,
  updateUserFlags,
  changePassword,
} = require('../../../../routes/accounts/user');
const User = require('../../../../models/classes/user').User;
const models = require('../../../../models');
const GovNotifySendEmail = require('../../../../utils/email/notify-email');
const { UserExceptions } = require('../../../../models/classes/user');
const logoutModule = require('../../../../routes/logout');

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

  describe('partAddUser', () => {
    const newAdmin = {
      fullname: 'admin user',
      jobTitle: 'administrator',
      email: 'admin@email.com',
      phone: '01234567890',
      role: 'Admin',
    };

    const newEditUser = {
      fullname: 'edit user',
      jobTitle: 'manager',
      email: 'test@example.com',
      phone: '01234567890',
      role: 'Edit',
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

    const defaultReq = {
      establishmentId: 123,
      establishment: { id: 123 },
      role: 'Edit',
      body: newEditUser,
      username: 'mocked-username',
      get() {
        return 'localhost';
      },
    };

    describe('partAddNormalUser(), POST /api/user/add/:establishmentId', () => {
      beforeEach(() => {
        sinon.stub(User.prototype, 'load').returns(true);
        sinon.stub(User.prototype, 'save').returns();
        sinon.stub(User.prototype, 'toJSON').resolves({});
      });

      it('should return a 200 status if adding a normal user', async () => {
        const req = {
          ...defaultReq,
          body: newEditUser,
        };

        res = httpMocks.createResponse();

        await partAddNormalUser(req, res);

        expect(res.statusCode).to.equal(200);
        expect(User.prototype.save).to.have.been.called;
      });

      const adminUserTypes = ['Admin', 'AdminManager'];

      adminUserTypes.forEach((adminType) => {
        it(`should return a 401 error if normal user attempt to add an ${adminType} user`, async () => {
          const req = {
            ...defaultReq,
            body: { ...newAdmin, role: adminType },
          };

          res = httpMocks.createResponse();

          await partAddNormalUser(req, res);

          expect(res.statusCode).to.equal(401);
          expect(User.prototype.save).not.to.have.been.called;
        });
      });

      it('should return a 400 error if request body contains username / password, which should not be present at this stage', async () => {
        const req = {
          ...defaultReq,
          body: {
            ...newEditUser,
            password: 'Some very secure password e.g. Password!1',
            username: 'someVeryUniqueUsername',
          },
        };

        res = httpMocks.createResponse();

        await partAddNormalUser(req, res);

        expect(res.statusCode).to.equal(400);
        expect(User.prototype.save).not.to.have.been.called;
      });
    });

    describe('partAddAdminUser(), POST /api/user/add/admin', () => {
      beforeEach(() => {
        sinon.stub(User.prototype, 'load').returns(true);
        sinon.stub(User.prototype, 'save').returns();

        req = {
          ...req,
          body: newEditUser,
          role: 'Admin',
          establishmentId: null,
        };

        res = httpMocks.createResponse();
      });

      it('should return a status of 200 and the new admin when successfully creating an admin', async () => {
        sinon.stub(User.prototype, 'toJSON').returns(adminToJSON);
        await partAddAdminUser(req, res);

        const returnedAdmin = { ...adminToJSON, trackingUUID: null };
        expect(res.statusCode).to.equal(200);
        expect(res._getJSONData()).to.deep.equal(returnedAdmin);
        expect(User.prototype.save).to.have.been.called;
      });

      it('should return a status of 200 and the new admin manager when successfully creating an admin manager', async () => {
        req = { ...req, role: 'AdminManager' };
        sinon.stub(User.prototype, 'toJSON').returns({ ...adminToJSON, role: 'AdminManager' });
        await partAddAdminUser(req, res);

        const returnedAdmin = { ...adminToJSON, role: 'AdminManager', trackingUUID: null };
        expect(res.statusCode).to.equal(200);
        expect(res._getJSONData()).to.deep.equal(returnedAdmin);
        expect(User.prototype.save).to.have.been.called;
      });

      it('should return 401 status if user attempting to add is Read user', async () => {
        req.role = 'Read';

        await partAddAdminUser(req, res);

        expect(res.statusCode).to.equal(401);
        expect(User.prototype.save).not.to.have.been.called;
      });

      it('should return 401 status if user attempting to add is None user', async () => {
        req.role = 'None';

        await partAddAdminUser(req, res);

        expect(res.statusCode).to.equal(401);
        expect(User.prototype.save).not.to.have.been.called;
      });

      it('should return 401 status if user attempting to add has no role', async () => {
        req.role = null;

        await partAddAdminUser(req, res);

        expect(res.statusCode).to.equal(401);
        expect(User.prototype.save).not.to.have.been.called;
      });

      it('should return 403 status if new user is not a valid role', async () => {
        req.body.role = 'Hello';

        await partAddAdminUser(req, res);

        expect(res.statusCode).to.equal(403);
        expect(User.prototype.save).not.to.have.been.called;
      });
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
      sinon.stub(console, 'error'); // suppress error in test log
      sinon.stub(User, 'fetchAdminUsers').throws(() => new Error());
      await listAdminUsers(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.deep.equal('Failed to get admin users');
    });
  });

  describe('updateUser', () => {
    const admin = {
      fullname: 'admin manager',
      jobTitle: 'administrator manager',
      email: 'adminmanager@email.com',
      phone: '09876543210',
      role: 'AdminManager',
    };

    const normalUser = {
      fullname: 'user A',
      jobTitle: 'manager',
      email: 'test@example.com',
      phone: '09876543210',
      role: 'Edit',
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

    const restoredNormalUser = { ...restoredAdmin, ...normalUser };

    const mockUserUid = 'mock-user-id';
    const defaultReq = {
      establishmentId: 123,
      establishment: { id: 123 },
      role: 'Edit',
      body: normalUser,
      params: { userId: mockUserUid },
      user: { id: mockUserUid },
      get() {
        return 'localhost';
      },
    };

    describe('updateNormalUser  PUT /api/user/establishment/:id/:userId', () => {
      beforeEach(() => {
        sinon.stub(User.prototype, 'restore').returns(restoredNormalUser);
        sinon.stub(User.prototype, 'load').returns(true);
        sinon.stub(User.prototype, 'save').returns();
        sinon.stub(User.prototype, 'toJSON').returns({});
        sinon.stub(GovNotifySendEmail, 'sendUpdateUserDetails').returns({});
        sinon.stub(models.user, 'findOne').resolves({
          FullNameValue: normalUser.fullname,
          EmailValue: normalUser.email,
        });
      });

      it('should return a status of 200 and a success message when successfully updating a user', async () => {
        const req = { ...defaultReq };
        const res = httpMocks.createResponse();

        await updateNormalUser(req, res);

        expect(res.statusCode).to.equal(200);
        expect(User.prototype.save).to.have.been.called;
      });

      it('should return a status of 200 when the request payload does not specify a role', async () => {
        const req = { ...defaultReq, body: { fullname: 'updated name', email: 'new email' } };
        const res = httpMocks.createResponse();

        await updateNormalUser(req, res);

        expect(res.statusCode).to.equal(200);
        expect(User.prototype.save).to.have.been.called;
      });

      const adminUserTypes = ['Admin', 'AdminManager'];

      adminUserTypes.forEach((adminType) => {
        it(`should return 401 error if attempt to change a user's role to ${adminType} with this endpoint`, async () => {
          const req = { ...defaultReq, body: { ...admin, role: adminType } };
          const res = httpMocks.createResponse();

          await updateNormalUser(req, res);

          expect(res.statusCode).to.equal(401);
          expect(User.prototype.save).not.to.have.been.called;
        });
      });

      it('should send a email to notify user when they change their own user details', async () => {
        const req = { ...defaultReq };
        const res = httpMocks.createResponse();

        await updateNormalUser(req, res);

        expect(res.statusCode).to.equal(200);
        expect(GovNotifySendEmail.sendUpdateUserDetails).to.have.been.calledWith(normalUser.email, normalUser.fullname);
      });

      it('should not send the email if error occured in the update', async () => {
        User.prototype.save.restore();
        sinon.stub(User.prototype, 'save').rejects(new UserExceptions.UserSaveException());

        const req = { ...defaultReq, user: { id: mockUserUid } };
        const res = httpMocks.createResponse();

        await updateNormalUser(req, res);

        expect(res.statusCode).to.equal(500);
        expect(GovNotifySendEmail.sendUpdateUserDetails).not.to.have.been.called;
      });

      it('should not send the email when a primary user change the detail of other user', async () => {
        const primaryUserUid = 'mock-primary-user-uid';

        const req = { ...defaultReq, user: { id: primaryUserUid } };
        const res = httpMocks.createResponse();

        await updateNormalUser(req, res);

        expect(res.statusCode).to.equal(200);
        expect(GovNotifySendEmail.sendUpdateUserDetails).not.to.have.been.called;
      });

      it('should not send the email when an admin swapped into a user and change the detail of that user', async () => {
        // to address an edge case when admin swap into a user by POST /api/user/swap/ with username in body
        // in this case, the auth token's userUid will be the user's uid, not the admin's uid

        const req = { ...defaultReq, user: { id: mockUserUid }, role: 'AdminManager' };
        const res = httpMocks.createResponse();

        await updateNormalUser(req, res);

        expect(res.statusCode).to.equal(200);
        expect(GovNotifySendEmail.sendUpdateUserDetails).not.to.have.been.called;
      });
    });

    describe('updateAdminUser  PUT /api/user/admin/:userId', () => {
      beforeEach(() => {
        sinon.stub(User.prototype, 'restore').returns(restoredAdmin);
        sinon.stub(User.prototype, 'load').returns(true);
        sinon.stub(User.prototype, 'save').returns();

        req = {
          ...req,
          body: admin,
          role: 'AdminManager',
          establishmentId: null,
          params: { userId: 'mocked-uid' },
        };

        res = httpMocks.createResponse();
      });

      it('should return a status of 200 and a success message when successfully updating an admin', async () => {
        const adminToJSON = { ...restoredAdmin, ...admin };
        sinon.stub(User.prototype, 'toJSON').returns(adminToJSON);
        await updateAdminUser(req, res);

        expect(res.statusCode).to.equal(200);
        expect(res._getJSONData()).to.deep.equal(adminToJSON);
        expect(User.prototype.save).to.have.been.called;
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
      expect(res._getData()).to.deep.equal({ message: 'Last viewed date updated' });
    });

    it('should return 400 response if userUid in params invalid', async () => {
      req.params = { userUid: 'invalid-uid' };
      sinon.stub(models.user, 'setDateForLastViewedVacanciesAndTurnoverMessage').returns(null);

      await updateLastViewedVacanciesAndTurnoverMessage(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.deep.equal({ message: 'User UID invalid' });
    });

    it('should return 500 response if unexpected error', async () => {
      req.params = { userUid: '6b6885fa-340d-4d59-8720-c03d8845e603' };
      sinon.stub(models.user, 'setDateForLastViewedVacanciesAndTurnoverMessage').throws();

      await updateLastViewedVacanciesAndTurnoverMessage(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.deep.equal({ message: 'Failed to update last viewed date' });
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

  describe('updateTrainingCoursesMessageViewedQuantity', () => {
    let req;
    let res;

    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });

    it('should return 200 response if userUid in params is valid and database call successful', async () => {
      req.params = { userUid: '6b6885fa-340d-4d59-8720-c03d8845e603' };
      sinon.stub(models.user, 'updateTrainingCoursesMessageViewedQuantity').returns(null);

      await updateTrainingCoursesMessageViewedQuantity(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal({ message: 'Training courses message viewed quantity updated' });
    });

    it('should return 400 response if userUid in params invalid', async () => {
      req.params = { userUid: 'invalid-uid' };
      sinon.stub(models.user, 'updateTrainingCoursesMessageViewedQuantity').returns(null);

      await updateTrainingCoursesMessageViewedQuantity(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.deep.equal({ message: 'User UID invalid' });
    });

    it('should return 500 response if unexpected error', async () => {
      req.params = { userUid: '6b6885fa-340d-4d59-8720-c03d8845e603' };
      sinon.stub(models.user, 'updateTrainingCoursesMessageViewedQuantity').throws();

      await updateTrainingCoursesMessageViewedQuantity(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.deep.equal({ message: 'Failed to update training courses message viewed quantity' });
    });
  });

  describe('updateUserFlags', () => {
    let req;
    let res;

    const mockUserUid = 'mock-user-uid';
    const mockReqBody = { registrationSurveyCompleted: true };

    const defaultReq = {
      method: 'PUT',
      url: `/api/api/user/flag/${mockUserUid}`,
      establishmentId: 123,
      establishment: { id: 123 },
      body: mockReqBody,
      params: { userUid: mockUserUid },
      user: { id: mockUserUid },
    };

    beforeEach(() => {
      req = httpMocks.createRequest(defaultReq);
      res = httpMocks.createResponse();
    });

    it('should respond with 200 and update the flags for user', async () => {
      sinon.stub(models.user, 'updateFlags').resolves(null);

      await updateUserFlags(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal({ message: 'User flags updated' });
      expect(models.user.updateFlags).to.have.been.calledWith(mockUserUid, mockReqBody);
    });

    it('should respond with 400 if the request body contain any unexpected fields', async () => {
      sinon.stub(models.user, 'updateFlags').resolves(null);
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest({ ...defaultReq, body: { role: 'Admin' } });

      await updateUserFlags(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getData()).to.deep.equal({ message: 'Bad request' });
      expect(models.user.updateFlags).not.to.have.been.called;
    });

    it('should respond with 403 if the user uid in request auth token does not match the user uid in params', async () => {
      sinon.stub(models.user, 'updateFlags').resolves(null);
      sinon.stub(console, 'error');

      const req = httpMocks.createRequest({ ...defaultReq, params: { userUid: 'uuid-of-some-other-user' } });

      await updateUserFlags(req, res);

      expect(res.statusCode).to.equal(403);
      expect(res._getData()).to.deep.equal({ message: 'Not allowed to update this user' });
      expect(models.user.updateFlags).not.to.have.been.called;
    });

    it('should respond with 500 if any other error occurs', async () => {
      sinon.stub(models.user, 'updateFlags').rejects('some database error');
      sinon.stub(console, 'error');

      await updateUserFlags(req, res);

      expect(res.statusCode).to.equal(500);
      expect(res._getData()).to.deep.equal({ message: 'Failed to update user flag' });
    });
  });

  describe('changePassword', () => {
    const mockUserUid = 'mock-uid';
    const mockUsername = 'test-user';
    const mockUserFullname = 'Jane Smith';
    const mockUserEmail = 'test@example.com';

    const defaultReq = {
      method: 'PUT',
      url: '/api/user/changePassword',
      body: { currentPassword: 'mockCurrentPassword1234!', newPassword: 'mockNewPassword1234!' },
      params: { userUid: mockUserUid },
      user: { id: mockUserUid },
      username: mockUsername,
    };

    let comparePasswordCallbackPromise;

    const comparePasswordFailed = (passw, err, tribalHashValidated, cb) => {
      comparePasswordCallbackPromise = cb('password not matching', false, false);
    };

    const comparePasswordSuccessful = (passw, err, tribalHashValidated, cb) => {
      comparePasswordCallbackPromise = cb(null, true, false);
    };

    const mockLoginObject = {
      username: mockUsername,
      user: { id: 123, FullNameValue: mockUserFullname, EmailValue: mockUserEmail },
      comparePassword: comparePasswordSuccessful,
      update: () => {},
    };

    it('should trigger send email (sendUpdateUserDetails) on successful change', async () => {
      sinon.stub(models.login, 'findOne').resolves(mockLoginObject);
      sinon.stub(models.sequelize, 'transaction').callsFake((dbOperations) => dbOperations());
      sinon.stub(GovNotifySendEmail, 'sendUpdateUserDetails').returns({});
      sinon.stub(models.userAudit, 'create').resolves({});
      sinon.stub(logoutModule, 'logout').resolves({});

      const req = httpMocks.createRequest(defaultReq);
      const res = httpMocks.createResponse();

      await changePassword(req, res);
      await comparePasswordCallbackPromise;

      expect(res.statusCode).to.equal(200);

      expect(GovNotifySendEmail.sendUpdateUserDetails).to.have.been.calledOnceWith(mockUserEmail, mockUserFullname);
      expect(logoutModule.logout).to.have.been.calledOnce;
    });

    it('should not trigger send email (sendUpdateUserDetails) on failed change', async () => {
      sinon.stub(models.login, 'findOne').resolves({ ...mockLoginObject, comparePassword: comparePasswordFailed });
      sinon.stub(models.sequelize, 'transaction').callsFake((dbOperations) => dbOperations());
      sinon.stub(GovNotifySendEmail, 'sendUpdateUserDetails').returns({});
      sinon.stub(models.userAudit, 'create').resolves({});
      sinon.stub(logoutModule, 'logout').resolves({});

      const req = httpMocks.createRequest(defaultReq);
      const res = httpMocks.createResponse();

      await changePassword(req, res);
      await comparePasswordCallbackPromise;

      expect(res.statusCode).to.equal(403);

      expect(GovNotifySendEmail.sendUpdateUserDetails).not.to.have.been.called;
      expect(logoutModule.logout).not.to.have.been.called;
    });
  });
});
