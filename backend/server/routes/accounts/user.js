// default route for user endpoint
const express = require('express');
const router = express.Router();
const { validate } = require('uuid');

const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated');

const { isAdminRole } = require('../../utils/adminUtils');
const passwordCheck = require('../../utils/security/passwordValidation').isPasswordValid;
const isLocal = require('../../utils/security/isLocalTest').isLocal;
const bcrypt = require('bcrypt-nodejs');
const generateJWT = require('../../utils/security/generateJWT');
const usernameCheck = require('../../utils/security/usernameValidation').isUsernameValid;
const { hasPermission } = require('../../utils/security/hasPermission');

const config = require('../../config/config');
const loginResponse = require('../../utils/login/response');
const { authLimiter } = require('../../utils/middleware/rateLimiting');

// all user functionality is encapsulated
const User = require('../../models/classes/user');
const notifications = require('../../data/notifications');

const normalUserRoles = ['None', 'Read', 'Edit'];
const adminUserRoles = ['Admin', 'AdminManager'];

// default route
const return200 = async (req, res) => {
  res.status(200).send();
};

const responseErrors = {
  invalidUsername: {
    errCode: -210,
    errMessage: 'Invalid Username',
  },
};

// returns a list of all users for the given establishment
const listAllUsers = async (req, res) => {
  // although the establishment id is passed as a parameter, get the authenticated  establishment id from the req
  const establishmentId = req.establishmentId;

  try {
    const allTheseUsers = await User.User.fetch(establishmentId);

    return res.status(200).json({
      users: allTheseUsers,
    });
  } catch (err) {
    console.error('user::establishment - failed', err);
    return res.status(500).send(`Failed to get users for establishment having id: ${establishmentId}`);
  }
};

const listAdminUsers = async (req, res) => {
  try {
    const adminUsers = await User.User.fetchAdminUsers();

    return res.status(200).json({ adminUsers });
  } catch (err) {
    console.error('user::admin - failed', err);
    return res.status(500).send('Failed to get admin users');
  }
};

const getUser = async (req, res) => {
  let userId;
  const establishment = req.establishment;

  if (req.params.userId) {
    userId = req.params.userId;
  } else {
    userId = req.username;
  }

  const establishmentId = req.establishmentId;
  const showHistory =
    req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  // validating user id - must be a V4 UUID or it's a username
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  let byUUID = null,
    byUsername = null;
  if (uuidRegex.test(userId.toUpperCase())) {
    byUUID = userId;
  } else {
    byUsername = escape(userId.toLowerCase());
  }

  const thisUser = new User.User(establishmentId);
  thisUser.establishmentUid = establishment.uid;

  try {
    if (await thisUser.restore(byUUID, byUsername, showHistory && req.query.history !== 'property')) {
      let userData = thisUser.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false);
      if (!(userData.username && req.username && userData.username == req.username)) {
        delete userData.securityQuestionAnswer;
        delete userData.securityQuestion;
      }
      return res.status(200).json(userData);
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    const thisError = new User.UserExceptions.UserRestoreException(
      null,
      thisUser.uid,
      null,
      err,
      null,
      `Failed to retrieve user with uid: ${userId}`,
    );

    console.error('user::GET/:userId - failed', thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

const getMe = async (req, res) => {
  getUser(req, res);
};

const updateAdminUser = async (req, res) => updateUser(req, res);

const updateNormalUser = async (req, res) => {
  const allowUserTypes = [...normalUserRoles];
  if (!allowUserTypes.includes(req?.body?.role)) {
    console.error(`PUT /user/establishment/:id/:userId - trying to change user to a role which is not allowed`);
    return res.status(401).send();
  }

  return updateUser(req, res);
};

// updates a user with given uid or username
const updateUser = async (req, res) => {
  const userId = req.params.userId;

  const establishmentId = req.establishmentId;
  const expiresTTLms = isLocal(req) && req.body.ttl ? parseInt(req.body.ttl) * 1000 : 2 * 60 * 60 * 24 * 1000; // 2 days

  // validating user id - must be a V4 UUID or it's a username
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  let byUUID = null,
    byUsername = null;
  if (uuidRegex.test(userId.toUpperCase())) {
    byUUID = userId;
  } else {
    byUsername = escape(userId.toLowerCase());
  }

  const thisUser = new User.User(establishmentId);

  try {
    // before updating a Worker, we need to be sure the Worker is
    //  available to the given establishment. The best way of doing that
    //  is to restore from given UID
    if (await thisUser.restore(byUUID, byUsername, null)) {
      // TODO: JSON validation

      if (!req.role || (req.role === 'Read' && thisUser.username !== req.username)) {
        console.error('/add/establishment/:id - given user does not have sufficient permission');
        return res.status(401).send();
      }

      if (thisUser.displayStatus === 'Pending' && req.body.isPrimary == true) {
        return res.status(406).send('Requested user status is "Pending". Primary users cannot be in a "Pending" state');
      }

      if (req.role === 'Read' && req.body.role && req.body.role !== 'Read') {
        console.error('User tried to upgrade their own permissions');
        return res.status(403).send();
      }

      if (
        req.body.role &&
        thisUser.userRole !== req.body.role &&
        req.body.role !== 'Admin' &&
        req.body.role !== 'AdminManager'
      ) {
        if (!(req.body.role == 'Edit' || req.body.role == 'Read')) {
          return res.status(400).send('Invalid request');
        }

        let limits = { Edit: User.User.MAX_EDIT_SINGLE_USERS, Read: User.User.MAX_READ_SINGLE_USERS };

        if (req.isParent && req.establishmentId == req.establishment.id) {
          limits = { Edit: User.User.MAX_EDIT_PARENT_USERS, Read: User.User.MAX_READ_PARENT_USERS };
        }

        const currentTypeLimits = await User.User.fetchUserTypeCounts(establishmentId);

        if (currentTypeLimits[req.body.role] + 1 > limits[req.body.role]) {
          return res
            .status(400)
            .send('This user cannot have this permission, the workplace already has the maximum of this type');
        }
      }

      // force lowercase on email when updating
      req.body.email = req.body.email ? req.body.email.toLowerCase() : req.body.email;

      // by loading after the restore, only those properties defined in the
      //  PUT body will be updated (peristed)
      const isValidUser = await thisUser.load(req.body);

      // this is an update to an existing User, so no mandatory properties!
      if (isValidUser) {
        await thisUser.save(req.username, expiresTTLms, null);

        // if local/dev - we're not sending email so return the add user tracking UUID if it exists
        let response = thisUser.toJSON(false, false, false, true);
        if (isLocal(req) && thisUser.trackingId) {
          response = { ...response, trackingUUID: thisUser.trackingId };
        }
        return res.status(200).json(response);
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    if (err instanceof User.UserExceptions.UserJsonException) {
      console.error('User PUT: ', err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof User.UserExceptions.UserSaveException) {
      console.error('User PUT: ', err.message);
      return res.status(500).send(err.safe);
    }
  }
};

// resets a user's password - must have Authoization header and must be a valid password reset JWT
const resetPassword = async (req, res) => {
  const givenPassword = escape(req.body.password);

  if (givenPassword === 'undefined') {
    return res.status(400).send('missing password');
  }

  if (!passwordCheck(givenPassword)) {
    return res.status(400).send('password invalid');
  }

  // NOTE - there is no required check that the password is not the same password nor has the password been used before

  try {
    // all checks pass, so find the user using facts from the token (now on the req)
    const loginResponse = await models.login.findOne({
      where: {
        username: {
          [models.Sequelize.Op.iLike]: req.username,
        },
        isActive: true,
      },
      include: [
        {
          model: models.user,
          attributes: ['id', 'FullNameValue'],
        },
      ],
    });

    if (loginResponse && loginResponse.username === req.username && loginResponse.user.id) {
      await models.sequelize.transaction(async (t) => {
        // login account found - update the passowrd, reset invalid attempts
        const passwordHash = await bcrypt.hashSync(givenPassword, bcrypt.genSaltSync(10), null);
        loginResponse.update(
          {
            Hash: passwordHash,
            invalidAttempt: 0,
            passwdLastChanged: new Date(),
          },
          { transaction: t },
        );

        // and crfeate an audit event
        const auditEvent = {
          userFk: loginResponse.user.id,
          username: req.username,
          type: 'passwdReset',
          property: 'password',
          event: {},
        };
        await models.userAudit.create(auditEvent, { transaction: t });

        // mark the given reset as completed
        await models.passwordTracking.update(
          {
            completed: new Date(),
          },
          {
            where: {
              uuid: req.resetUuid,
            },
            transaction: t,
          },
        );
      });
    } else {
      throw new Error(`Failed to find user: ${req.username}`);
    }

    // gets here on success
    res.status(200).send(`Reset password for ${req.fullname}`);
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('User /resetPassword failed', err);
    return res.status(500).send();
  }
};

// changes a user's password - must have Authoization header and must be a valid login JWT; authenticates the current password before setting new password
const changePassword = async (req, res) => {
  const currentPassword = escape(req.body.currentPassword);
  const newPassword = escape(req.body.newPassword);

  if (currentPassword === 'undefined' || newPassword === 'undefined') {
    return res.status(400).send('missing password');
  }

  // do not validate current password; in case the password complexity rules change (the current password will be authenticated)
  if (!passwordCheck(newPassword)) {
    return res.status(400).send('password invalid');
  }

  // NOTE - there is no required check that the password is not the same password nor has the password been used before

  try {
    // all checks pass, so find the user using facts from the token (now on the req)
    const login = await models.login.findOne({
      where: {
        username: {
          [models.Sequelize.Op.iLike]: req.username,
        },
        isActive: true,
      },
      include: [
        {
          model: models.user,
          attributes: ['id', 'FullNameValue'],
        },
      ],
    });

    if (login && login.username === req.username && login.user.id) {
      // now authenticate the given current password
      login.comparePassword(currentPassword, null, false, async (err, isMatch) => {
        if (isMatch && !err) {
          await models.sequelize.transaction(async (t) => {
            // login account found - update the passowrd, reset invalid attempts
            const passwordHash = await bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null);
            login.update(
              {
                Hash: passwordHash,
                invalidAttempt: 0,
                passwdLastChanged: new Date(),
              },
              { transaction: t },
            );

            // and crfeate an audit event
            const auditEvent = {
              userFk: login.user.id,
              username: req.username,
              type: 'passwdReset',
              property: 'password',
              event: {},
            };
            await models.userAudit.create(auditEvent, { transaction: t });
          });

          return res.status(200).send(`Changed password for ${login.user.FullNameValue}`);
        } else {
          console.error('User /changePassword failed authentication on current password');

          // failed authentication
          await models.sequelize.transaction(async (t) => {
            const maxNumberOfFailedAttempts = 10;

            // increment the number of failed attempts by one
            const loginUpdate = {
              invalidAttempt: login.invalidAttempt + 1,
            };
            login.update(loginUpdate, { transaction: t });

            // TODO - could implement both https://www.npmjs.com/package/request-ip & https://www.npmjs.com/package/iplocation
            //        to resolve the client's IP address on login failure, thus being able to audit the source of where the failed
            //        login came from

            // add an audit record
            const auditEvent = {
              userFk: login.user.id,
              username: req.username,
              type: login.invalidAttempt >= maxNumberOfFailedAttempts + 1 ? 'loginWhileLocked' : 'loginFailed',
              property: 'password',
              event: {},
            };
            await models.userAudit.create(auditEvent, { transaction: t });
          });

          return res.status(403).send();
        }
      }); // end comparePassword.promise.then
    } else {
      throw new Error(`Failed to find user: ${req.username}`);
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('User /changePassword failed', err);
    return res.status(500).send();
  }
};

const meetsMaxUserLimit = async (establishmentId, req) => {
  if (isAdminRole(req.role)) return false;

  let limits = { Edit: User.User.MAX_EDIT_SINGLE_USERS, Read: User.User.MAX_READ_SINGLE_USERS };

  if (req.isParent && req.establishmentId == req.establishment.id) {
    limits = { Edit: User.User.MAX_EDIT_PARENT_USERS, Read: User.User.MAX_READ_PARENT_USERS };
  }

  const currentTypeLimits = await User.User.fetchUserTypeCounts(establishmentId);

  if (currentTypeLimits[req.body.role] + 1 > limits[req.body.role]) {
    return true;
  }

  return false;
};

const partAddAdminUser = async (req, res) => partAddUser(req, res);

const partAddNormalUser = async (req, res) => {
  const allowUserTypes = [...normalUserRoles];

  if (!allowUserTypes.includes(req?.body?.role)) {
    console.error(`POST /user/add/establishment/:id - trying to add user type which is not allowed`);
    return res.status(401).send();
  }

  if (req?.body?.password || req?.body?.username) {
    console.error(
      'POST /user/add/establishment/:id - Invalid request: request body should not contain password / username',
    );
    return res.status(400).send();
  }

  return partAddUser(req, res);
};

// registers (part add) a new user
const partAddUser = async (req, res) => {
  // although the establishment id is passed as a parameter, get the authenticated  establishment id from the req
  const establishmentId = req.establishmentId;
  const expiresTTLms = isLocal(req) && req.body.ttl ? parseInt(req.body.ttl) * 1000 : 2 * 60 * 60 * 24 * 1000; // 2 days

  const errorMessage = isAdminRole(req.role) ? 'POST /api/user/add/admin' : 'POST /api/user/add/establishment/:id';
  // ensure only a user having the role of Edit can register a new user
  if (notPermittedToRegisterNewUser(req.role)) {
    console.error(`${errorMessage} - given user does not have sufficient permission`);
    return res.status(401).send();
  }

  if (newUserRoleNotValid(req.body.role)) {
    console.error(`${errorMessage} - Invalid request`);
    return res.status(403).send();
  }

  if (await meetsMaxUserLimit(establishmentId, req)) {
    console.error(`${errorMessage} - Invalid request`);
    return res
      .status(400)
      .send('This user cannot have this permission, the workplace already has the maximum of this type');
  }

  // use the User properties to load (includes validation)
  const thisUser = new User.User(establishmentId);

  try {
    // TODO: JSON validation

    // force email to be lowercase
    req.body.email = req.body.email ? req.body.email.toLowerCase() : req.body.email;

    // only those properties defined in the POST body will be updated (peristed)
    const isValidUser = await thisUser.load(req.body);

    // this is a new User, so check mandatory properties!
    if (isValidUser) {
      // this is a part user (register user) - so no audit
      // Also, because this is a part user (register user) - must send a registration email which means adding
      //  user tracking
      await thisUser.save(req.username, expiresTTLms);

      // if local/dev - we're not sending email so return the add user tracking UUID
      let response = thisUser.toJSON(false, false, false, true);
      if (isLocal(req)) {
        response = { ...response, trackingUUID: thisUser.trackingId };
      }
      return res.status(200).json(response);
    } else {
      return res.status(400).send('Unexpected Input.');
    }
  } catch (err) {
    if (err instanceof User.UserExceptions.UserJsonException) {
      console.error(`${errorMessage} POST: `, err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof User.UserExceptions.UserSaveException && err.message === 'Missing Mandatory properties') {
      console.error(`${errorMessage} POST: `, err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof User.UserExceptions.UserSaveException) {
      console.error(`${errorMessage} POST: `, err.message);
      return res.status(500).send(err.safe);
    }

    console.error('Unexpected exception: ', err);
  }
};

const notPermittedToRegisterNewUser = (role) => !role || role === 'Read' || role === 'None';

const newUserRoleNotValid = (role) => !['Edit', 'Read', 'None', 'Admin', 'AdminManager'].includes(role);

// Resend activation link
const resendActivationLink = async (req, res) => {
  const userId = req.params.uid;
  const expiresTTLms = isLocal(req) && req.body.ttl ? parseInt(req.body.ttl) * 1000 : 2 * 60 * 60 * 24 * 1000; // 2 days

  // validating user id - must be a V4 UUID
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  let byUUID = null;
  if (uuidRegex.test(userId.toUpperCase())) {
    byUUID = userId;
  } else {
    return res.status(400).send();
  }

  try {
    const passTokenResults = await models.addUserTracking.findOne({
      where: {
        completed: null,
      },
      include: [
        {
          model: models.user,
          attributes: ['id', 'uid', 'FullNameValue', 'EmailValue', 'JobTitleValue', 'PhoneValue'],
          where: {
            uid: byUUID,
          },
        },
      ],
    });

    if (passTokenResults) {
      const thisUser = new User.User();
      if (await thisUser.restore(passTokenResults.user.uid, null, null)) {
        let trackingUUID = '';
        await models.sequelize.transaction(async (t) => {
          trackingUUID = await thisUser.trackNewUser(req.username, t, expiresTTLms);
        });
        let response = {};
        if (isLocal(req)) {
          response = { trackingUUID };
        }

        return res.status(200).send(response);
      }
    }

    return res.status(404).send('Not found');
  } catch (err) {
    return res.status(500).send(err.safe);
  }
};

// validates (part add) a new user - not authentication middleware
const finishAddUser = async (req, res) => {
  if (!req.body.uuid) {
    console.error('No UUID');
    return res.status(400).send();
  }
  // parse input - escaped to prevent SQL injection
  const givenUuid = escape(req.body.uuid);
  const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

  if (!uuidV4Regex.test(givenUuid)) {
    console.error('Invalid UUID');
    return res.status(400).send();
  }

  try {
    // username is on Login table, but email is on User table. Could join, but it's just as east to fetch each individual
    const passTokenResults = await models.addUserTracking.findOne({
      where: {
        uuid: givenUuid,
      },
      include: [
        {
          model: models.user,
          attributes: ['id', 'uid', 'FullNameValue', 'EmailValue', 'JobTitleValue', 'PhoneValue'],
        },
      ],
    });

    if (
      passTokenResults &&
      passTokenResults.id &&
      !passTokenResults.completed &&
      !(passTokenResults.expires.getTime() < new Date().getTime())
    ) {
      // gets this far if the token is valid. Generate a JWT, which requires knowing the associated User UUID.
      if (passTokenResults.user && passTokenResults.user.id) {
        // generate JWT and attach it to the header (Authorization) - JWT username is the name of the User who registered the user (for audit purposes)
        const JWTexpiryInMinutes = 30;
        const token = generateJWT.addUserJWT(
          JWTexpiryInMinutes,
          passTokenResults.user.uid,
          passTokenResults.user.FullNameValue,
          givenUuid,
        );

        res.set({
          Authorization: 'Bearer ' + token,
        });

        return res.status(200).json({
          fullname: passTokenResults.user.FullNameValue,
          jobTitle: passTokenResults.user.JobTitleValue,
          email: passTokenResults.user.EmailValue,
          phone: passTokenResults.user.PhoneValue,
        });
      } else {
        throw new Error(`Failed to find user matching reset token (${givenUuid})`);
      }
    } else {
      // token not found
      console.error(`/add/validateAddUser - active reset token (${givenUuid}) not found`);
      return res.status(404).send();
    }
  } catch (err) {
    console.error('/add/validateAddUser - failed: ', err);
    return res.status(500).send();
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.userid;

  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  if (!uuidRegex.test(userId.toUpperCase())) {
    return res.status(500).send('Invalid request');
  }

  const thisUser = new User.User(userId);

  try {
    if (await thisUser.restore(userId, null, false)) {
      if (thisUser.username && thisUser.username == req.username) {
        return res.status(400).send('Cannot delete own user account');
      }

      if (thisUser._isPrimary) {
        return res.status(400).send('Cannot delete primary account');
      }

      await thisUser.delete(req.username);

      return res.status(204).send();
    } else {
      console.log('404 not found that user');
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    const thisError = new User.UserExceptions.UserRestoreException(
      thisUser.id,
      thisUser.uid,
      null,
      err,
      null,
      `Failed to delete User with id/uid: ${userId}`,
    );

    console.error('User::DELETE - failed', thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

// registers (full add) a new user - authentication middleware is specific to add user token
const addUser = async (req, res) => {
  // although the establishment id is passed as a parameter, get the authenticated  establishment id from the req
  const addUserUUID = req.addUserUUID;

  try {
    // TODO: JSON validation
    if (req.body[0] && req.body[0].user && req.body[0].user.username) {
      if (!usernameCheck(req.body[0].user.username)) {
        return res.status(400).json(responseErrors.invalidUsername);
      }
    }

    // The required User role will obtained from the original user record at the time of registration via the
    //  add user tracking UUID, along with the establishment ID
    const trackingResponse = await models.addUserTracking.findOne({
      where: {
        uuid: addUserUUID,
      },
      include: [
        {
          model: models.user,
          attributes: ['id', 'uid', 'UserRoleValue', 'establishmentId'],
        },
      ],
    });

    if (trackingResponse?.completed) {
      console.error('POST /api/user/add error - user with the given uuid token has already completed registration');
      return res.status(401).send({ message: 'Activation link expired' });
    }

    if (trackingResponse && trackingResponse.uuid && trackingResponse.user.uid) {
      // use the User properties to load (includes validation)
      const thisUser = new User.User(trackingResponse.user.establishmentId, addUserUUID);

      if (await thisUser.restore(trackingResponse.user.uid, null, null)) {
        // only those properties defined in the POST body will be updated (peristed) along with
        //   the additional role property - ovverwrites against that could be passed in the body
        const newUserProperties = {
          ...req.body,
          isActive: true,
          status: null,
          agreedUpdatedTerms: true,
          role: trackingResponse.user.UserRoleValue,
        };

        // force the username and email to be lowercase
        newUserProperties.username = newUserProperties.username?.toLowerCase();
        newUserProperties.email = newUserProperties.email?.toLowerCase();

        const isValidUser = await thisUser.load(newUserProperties);
        // this is a new User, so check mandatory properties and additional the additional default properties required to add a user!
        if (isValidUser && thisUser.hasDefaultNewUserProperties) {
          // this is a part user (register user) - so no audit
          // Also, because this is a part user (register user) - must send a registration email which means adding
          //  user tracking
          await thisUser.save(trackingResponse.by, 0, null, true);

          return res.status(200).json(thisUser.toJSON(false, false, false, true));
        } else {
          return res.status(400).send('Unexpected Input.');
        }
      } else {
        return res.status(404).send();
      }
    } else {
      // not found the given add user tracking reference
      console.error('POST /api/user/add error - failed to match add user tracking and user record');
      return res.status(404).send();
    }
  } catch (err) {
    if (err instanceof User.UserExceptions.UserJsonException) {
      console.error('POST /api/user/add error: ', err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof User.UserExceptions.UserSaveException && err.message === 'Duplicate Username') {
      console.error('POST /api/user/add error: ', err.message);
      return res.status(400).send(err.message);
    } else if (err instanceof User.UserExceptions.UserSaveException) {
      console.error('POST /api/user/add error: ', err.message);
      return res.status(500).send(err.safe);
    }

    console.error('Unexpected exception: ', err);
  }
};

// returns the set of establishments associated with this (as given by JWT) user
// their primary establishment always exists and is awlays returned.
// If, this user has Edit authority and their primary establishment is a parent, then this aslo returns all the subs.
const listEstablishments = async (req, res) => {
  // although the establishment id is passed as a parameter, get the authenticated  establishment id from the req
  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const isParent = req.isParent;
  const isWDF = req.query.wdf ? true : false;

  try {
    const thisUser = new User.User(primaryEstablishmentId);
    await thisUser.restore(null, theLoggedInUser, false);
    const myEstablishments = await thisUser.myEstablishments(isParent, isWDF, null);
    return res.status(200).send(myEstablishments);
  } catch (err) {
    console.error('/user/my/establishments: ERR: ', err.message);
    return res.status(500).send({}); // intentionally an empty JSON response
  }
};

// Lists the notifications for the logged in (as given by JWT) user
const listNotifications = async (req, res) => {
  try {
    //pull the user's uuid out of JWT
    const params = {
      userUid: req.userUid,
    };

    //add pagination parameters if specified on the query string
    if (Number.isInteger(+req.query.limit)) {
      params.limit = +req.query.limit;
    }

    if (Number.isInteger(+req.query.offset)) {
      params.offset = +req.query.offset;
    }

    //return the list
    return res.status(200).send(await notifications.getListByUser(params));
  } catch (e) {
    return res.status(500).send({
      message: e.message,
    });
  }
};

router.use('/swap/establishment/notification/:nmsdId', Authorization.isAdmin);
router.route('/swap/establishment/notification/:nmsdId').get(async (req, res) => {
  try {
    const params = {
      nmsdId: req.params.nmsdId,
    };
    const getEstablishmentId = await notifications.getEstablishmentId(params);
    if (getEstablishmentId) {
      params.establishmentId = getEstablishmentId[0].EstablishmentID;
      let notificationArr = [];

      const establishmentNotifications = await notifications.selectNotificationByEstablishment(req.establishmentUid);
      if (establishmentNotifications) notificationArr.push(establishmentNotifications);
      return res.status(200).send(notificationArr);
    }
  } catch (e) {
    return res.status(500).send({
      message: e.message,
    });
  }
});

const swapEstablishment = async (req, res) => {
  const newEstablishmentId = req.params.id;

  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  if (!uuidRegex.test(newEstablishmentId.toUpperCase()))
    return res.status(400).send({ message: 'Unexpected establishment id' });

  let establishment = null;
  if (newEstablishmentId) {
    // this is an admin user, find the given establishment
    establishment = await models.establishment.findOne({
      attributes: [
        'id',
        'uid',
        'NameValue',
        'isRegulated',
        'nmdsId',
        'isParent',
        'parentUid',
        'parentId',
        'lastBulkUploaded',
      ],
      include: [
        {
          model: models.services,
          as: 'mainService',
          attributes: ['id', 'name'],
        },
      ],
      where: {
        uid: newEstablishmentId,
      },
    });

    if (!establishment || !establishment.id) {
      console.error('POST .../user/swap/establishment failed: on finding the given establishment');
      return res.status(404).send({
        message: `Establishment with UID ${newEstablishmentId} is not found`,
      });
    }
  }

  // dereference the user
  const thisUser = await models.login.findOne({
    attributes: ['username', 'lastLogin'],
    where: {
      username: req.body.username ? req.body.username : req.username,
    },
    include: [
      {
        model: models.user,
        attributes: ['uid', 'FullNameValue'],
      },
    ],
  });

  // gets here having found the establishment
  const loginTokenTTL = config.get('jwt.ttl.login');
  const token = generateJWT.loginJWT(
    loginTokenTTL,
    establishment.id,
    establishment.uid,
    establishment.isParent,
    req.username,
    req.role,
    thisUser.user.uid,
  );
  var date = new Date().getTime();
  date += loginTokenTTL * 60 * 1000;

  if (!thisUser || !thisUser.username || !thisUser.user.uid) {
    console.log('POST .../user/swap/establishment failed to dereference thisUser');
    return res.status(400).send({ message: 'Unexpected user' });
  }

  const response = loginResponse(
    thisUser.user.uid,
    thisUser.user.FullNameValue,
    false,
    thisUser.lastLogin,
    req.role,
    establishment,
    req.username,
    new Date(date).toISOString(),
  );

  return res
    .set({ Authorization: 'Bearer ' + token })
    .status(200)
    .json(response);
};

const updateLastViewedVacanciesAndTurnoverMessage = async (req, res) => {
  try {
    const userUid = req.params?.userUid;

    if (!validate(userUid)) {
      return res.status(400).send('User UID invalid');
    }

    await models.user.setDateForLastViewedVacanciesAndTurnoverMessage(userUid);

    return res.status(200).send('Last viewed date updated');
  } catch (error) {
    return res.status(500).send('Failed to update last viewed date');
  }
};

router.route('/').get(return200);

// Admin only endpoints
router.route('/admin').get(Authorization.isAdmin, listAdminUsers);
router.route('/admin/:userId').get(Authorization.isAdmin, getUser);
router.route('/admin/:userId').put(Authorization.isAdminManager, updateAdminUser);
router.route('/admin/me/:userId').put(Authorization.isAdmin, updateAdminUser);
router.route('/admin/:userid').delete(Authorization.isAdminManager, deleteUser);
router.route('/add/admin').post(Authorization.isAdminManager, partAddAdminUser);
router.route('/:uid/resend-activation-admin').post(Authorization.isAdminManager, resendActivationLink);

// normal user endpoints
router
  .route('/establishment/:id')
  .get(Authorization.hasAuthorisedEstablishment, hasPermission('canViewListOfUsers'), listAllUsers);
router
  .route('/establishment/:id/:userId')
  .get(Authorization.hasAuthorisedEstablishment, hasPermission('canViewUser'), getUser);
router
  .route('/establishment/:id/:userId')
  .put(Authorization.hasAuthorisedEstablishmentAllowAllRoles, hasPermission('canEditUser'), updateNormalUser);
router
  .route('/establishment/:id/:userid')
  .delete(Authorization.hasAuthorisedEstablishment, hasPermission('canDeleteUser'), deleteUser);
router.route('/me').get(Authorization.isAuthorised, getMe);
router.route('/resetPassword').post(Authorization.isAuthorisedPasswdReset, resetPassword);
router.route('/changePassword').post(Authorization.isAuthorised, changePassword);
router
  .route('/add/establishment/:id')
  .post(Authorization.hasAuthorisedEstablishment, hasPermission('canAddUser'), partAddNormalUser);
router.route('/:uid/resend-activation').post(Authorization.isAuthorised, resendActivationLink);
router.route('/validateAddUser').post(finishAddUser);
router.route('/add').post(Authorization.isAuthorisedAddUser, addUser);
router.route('/my/establishments').get(Authorization.isAuthorised, listEstablishments);

router.use('/my/notifications', Authorization.isAuthorised);
router.route('/my/notifications').get(listNotifications);
router
  .route('/update-last-viewed-vacancies-and-turnover-message/:userUid')
  .post(Authorization.isAuthorised, updateLastViewedVacanciesAndTurnoverMessage);

router.use('/swap/establishment/:id', authLimiter);
router.route('/swap/establishment/:id').post(Authorization.isAdmin, swapEstablishment);

module.exports = router;

module.exports.meetsMaxUserLimit = meetsMaxUserLimit;
module.exports.partAddNormalUser = partAddNormalUser;
module.exports.partAddAdminUser = partAddAdminUser;
module.exports.listAdminUsers = listAdminUsers;
module.exports.updateAdminUser = updateAdminUser;
module.exports.updateNormalUser = updateNormalUser;
module.exports.updateLastViewedVacanciesAndTurnoverMessage = updateLastViewedVacanciesAndTurnoverMessage;
module.exports.addUser = addUser;
