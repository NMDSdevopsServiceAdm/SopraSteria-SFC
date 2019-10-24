// this test script runs through a few various different accounts
//  including password reset, username reset, change details add and remove account

// mock the general console loggers - removes unnecessary output while running
// global.console = {
//     log: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn()
// }

const supertest = require('supertest');
const baseEndpoint = require('../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const uuid = require('uuid');
const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

const randomString = require('../utils/random').randomString;

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../mockdata/postcodes').data;
const registrationUtils = require('../utils/registration');
const admin = require('../utils/admin').admin;

// change history validation
const validatePropertyChangeHistory = require('../utils/changeHistory').validatePropertyChangeHistory;
let MIN_TIME_TOLERANCE = process.env.TEST_DEV ? 1000 : 400;
let MAX_TIME_TOLERANCE = process.env.TEST_DEV ? 3000 : 1000;
const PropertiesResponses = {};

describe('Accounts', () => {
  let nonCqcServices = null;
  let nonCQCSite = null;
  beforeAll(async () => {
    const nonCqcServicesResults = await apiEndpoint
      .get('/services/byCategory?cqc=false')
      .expect('Content-Type', /json/)
      .expect(200);
    nonCqcServices = nonCqcServicesResults.body;
    nonCQCSite = registrationUtils.newNonCqcSite(postcodes[2], nonCqcServices);
    const registration = await apiEndpoint
      .post('/registration')
      .send([nonCQCSite])
      .expect('Content-Type', /json/)
      .expect(200);
    if (registration) {
      const adminLogin = await apiEndpoint
        .post('/login')
        .send(admin)
        .expect('Content-Type', /json/)
        .expect(200);
      if (adminLogin.headers.authorization) {
        await apiEndpoint
          .post('/admin/approval')
          .set({ Authorization: adminLogin.headers.authorization })
          .send({
            username: nonCQCSite.user.username,
            approve: true,
          })
          .expect('Content-Type', /json/)
          .expect(200);
      }
    }
  });
  beforeEach(async () => {});
  let successfulUuid = null;
  let successfullToken = null;
  let successfulLoginToken = null;
  let knownUserUid = null;
  let loginAuthToken = null;
  let establishmentId = null;
  let establishmentUid = null;
  describe('/registration/usernameOrEmail', () => {
    it('should lookup a known username via usernameOrPasswword with success', async () => {
      const knownUsername = nonCQCSite.user.username;
      await apiEndpoint.get('/registration/usernameOrEmail/' + encodeURIComponent(knownUsername)).expect(200);
    });
    it('should lookup an unknown username via usernameOrPasswword with not found', async () => {
      const unknownUsername = nonCQCSite.user.username + 'A';
      await apiEndpoint.get('/registration/usernameOrEmail/' + encodeURIComponent(unknownUsername)).expect(404);
    });
    it('should lookup a known email via usernameOrPasswword with success', async () => {
      const knownEmail = nonCQCSite.user.email;
      await apiEndpoint.get('/registration/usernameOrEmail/' + encodeURIComponent(knownEmail)).expect(200);
    });
    it('should lookup an unknown email via usernameOrPasswword with not found', async () => {
      const unknownEmail = nonCQCSite.user.email + 'A';
      await apiEndpoint.get('/registration/usernameOrEmail/' + encodeURIComponent(unknownEmail)).expect(404);
    });
  });

  describe('/registration/requestPasswordReset', () => {
    it('should fail to request reset on unknown username with validation err', async () => {
      await apiEndpoint
        .post('/registration/requestPasswordReset')
        .send({
          usernameOrEmaill: "doesn't matter",
          ttl: 10,
        })
        .expect(400);
    });
    it('should succeed to request reset on unknown username or email', async () => {
      const response = await apiEndpoint
        .post('/registration/requestPasswordReset')
        .send({
          usernameOrEmail: 'unknown',
          ttl: 10,
        })
        .expect(200);
      expect(response.body).not.toHaveProperty('resetLink');
    });
    it('should succeed to request reset on known username', async () => {
      const response = await apiEndpoint
        .post('/registration/requestPasswordReset')
        .send({
          usernameOrEmail: nonCQCSite.user.username,
          ttl: 10,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveProperty('resetLink');
    });
    it('should succeed to request reset on known email', async () => {
      const response = await apiEndpoint
        .post('/registration/requestPasswordReset')
        .send({
          usernameOrEmail: nonCQCSite.user.email,
          ttl: 10,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveProperty('resetLink');
      expect(response.body).toHaveProperty('uuid');
      expect(uuidV4Regex.test(response.body.uuid)).toEqual(true);
    });
  });
  describe('/registration/validateResetPassword', () => {
    it('should fail validation on validating password reset', async () => {
      await apiEndpoint
        .post('/registration/validateResetPassword')
        .send({
          uid: 'not a valid attribute name',
        })
        .expect(400);

      // note - the following is not a valid V4 UUID
      await apiEndpoint
        .post('/registration/validateResetPassword')
        .send({
          uuid: 'aaddb3ac-afcd-4795-10c9-2c5a9479c03b',
        })
        .expect(400);
    });
    it('should fail on unknown reset uuid on validating password reset', async () => {
      const randomUuid = uuid.v4();
      await apiEndpoint
        .post('/registration/validateResetPassword')
        .send({
          uuid: randomUuid,
        })
        .expect(404);
    });
    it('should fail on expired token when validating password reset', async () => {
      const reqResponse = await apiEndpoint
        .post('/registration/requestPasswordReset')
        .send({
          usernameOrEmail: nonCQCSite.user.email,
          ttl: -10,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const resetUuid = reqResponse.body.uuid;
      const validateResponse = await apiEndpoint
        .post('/registration/validateResetPassword')
        .send({
          uuid: resetUuid,
        })
        .expect(403);
    });
    it('should return JWT on Authorization header on successfull validating password reset', async () => {
      const reqResponse = await apiEndpoint
        .post('/registration/requestPasswordReset')
        .send({
          usernameOrEmail: nonCQCSite.user.email,
          ttl: 100,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      successfulUuid = reqResponse.body.uuid;
      const validateResponse = await apiEndpoint
        .post('/registration/validateResetPassword')
        .send({
          uuid: successfulUuid,
        })
        .expect(200);

      const JWTbearerRegex = /^Bearer/;
      expect(JWTbearerRegex.test(validateResponse.headers.authorization)).toEqual(true);
      expect(validateResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(validateResponse.body.fullname).toEqual(nonCQCSite.user.fullname);

      successfullToken = validateResponse.headers.authorization;
    });
    it('should not fail on completed token when re-validating password reset', async () => {
      expect(successfulUuid).not.toBeNull();

      await apiEndpoint
        .post('/registration/validateResetPassword')
        .send({
          uuid: successfulUuid,
        })
        .expect(200);
    });
  });
  describe('/user/resetPassword', () => {
    it('should fail on reset password if no Authorization header given', async () => {
      const passwrdResetResponse = await apiEndpoint
        .post('/user/resetPassword')
        .send({
          password: 'password',
        })
        .expect(401);
    });
    it('should fail on reset password if Authorization header if invalid', async () => {
      // invalid token includes trying to use a login token (fails on aud)
      const loginResponse = await apiEndpoint
        .post('/login')
        .send({
          username: nonCQCSite.user.username,
          password: nonCQCSite.user.password,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const loginAuthyToken = loginResponse.header.authorization;
      await apiEndpoint
        .post('/user/resetPassword')
        .set('Authorization', loginAuthyToken)
        .send({
          password: 'password',
        })
        .expect(403);
    });

    it('should fail on reset password if no password given', async () => {
      await apiEndpoint
        .post('/user/resetPassword')
        .set('Authorization', successfullToken)
        .send({
          Password: 'password', // case sensitive
        })
        .expect(400);
    });
    it('should fail on reset password if password given fails validation (strength)', async () => {
      await apiEndpoint
        .post('/user/resetPassword')
        .set('Authorization', successfullToken)
        .send({
          password: 'password', // password must include one uppercase and one number
        })
        .expect(400);
    });

    it('should success on reset password if using a valid token and valid password', async () => {
      expect(successfulUuid).not.toBeNull();

      await apiEndpoint
        .post('/user/resetPassword')
        .set('Authorization', successfullToken)
        .send({
          password: 'M*y$0s\'p"c!Pa%',
        })
        .expect(200);

      // after successful password reset, the reset token should now be invalid
      await apiEndpoint
        .post('/registration/validateResetPassword')
        .send({
          uuid: successfulUuid,
        })
        .expect(403);

      // login using the old password should fail
      await apiEndpoint
        .post('/login')
        .send({
          username: nonCQCSite.user.username,
          password: nonCQCSite.user.password,
        })
        .expect('Content-Type', /json/)
        .expect(401);

      // login using the new password should now work
      const successfulLoginResponse = await apiEndpoint
        .post('/login')
        .send({
          username: nonCQCSite.user.username,
          password: 'M*y$0s\'p"c!Pa%',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      successfulLoginToken = successfulLoginResponse.headers.authorization;
    });
  });
  describe('/user/changePassword', () => {
    it('should fail for change password if no authorization header', async () => {
      await apiEndpoint
        .post('/user/changePassword')
        .send({
          currentPassword: 'password',
          newPassword: 'new password',
        })
        .expect('Content-Type', /html/)
        .expect(401);
    });
    it('should fail for change password with 403 if no authorisation header is not a valid logged in JWT', async () => {
      expect(successfulUuid).not.toBeNull();

      await apiEndpoint
        .post('/user/changePassword')
        .set('Authorization', successfullToken)
        .send({
          currentPassword: 'password',
          newPassword: 'new password',
        })
        .expect('Content-Type', /html/)
        .expect(403);
    });

    it('should fail for change password if current/new password is not given', async () => {
      expect(successfulLoginToken).not.toBeNull();

      await apiEndpoint
        .post('/user/changePassword')
        .set('Authorization', successfulLoginToken)
        .send({
          ccurrentPassword: 'password',
          newPassword: 'new password',
        })
        .expect('Content-Type', /html/)
        .expect(400);

      await apiEndpoint
        .post('/user/changePassword')
        .set('Authorization', successfulLoginToken)
        .send({
          currentPassword: 'password',
          nnewPassword: 'new password',
        })
        .expect('Content-Type', /html/)
        .expect(400);
    });

    it('should fail for change password if new password is not of required complexity', async () => {
      expect(successfulLoginToken).not.toBeNull();

      // NOTE - there is no checking on history of password used
      // Intentionally not validating complexity of current password
      await apiEndpoint
        .post('/user/changePassword')
        .set('Authorization', successfulLoginToken)
        .send({
          currentPassword: 'Password00',
          newPassword: 'password',
        })
        .expect('Content-Type', /html/)
        .expect(400);
    });

    it('should fail for change password if header is good, but current password is incorrect', async () => {
      expect(successfulLoginToken).not.toBeNull();

      await apiEndpoint
        .post('/user/changePassword')
        .set('Authorization', successfulLoginToken)
        .send({
          currentPassword: 'password', // should be "NewPassword00" from 'should success on reset password if using a valid token and valid password' test above
          newPassword: 'NewPassword00',
        })
        .expect(403);
    });

    it("should success in changing user's password", async () => {
      await apiEndpoint
        .post('/user/changePassword')
        .set('Authorization', successfulLoginToken)
        .send({
          currentPassword: 'M*y$0s\'p"c!Pa%',
          newPassword: '9+7*~Ab{7;',
        })
        .expect('Content-Type', /html/)
        .expect(200);

      // should fail login if using old password
      await apiEndpoint
        .post('/login')
        .send({
          username: nonCQCSite.user.username,
          password: 'M*y$0s\'p"c!Pa%',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      // shoudl pass login if using new passowrd
      const login = await apiEndpoint
        .post('/login')
        .send({
          username: nonCQCSite.user.username,
          password: '9+7*~Ab{7;',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      establishmentId = login.body.establishment.id;
      establishmentUid = login.body.establishment.uid;
      loginAuthToken = login.headers.authorization;
    });
  });
  describe('/user/establishment/:establishmentuid', () => {
    it('should return a list of all establishment users', async () => {
      expect(loginAuthToken).not.toBeNull();
      const allUsersResponse = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(200);

      expect(Array.isArray(allUsersResponse.body.users)).toEqual(true);
      expect(allUsersResponse.body.users.length).toEqual(1);
      expect(allUsersResponse.body.users[0]).toHaveProperty('uid');
      expect(allUsersResponse.body.users[0]).toHaveProperty('fullname');
      expect(allUsersResponse.body.users[0]).toHaveProperty('email');
      expect(allUsersResponse.body.users[0]).toHaveProperty('role');
      expect(['Edit', 'Read'].includes(allUsersResponse.body.users[0].role)).toEqual(true);
      expect(allUsersResponse.body.users[0]).toHaveProperty('lastLoggedIn');
      expect(new Date(allUsersResponse.body.users[0].lastLoggedIn).toISOString()).toEqual(
        allUsersResponse.body.users[0].lastLoggedIn
      );
      expect(allUsersResponse.body.users[0]).toHaveProperty('username');
      expect(allUsersResponse.body.users[0]).toHaveProperty('created');
      expect(allUsersResponse.body.users[0]).toHaveProperty('updated');
      expect(allUsersResponse.body.users[0]).toHaveProperty('updatedBy');
      expect(uuidV4Regex.test(allUsersResponse.body.users[0].uid)).toEqual(true);

      knownUserUid = allUsersResponse.body.users[0].uid;
    });
    it('should fail if requesting a users establishments with no authorization token passed', async () => {
      // now test for unexpected results
      await apiEndpoint
        .get(`/user/establishment/${establishmentUid}`)
        .send({})
        .expect(401);
    });
    it('should fail if requesting a users establishments as the incorrect user', async () => {
      await apiEndpoint
        .get(`/user/establishment/${establishmentId + 1}`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(403);
    });
  });
  describe('/user/establishment/:establishmentuid/:userid?history=none', () => {
    it('should return a User by uid no history', async () => {
      expect(knownUserUid).not.toBeNull();
      expect(loginAuthToken).not.toBeNull();
      expect(establishmentId).not.toBeNull();

      const getUserResponse = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=none`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(200);

      expect(getUserResponse.body.uid).toEqual(knownUserUid);
      expect(getUserResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(getUserResponse.body.created).toEqual(new Date(getUserResponse.body.created).toISOString());
      expect(getUserResponse.body.updated).toEqual(new Date(getUserResponse.body.updated).toISOString());
      expect(getUserResponse.body.fullname).toEqual(nonCQCSite.user.fullname);
      expect(getUserResponse.body.jobTitle).toEqual(nonCQCSite.user.jobTitle);
      expect(getUserResponse.body.email).toEqual(nonCQCSite.user.email.toLowerCase());
      expect(getUserResponse.body.phone).toEqual(nonCQCSite.user.phone);
      expect(getUserResponse.body.securityQuestion).toEqual(nonCQCSite.user.securityQuestion);
      expect(getUserResponse.body.securityQuestionAnswer).toEqual(nonCQCSite.user.securityQuestionAnswer);
      expect(getUserResponse.body.updatedBy).toEqual(nonCQCSite.user.username.toLowerCase());
    });
    it('should fail if no user found', async () => {
      // and now expected errors
      await apiEndpoint
        .get(
          `/user/establishment/${establishmentUid}/${encodeURIComponent(
            '28a401f5-99a6-41c0-b685-91950f90e8f6'
          )}?history=none`
        )
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(404);
    });
    it("should fail if not authorised to request another establishment's user", async () => {
      await apiEndpoint
        .get(`/user/establishment/${establishmentId + 1}/${encodeURIComponent(knownUserUid)}?history=none`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(403);
    });
    it('should fail if a user is not authenicated', async () => {
      await apiEndpoint
        .get(
          `/user/establishment/${establishmentUid}/${encodeURIComponent(
            '28a401f5-99a6-41c0-b685-91950f90e8f6'
          )}?history=none`
        )
        .send({})
        .expect(401);
    });

    it('should return a User by username no history', async () => {
      expect(knownUserUid).not.toBeNull();
      expect(loginAuthToken).not.toBeNull();
      const fetchUsername = nonCQCSite.user.username;
      expect(establishmentId).not.toBeNull();

      const getUserResponse = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(fetchUsername)}?history=none`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(200);
      expect(getUserResponse.body.uid).toEqual(knownUserUid);
      expect(getUserResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(getUserResponse.body.created).toEqual(new Date(getUserResponse.body.created).toISOString());
      expect(getUserResponse.body.updated).toEqual(new Date(getUserResponse.body.updated).toISOString());
      expect(getUserResponse.body.fullname).toEqual(nonCQCSite.user.fullname);
      expect(getUserResponse.body.jobTitle).toEqual(nonCQCSite.user.jobTitle);
      expect(getUserResponse.body.email).toEqual(nonCQCSite.user.email.toLowerCase());
      expect(getUserResponse.body.phone).toEqual(nonCQCSite.user.phone);
      expect(getUserResponse.body.securityQuestion).toEqual(nonCQCSite.user.securityQuestion);
      expect(getUserResponse.body.securityQuestionAnswer).toEqual(nonCQCSite.user.securityQuestionAnswer);
    });
    it('should fail if user is unknown', async () => {
      await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent('unknown user')}?history=none`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(404);
    });
    it('should fail if user not authorized to fetch user', async () => {
      const fetchUsername = nonCQCSite.user.username;
      await apiEndpoint
        .get(`/user/establishment/${establishmentId + 1}/${encodeURIComponent(fetchUsername)}?history=none`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(403);
    });
    it('should fail if user not logged in', async () => {
      await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent('unknown user')}?history=none`)
        .send({})
        .expect(401);
    });
  });
  describe('/user/establishment/:establishmentuid/:userid?history=property', () => {
    it('should get user with property history', async () => {
      expect(knownUserUid).not.toBeNull();
      expect(loginAuthToken).not.toBeNull();
      const fetchUsername = nonCQCSite.user.username;
      expect(establishmentId).not.toBeNull();

      const getUserResponse = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(fetchUsername)}?history=property`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(200);
      expect(getUserResponse.body.uid).toEqual(knownUserUid);
      expect(getUserResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(getUserResponse.body.created).toEqual(new Date(getUserResponse.body.created).toISOString());
      expect(getUserResponse.body.updated).toEqual(new Date(getUserResponse.body.updated).toISOString());

      expect(getUserResponse.body.fullname).toEqual({
        currentValue: nonCQCSite.user.fullname,
        lastSavedBy: nonCQCSite.user.username.toLowerCase(),
        lastChangedBy: nonCQCSite.user.username.toLowerCase(),
        lastSaved: new Date(getUserResponse.body.fullname.lastSaved).toISOString(),
        lastChanged: new Date(getUserResponse.body.fullname.lastChanged).toISOString(),
      });
      expect(getUserResponse.body.jobTitle).toEqual({
        currentValue: nonCQCSite.user.jobTitle,
        lastSavedBy: nonCQCSite.user.username.toLowerCase(),
        lastChangedBy: nonCQCSite.user.username.toLowerCase(),
        lastSaved: new Date(getUserResponse.body.jobTitle.lastSaved).toISOString(),
        lastChanged: new Date(getUserResponse.body.jobTitle.lastChanged).toISOString(),
      });
      expect(getUserResponse.body.email).toEqual({
        currentValue: nonCQCSite.user.email.toLowerCase(),
        lastSavedBy: nonCQCSite.user.username.toLowerCase(),
        lastChangedBy: nonCQCSite.user.username.toLowerCase(),
        lastSaved: new Date(getUserResponse.body.email.lastSaved).toISOString(),
        lastChanged: new Date(getUserResponse.body.email.lastChanged).toISOString(),
      });
      expect(getUserResponse.body.phone).toEqual({
        currentValue: nonCQCSite.user.phone,
        lastSavedBy: nonCQCSite.user.username.toLowerCase(),
        lastChangedBy: nonCQCSite.user.username.toLowerCase(),
        lastSaved: new Date(getUserResponse.body.phone.lastSaved).toISOString(),
        lastChanged: new Date(getUserResponse.body.phone.lastChanged).toISOString(),
      });
      expect(getUserResponse.body.securityQuestion).toEqual({
        currentValue: nonCQCSite.user.securityQuestion,
        lastSavedBy: nonCQCSite.user.username.toLowerCase(),
        lastChangedBy: nonCQCSite.user.username.toLowerCase(),
        lastSaved: new Date(getUserResponse.body.securityQuestion.lastSaved).toISOString(),
        lastChanged: new Date(getUserResponse.body.securityQuestion.lastChanged).toISOString(),
      });
      expect(getUserResponse.body.securityQuestionAnswer).toEqual({
        currentValue: nonCQCSite.user.securityQuestionAnswer,
        lastSavedBy: nonCQCSite.user.username.toLowerCase(),
        lastChangedBy: nonCQCSite.user.username.toLowerCase(),
        lastSaved: new Date(getUserResponse.body.securityQuestionAnswer.lastSaved).toISOString(),
        lastChanged: new Date(getUserResponse.body.securityQuestionAnswer.lastChanged).toISOString(),
      });
    });
  });
  describe('/user/establishment/:establishmentuid/:userid?history=property', () => {
    it('should update fullname property', async () => {
      const updatedFullnameResponse = await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          fullname: nonCQCSite.user.fullname + ' Updated',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(uuidV4Regex.test(updatedFullnameResponse.body.uid)).toEqual(true);
      expect(updatedFullnameResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedFullnameResponse.body.created).toEqual(
        new Date(updatedFullnameResponse.body.created).toISOString()
      );
      expect(updatedFullnameResponse.body.updated).toEqual(
        new Date(updatedFullnameResponse.body.updated).toISOString()
      );
      expect(updatedFullnameResponse.body.updatedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedFullnameResponse.body.fullname).toEqual(nonCQCSite.user.fullname + ' Updated');

      //validatePropertyChangeHistory
      // and now check change history
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          fullname: nonCQCSite.user.fullname + ' Updated Again',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      let requestEpoch = new Date().getTime();
      let userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=full`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.fullname).toHaveProperty('lastSaved');
      expect(userChangeHistory.body.fullname.lastSaved).toEqual(userChangeHistory.body.fullname.lastChanged);
      expect(userChangeHistory.body.fullname.lastSavedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(userChangeHistory.body.fullname.lastChangedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      let updatedEpoch = new Date(userChangeHistory.body.updated).getTime();
      expect(Math.abs(requestEpoch - updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE); // allows for slight clock slew

      // test change history for both the rate and the value
      validatePropertyChangeHistory(
        'fullname',
        PropertiesResponses,
        userChangeHistory.body.fullname,
        nonCQCSite.user.fullname + ' Updated Again',
        nonCQCSite.user.fullname + ' Updated',
        nonCQCSite.user.username,
        requestEpoch,
        (ref, given) => {
          return ref == given;
        },
        6
      );
      let lastSavedDate = userChangeHistory.body.fullname.lastSaved;

      // now update the property but with same value - expect no change
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          fullname: nonCQCSite.user.fullname + ' Updated Again',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=property`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.fullname.currentValue).toEqual(nonCQCSite.user.fullname + ' Updated Again');
      expect(userChangeHistory.body.fullname.lastChanged).toEqual(new Date(lastSavedDate).toISOString()); // lastChanged is equal to the previous last saved
      expect(new Date(userChangeHistory.body.fullname.lastSaved).getTime()).toBeGreaterThan(
        new Date(lastSavedDate).getTime()
      ); // most recent last saved greater than the previous last saved

      // and now expect on failures on updates
      // no authorization header
    });
    it('should fail to change name if user not logged in to edit user', async () => {
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .send({
          fullname: nonCQCSite.user.fullname,
        })
        .expect(401);
    });
    it('should fail to change name if user not logged authorized to edit user', async () => {
      // unexpected establishment id
      await apiEndpoint
        .put(`/user/establishment/${establishmentId + 1}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          fullname: nonCQCSite.user.fullname,
        })
        .expect(403);
    });
    it('should fail to change name if user not found to edit', async () => {
      // unexpected UUID/username
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent('06a3c9ca-533c-4260-9563-8b9dadd480c6')}`)
        .set('Authorization', loginAuthToken)
        .send({
          fullname: nonCQCSite.user.fullname,
        })
        .expect(404);
    });
    it('should fail to change name if name longer than maxiumum allowed', async () => {
      // exceeds maximum length
      const randomFullname = randomString(121);
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          fullname: randomFullname,
        })
        .expect(400);
    });

    it('should update job title property', async () => {
      const updatedJobTitleResponse = await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          jobTitle: nonCQCSite.user.jobTitle + ' Updated',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(uuidV4Regex.test(updatedJobTitleResponse.body.uid)).toEqual(true);
      expect(updatedJobTitleResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedJobTitleResponse.body.created).toEqual(
        new Date(updatedJobTitleResponse.body.created).toISOString()
      );
      expect(updatedJobTitleResponse.body.updated).toEqual(
        new Date(updatedJobTitleResponse.body.updated).toISOString()
      );
      expect(updatedJobTitleResponse.body.updatedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedJobTitleResponse.body.jobTitle).toEqual(nonCQCSite.user.jobTitle + ' Updated');

      //validatePropertyChangeHistory
      // and now check change history
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          jobTitle: nonCQCSite.user.jobTitle + ' Updated Again',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      let requestEpoch = new Date().getTime();
      let userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=full`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.jobTitle).toHaveProperty('lastSaved');
      expect(userChangeHistory.body.jobTitle.lastSaved).toEqual(userChangeHistory.body.jobTitle.lastChanged);
      expect(userChangeHistory.body.jobTitle.lastSavedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(userChangeHistory.body.jobTitle.lastChangedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      let updatedEpoch = new Date(userChangeHistory.body.updated).getTime();
      expect(Math.abs(requestEpoch - updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE); // allows for slight clock slew

      // test change history for both the rate and the value
      validatePropertyChangeHistory(
        'jobTitle',
        PropertiesResponses,
        userChangeHistory.body.jobTitle,
        nonCQCSite.user.jobTitle + ' Updated Again',
        nonCQCSite.user.jobTitle + ' Updated',
        nonCQCSite.user.username,
        requestEpoch,
        (ref, given) => {
          return ref == given;
        },
        6
      );
      let lastSavedDate = userChangeHistory.body.jobTitle.lastSaved;

      // now update the property but with same value - expect no change
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          jobTitle: nonCQCSite.user.jobTitle + ' Updated Again',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=property`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.jobTitle.currentValue).toEqual(nonCQCSite.user.jobTitle + ' Updated Again');
      expect(userChangeHistory.body.jobTitle.lastChanged).toEqual(new Date(lastSavedDate).toISOString()); // lastChanged is equal to the previous last saved
      expect(new Date(userChangeHistory.body.jobTitle.lastSaved).getTime()).toBeGreaterThan(
        new Date(lastSavedDate).getTime()
      ); // most recent last saved greater than the previous last saved

      // and now expect on failures on updates
    });
    it('should fail to change job title if user not logged in to edit user', async () => {
      // no authorization header
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .send({
          jobTitle: nonCQCSite.user.jobTitle,
        })
        .expect(401);
    });
    it('should fail to change job title if user not logged authorized to edit user', async () => {
      // unexpected establishment id
      await apiEndpoint
        .put(`/user/establishment/${establishmentId + 1}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          jobTitle: nonCQCSite.user.jobTitle,
        })
        .expect(403);
    });
    it('should fail to change job title if user not found to edit', async () => {
      // unexpected UUID/username
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent('06a3c9ca-533c-4260-9563-8b9dadd480c6')}`)
        .set('Authorization', loginAuthToken)
        .send({
          jobTitle: nonCQCSite.user.jobTitle,
        })
        .expect(404);
    });
    it('should fail to change job title if name longer than maxiumum allowed', async () => {
      // exceeds maximum length
      const randomJobTitle = randomString(121);
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          jobTitle: randomJobTitle,
        })
        .expect(400);
    });
  });
  describe('/user/establishment/:establishmentuid/:userid', () => {
    it('should update email property', async () => {
      const updatedEmailResponse = await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          email: 'updated.' + nonCQCSite.user.email,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(uuidV4Regex.test(updatedEmailResponse.body.uid)).toEqual(true);
      expect(updatedEmailResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedEmailResponse.body.created).toEqual(new Date(updatedEmailResponse.body.created).toISOString());
      expect(updatedEmailResponse.body.updated).toEqual(new Date(updatedEmailResponse.body.updated).toISOString());
      expect(updatedEmailResponse.body.updatedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedEmailResponse.body.email).toEqual('updated.' + nonCQCSite.user.email.toLowerCase());

      //validatePropertyChangeHistory
      // and now check change history
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          email: 'updated.again.' + nonCQCSite.user.email,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      let requestEpoch = new Date().getTime();
      let userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=full`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.email).toHaveProperty('lastSaved');
      expect(userChangeHistory.body.email.lastSaved).toEqual(userChangeHistory.body.email.lastChanged);
      expect(userChangeHistory.body.email.lastSavedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(userChangeHistory.body.email.lastChangedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      let updatedEpoch = new Date(userChangeHistory.body.updated).getTime();
      expect(Math.abs(requestEpoch - updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE); // allows for slight clock slew

      // test change history for both the rate and the value
      validatePropertyChangeHistory(
        'email',
        PropertiesResponses,
        userChangeHistory.body.email,
        'updated.again.' + nonCQCSite.user.email.toLowerCase(),
        'updated.' + nonCQCSite.user.email.toLowerCase(),
        nonCQCSite.user.username,
        requestEpoch,
        (ref, given) => {
          return ref == given;
        },
        6
      );
      let lastSavedDate = userChangeHistory.body.email.lastSaved;

      // now update the property but with same value - expect no change
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          email: 'updated.again.' + nonCQCSite.user.email,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=property`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.email.currentValue).toEqual('updated.again.' + nonCQCSite.user.email.toLowerCase());
      expect(userChangeHistory.body.email.lastChanged).toEqual(new Date(lastSavedDate).toISOString()); // lastChanged is equal to the previous last saved
      expect(new Date(userChangeHistory.body.email.lastSaved).getTime()).toBeGreaterThan(
        new Date(lastSavedDate).getTime()
      ); // most recent last saved greater than the previous last saved

      // and now expect on failures on updates
      // no authorization header
      });
      it('should fail to change email if user not logged in to edit user', async () => {
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .send({
          email: nonCQCSite.user.email,
        })
        .expect(401);

        });
        it('should fail to change email if user not logged authorized to edit user', async () => {
      // unexpected establishment id
      await apiEndpoint
        .put(`/user/establishment/${establishmentId + 1}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          email: nonCQCSite.user.email,
        })
        .expect(403);

        });
        it('should fail to change email if user not found to edit', async () => {
      // unexpected UUID/username
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent('06a3c9ca-533c-4260-9563-8b9dadd480c6')}`)
        .set('Authorization', loginAuthToken)
        .send({
          email: nonCQCSite.user.email,
        })
        .expect(404);

        });
        it('should fail to change email if name longer than maxiumum allowed', async () => {
      // exceeds maximum length
      const randomEmail = randomString(121);
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          email: randomEmail,
        })
        .expect(400);
      });
      it('should fail to change email if email invalid', async () => {
      // fails pattern match
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          email: 'bob',
        })
        .expect(400);
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          email: 'bob@com',
        })
        .expect(400);
    });

    it('should update phone property', async () => {
      const updatedPhoneResponse = await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          phone: '01234 123123',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(uuidV4Regex.test(updatedPhoneResponse.body.uid)).toEqual(true);
      expect(updatedPhoneResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedPhoneResponse.body.created).toEqual(new Date(updatedPhoneResponse.body.created).toISOString());
      expect(updatedPhoneResponse.body.updated).toEqual(new Date(updatedPhoneResponse.body.updated).toISOString());
      expect(updatedPhoneResponse.body.updatedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedPhoneResponse.body.phone).toEqual('01234 123123');

      //validatePropertyChangeHistory
      // and now check change history
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          phone: '09876 543543',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      let requestEpoch = new Date().getTime();
      let userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=full`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.phone).toHaveProperty('lastSaved');
      expect(userChangeHistory.body.phone.lastSaved).toEqual(userChangeHistory.body.phone.lastChanged);
      expect(userChangeHistory.body.phone.lastSavedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(userChangeHistory.body.phone.lastChangedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      let updatedEpoch = new Date(userChangeHistory.body.updated).getTime();
      expect(Math.abs(requestEpoch - updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE); // allows for slight clock slew

      // test change history for both the rate and the value
      validatePropertyChangeHistory(
        'phone',
        PropertiesResponses,
        userChangeHistory.body.phone,
        '09876 543543',
        '01234 123123',
        nonCQCSite.user.username,
        requestEpoch,
        (ref, given) => {
          return ref == given;
        },
        6
      );
      let lastSavedDate = userChangeHistory.body.phone.lastSaved;

      // now update the property but with same value - expect no change
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          phone: '09876 543543',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=property`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.phone.currentValue).toEqual('09876 543543');
      expect(userChangeHistory.body.phone.lastChanged).toEqual(new Date(lastSavedDate).toISOString()); // lastChanged is equal to the previous last saved
      expect(new Date(userChangeHistory.body.phone.lastSaved).getTime()).toBeGreaterThan(
        new Date(lastSavedDate).getTime()
      ); // most recent last saved greater than the previous last saved

      // and now expect on failures on updates
      // no authorization header
      });
      it('should fail to change phone if user not logged in to edit user', async () => {
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .send({
          phone: nonCQCSite.user.phone,
        })
        .expect(401);

        });
        it('should fail to change phone if user not logged authorized to edit user', async () => {
      // unexpected establishment id
      await apiEndpoint
        .put(`/user/establishment/${establishmentId + 1}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          phone: nonCQCSite.user.phone,
        })
        .expect(403);

        });
        it('should fail to change phone if user not found to edit', async () => {
      // unexpected UUID/username
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent('06a3c9ca-533c-4260-9563-8b9dadd480c6')}`)
        .set('Authorization', loginAuthToken)
        .send({
          phone: nonCQCSite.user.phone,
        })
        .expect(404);

        });
        it('should fail to change phone if phone number invalid', async () => {
      // fails pattern match
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          phone: '0122',
        })
        .expect(400);
    });

    it('should update security question property', async () => {
      const updatedSecurityQuestionResponse = await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestion: nonCQCSite.user.securityQuestion + ' updated',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(uuidV4Regex.test(updatedSecurityQuestionResponse.body.uid)).toEqual(true);
      expect(updatedSecurityQuestionResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedSecurityQuestionResponse.body.created).toEqual(
        new Date(updatedSecurityQuestionResponse.body.created).toISOString()
      );
      expect(updatedSecurityQuestionResponse.body.updated).toEqual(
        new Date(updatedSecurityQuestionResponse.body.updated).toISOString()
      );
      expect(updatedSecurityQuestionResponse.body.updatedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedSecurityQuestionResponse.body.securityQuestion).toEqual(
        nonCQCSite.user.securityQuestion + ' updated'
      );

      //validatePropertyChangeHistory
      // and now check change history
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestion: nonCQCSite.user.securityQuestion + ' updated again',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      let requestEpoch = new Date().getTime();
      let userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=full`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.securityQuestion).toHaveProperty('lastSaved');
      expect(userChangeHistory.body.securityQuestion.lastSaved).toEqual(
        userChangeHistory.body.securityQuestion.lastChanged
      );
      expect(userChangeHistory.body.securityQuestion.lastSavedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(userChangeHistory.body.securityQuestion.lastChangedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      let updatedEpoch = new Date(userChangeHistory.body.updated).getTime();
      expect(Math.abs(requestEpoch - updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE); // allows for slight clock slew

      // test change history for both the rate and the value
      validatePropertyChangeHistory(
        'securityQuestion',
        PropertiesResponses,
        userChangeHistory.body.securityQuestion,
        nonCQCSite.user.securityQuestion + ' updated again',
        nonCQCSite.user.securityQuestion + ' updated',
        nonCQCSite.user.username,
        requestEpoch,
        (ref, given) => {
          return ref == given;
        },
        6
      );
      let lastSavedDate = userChangeHistory.body.securityQuestion.lastSaved;

      // now update the property but with same value - expect no change
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestion: nonCQCSite.user.securityQuestion + ' updated again',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=property`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.securityQuestion.currentValue).toEqual(
        nonCQCSite.user.securityQuestion + ' updated again'
      );
      expect(userChangeHistory.body.securityQuestion.lastChanged).toEqual(new Date(lastSavedDate).toISOString()); // lastChanged is equal to the previous last saved
      expect(new Date(userChangeHistory.body.securityQuestion.lastSaved).getTime()).toBeGreaterThan(
        new Date(lastSavedDate).getTime()
      ); // most recent last saved greater than the previous last saved

      // and now expect on failures on updates
      // no authorization header
      });
      it('should fail to change security question if user not logged in to edit user', async () => {
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .send({
          securityQuestion: nonCQCSite.user.securityQuestion,
        })
        .expect(401);

        });
        it('should fail to change security question if user not logged authorized to edit user', async () => {
      // unexpected establishment id
      await apiEndpoint
        .put(`/user/establishment/${establishmentId + 1}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestion: nonCQCSite.user.securityQuestion,
        })
        .expect(403);

        });
        it('should fail to change securoty question if user not found to edit', async () => {
      // unexpected UUID/username
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent('06a3c9ca-533c-4260-9563-8b9dadd480c6')}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestion: nonCQCSite.user.securityQuestion,
        })
        .expect(404);

        });
        it('should fail to change security question if security question longer than maxiumum allowed', async () => {
      // exceeds length
      const randomSecurityQuestion = randomString(256);
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestion: randomSecurityQuestion,
        })
        .expect(400);
    });

    it('should update security question answer property', async () => {
      const updatedSecurityQuestionAnswerResponse = await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestionAnswer: nonCQCSite.user.securityQuestionAnswer + ' updated',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(uuidV4Regex.test(updatedSecurityQuestionAnswerResponse.body.uid)).toEqual(true);
      expect(updatedSecurityQuestionAnswerResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedSecurityQuestionAnswerResponse.body.created).toEqual(
        new Date(updatedSecurityQuestionAnswerResponse.body.created).toISOString()
      );
      expect(updatedSecurityQuestionAnswerResponse.body.updated).toEqual(
        new Date(updatedSecurityQuestionAnswerResponse.body.updated).toISOString()
      );
      expect(updatedSecurityQuestionAnswerResponse.body.updatedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(updatedSecurityQuestionAnswerResponse.body.securityQuestionAnswer).toEqual(
        nonCQCSite.user.securityQuestionAnswer + ' updated'
      );

      //validatePropertyChangeHistory
      // and now check change history
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestionAnswer: nonCQCSite.user.securityQuestionAnswer + ' updated again',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      let requestEpoch = new Date().getTime();
      let userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=full`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.securityQuestionAnswer).toHaveProperty('lastSaved');
      expect(userChangeHistory.body.securityQuestionAnswer.lastSaved).toEqual(
        userChangeHistory.body.securityQuestionAnswer.lastChanged
      );
      expect(userChangeHistory.body.securityQuestionAnswer.lastSavedBy).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(userChangeHistory.body.securityQuestionAnswer.lastChangedBy).toEqual(
        nonCQCSite.user.username.toLowerCase()
      );
      let updatedEpoch = new Date(userChangeHistory.body.updated).getTime();
      expect(Math.abs(requestEpoch - updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE); // allows for slight clock slew

      // test change history for both the rate and the value
      validatePropertyChangeHistory(
        'securityQuestionAnswer',
        PropertiesResponses,
        userChangeHistory.body.securityQuestionAnswer,
        nonCQCSite.user.securityQuestionAnswer + ' updated again',
        nonCQCSite.user.securityQuestionAnswer + ' updated',
        nonCQCSite.user.username,
        requestEpoch,
        (ref, given) => {
          return ref == given;
        },
        6
      );
      let lastSavedDate = userChangeHistory.body.securityQuestionAnswer.lastSaved;

      // now update the property but with same value - expect no change
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestionAnswer: nonCQCSite.user.securityQuestionAnswer + ' updated again',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      userChangeHistory = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}?history=property`)
        .set('Authorization', loginAuthToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(userChangeHistory.body.securityQuestionAnswer.currentValue).toEqual(
        nonCQCSite.user.securityQuestionAnswer + ' updated again'
      );
      expect(userChangeHistory.body.securityQuestionAnswer.lastChanged).toEqual(new Date(lastSavedDate).toISOString()); // lastChanged is equal to the previous last saved
      expect(new Date(userChangeHistory.body.securityQuestionAnswer.lastSaved).getTime()).toBeGreaterThan(
        new Date(lastSavedDate).getTime()
      ); // most recent last saved greater than the previous last saved

      // and now expect on failures on updates
      // no authorization header
      });
      it('should fail to change security answer if user not logged in to edit user', async () => {
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .send({
          securityQuestionAnswer: nonCQCSite.user.securityQuestionAnswer,
        })
        .expect(401);

        });
        it('should fail to change security answer if user not logged authorized to edit user', async () => {
      // unexpected establishment id
      await apiEndpoint
        .put(`/user/establishment/${establishmentId + 1}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestionAnswer: nonCQCSite.user.securityQuestionAnswer,
        })
        .expect(403);

        });
        it('should fail to change security answer if user not found to edit', async () => {
      // unexpected UUID/username
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent('06a3c9ca-533c-4260-9563-8b9dadd480c6')}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestionAnswer: nonCQCSite.user.securityQuestionAnswer,
        })
        .expect(404);

        });
        it('should fail to change security answer if name longer than maxiumum allowed', async () => {
      // exceeds length
      const randomSecurityQuestionAnswer = randomString(256);
      await apiEndpoint
        .put(`/user/establishment/${establishmentUid}/${encodeURIComponent(knownUserUid)}`)
        .set('Authorization', loginAuthToken)
        .send({
          securityQuestionAnswer: randomSecurityQuestionAnswer,
        })
        .expect(400);
    });

    // update all properties before checking the timeline history
    it('should get user with timeline history', async () => {
      expect(knownUserUid).not.toBeNull();
      expect(loginAuthToken).not.toBeNull();
      const fetchUsername = nonCQCSite.user.username;

      // force a login failure (to expect on event)
      const loginResponse = await apiEndpoint
        .post('/login')
        .send({
          username: nonCQCSite.user.username,
          password: 'bob',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      const getUserResponse = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(fetchUsername)}?history=timeline`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(200);
      expect(getUserResponse.body.uid).toEqual(knownUserUid);
      expect(getUserResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(getUserResponse.body.created).toEqual(new Date(getUserResponse.body.created).toISOString());
      expect(getUserResponse.body.updated).toEqual(new Date(getUserResponse.body.updated).toISOString());

      expect(getUserResponse.body).toHaveProperty('history');
      expect(Array.isArray(getUserResponse.body.history)).toEqual(true);
      expect(getUserResponse.body.history.length).toBeGreaterThan(0);

      // as this is a new registration, we expect to find created and login success/failed
      // NOTE - registration is not yet creating "created" event!!!
      // const userCreated = getUserResponse.body.history[getUserResponse.body.history.length-1];        // the very last (earlist record)
      // expect(userCreated.username).toEqual(nonCQCSite.user.username);
      // expect(userCreated.event).toEqual('created');
      // expect(userCreated.when).toEqual(new Date().userCreated.whentoISOString());
      const loginSuccess = getUserResponse.body.history.find(thisEvent => {
        return thisEvent.event === 'loginSuccess';
      });
      // console.log("TEST DEBUG: login success event: ", loginSuccess);
      expect(loginSuccess.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(loginSuccess.change).toEqual({});
      expect(loginSuccess.property).toEqual('password');
      expect(loginSuccess.when).toEqual(new Date(loginSuccess.when).toISOString());
      const loginFailed = getUserResponse.body.history.find(thisEvent => {
        return thisEvent.event === 'loginFailed';
      });
      // console.log("TEST DEBUG: login failed event: ", loginFailed);
      expect(loginFailed.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(loginFailed.change).toEqual({});
      expect(loginFailed.property).toEqual('password');
      expect(loginFailed.when).toEqual(new Date(loginFailed.when).toISOString());

      // all updated events should have no propery or change
      const allUpdatedEvents = getUserResponse.body.history.filter(thisEvent => {
        return thisEvent.event == 'updated';
      });
      // console.log("TEST DEBUG: Number of updated events: ", allUpdatedEvents.length);
      expect(allUpdatedEvents.length).toEqual(18); // six properties to have been updated (three times)
      allUpdatedEvents.forEach(thisEvent => {
        expect(thisEvent.username).toEqual(nonCQCSite.user.username.toLowerCase());
        expect(thisEvent.change).toBeNull();
        expect(thisEvent.property).toBeNull();
        expect(thisEvent.when).toEqual(new Date(thisEvent.when).toISOString());
      });

      // all changed events should have propery and change activity
      const allChangedEvents = getUserResponse.body.history.filter(thisEvent => {
        return thisEvent.event == 'changed';
      });
      // console.log("TEST DEBUG: Number of changed events: ", allChangedEvents.length);
      expect(allChangedEvents.length).toEqual(19); // six properties to have been updated twice
      allChangedEvents.forEach(thisEvent => {
        expect(thisEvent.username).toEqual(nonCQCSite.user.username.toLowerCase());
        expect(thisEvent.change).not.toBeNull();
        expect(thisEvent.change).toHaveProperty('new');
        expect(thisEvent.change).toHaveProperty('current');
        expect(thisEvent.property).not.toBeNull();
        expect(thisEvent.when).toEqual(new Date(thisEvent.when).toISOString());
      });

      // all saved events should have propery but no change activity
      const allSavedEvents = getUserResponse.body.history.filter(thisEvent => {
        return thisEvent.event == 'saved';
      });
      // console.log("TEST DEBUG: Number of saved events: ", allSavedEvents.length);
      expect(allSavedEvents.length).toEqual(25); // six properties to have been saved three times (twice with change and once without change)
      allSavedEvents.forEach(thisEvent => {
        expect(thisEvent.username).toEqual(nonCQCSite.user.username.toLowerCase());
        expect(thisEvent.change).toBeNull();
        expect(thisEvent.property).not.toBeNull();
        expect(thisEvent.when).toEqual(new Date(thisEvent.when).toISOString());
      });
    });

    it('should get user with full history', async () => {
      expect(knownUserUid).not.toBeNull();
      expect(loginAuthToken).not.toBeNull();
      const fetchUsername = nonCQCSite.user.username;
      expect(establishmentId).not.toBeNull();

      // force a login failure (to expect on event)
      await apiEndpoint
        .post('/login')
        .send({
          username: nonCQCSite.user.username,
          password: 'bob',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      const getUserResponse = await apiEndpoint
        .get(`/user/establishment/${establishmentUid}/${encodeURIComponent(fetchUsername)}?history=full`)
        .set('Authorization', loginAuthToken)
        .send({})
        .expect(200);
      expect(getUserResponse.body.uid).toEqual(knownUserUid);
      expect(getUserResponse.body.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(getUserResponse.body.created).toEqual(new Date(getUserResponse.body.created).toISOString());
      expect(getUserResponse.body.updated).toEqual(new Date(getUserResponse.body.updated).toISOString());

      expect(getUserResponse.body).toHaveProperty('history');
      expect(Array.isArray(getUserResponse.body.history)).toEqual(true);
      expect(getUserResponse.body.history.length).toBeGreaterThan(0);

      // as this is a new registration, we expect to find created and login success/failed
      // NOTE - registration is not yet creating "created" event!!!
      // const userCreated = getUserResponse.body.history[getUserResponse.body.history.length-1];        // the very last (earlist record)
      // expect(userCreated.username).toEqual(nonCQCSite.user.username);
      // expect(userCreated.event).toEqual('created');
      // expect(userCreated.when).toEqual(new Date().userCreated.whentoISOString());
      const loginSuccess = getUserResponse.body.history.find(thisEvent => {
        return thisEvent.event === 'loginSuccess';
      });
      // console.log("TEST DEBUG: login success event: ", loginSuccess);
      expect(loginSuccess.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(loginSuccess.when).toEqual(new Date(loginSuccess.when).toISOString());
      const loginFailed = getUserResponse.body.history.find(thisEvent => {
        return thisEvent.event === 'loginFailed';
      });
      // console.log("TEST DEBUG: login failed event: ", loginFailed);
      expect(loginFailed.username).toEqual(nonCQCSite.user.username.toLowerCase());
      expect(loginFailed.when).toEqual(new Date(loginFailed.when).toISOString());

      // in full history mode, there should be updated events
      const allUpdatedEvents = getUserResponse.body.history.filter(thisEvent => {
        return thisEvent.event == 'updated';
      });
      // console.log("TEST DEBUG: Number of updated events: ", allUpdatedEvents.length);
      expect(allUpdatedEvents.length).toEqual(18); // six properties to have been updated three times (twice with change and once without change)
      allUpdatedEvents.forEach(thisEvent => {
        expect(thisEvent.username).toEqual(nonCQCSite.user.username.toLowerCase());
        expect(thisEvent.when).toEqual(new Date(thisEvent.when).toISOString());
      });

      // in full history mode, there should be no changed or saved events
      const allChangedEvents = getUserResponse.body.history.filter(thisEvent => {
        return thisEvent.event == 'changed';
      });
      expect(allChangedEvents.length).toEqual(0);
      const allSavedEvents = getUserResponse.body.history.filter(thisEvent => {
        return thisEvent.event == 'saved';
      });
      expect(allSavedEvents.length).toEqual(0);
    });

    it('should report on response times', () => {
      const properties = Object.keys(PropertiesResponses);
      let consoleOutput = '';
      properties.forEach(thisProperty => {
        consoleOutput += `\x1b[0m\x1b[33m${thisProperty.padEnd(35, '.')}\x1b[37m\x1b[2m${
          PropertiesResponses[thisProperty]
        } ms\n`;
      });
      console.log(consoleOutput);
    });
  });
});
