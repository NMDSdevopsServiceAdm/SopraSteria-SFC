// default route for user endpoint
const express = require('express');
const router = express.Router();

const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated');
const passwordCheck = require('../../utils/security/passwordValidation').isPasswordValid;
const isLocal = require('../../utils/security/isLocalTest').isLocal;
const bcrypt = require('bcrypt-nodejs');

// all user functionality is encapsulated
const User = require('../../models/classes/user');

// default route
router.route('/').get(async (req, res) => {
    res.status(200).send();
});


// returns a list of all users for the given establishment
router.use('/establishment/:id', Authorization.hasAuthorisedEstablishment);
router.route('/establishment/:id').get(async (req, res) => {
    // although the establishment id is passed as a parameter, get the authenticated  establishment id from the req
    const establishmentId = req.establishmentId;

    try {
        const allTheseUsers = await User.User.fetch(establishmentId);
        return res.status(200).json({
            users: allTheseUsers
        });
    } catch (err) {
        console.error('user::establishment - failed', err);
        return res.status(503).send(`Failed to get users for establishment having id: ${establishmentId}`);
    }
});

// gets requested user id or username - using the establishment id extracted for authorised toekn
// optional parameter - "history" must equal 1
router.use('/establishment/:id/:userId', Authorization.hasAuthorisedEstablishment);
router.route('/establishment/:id/:userId').get(async (req, res) => {
    const userId = req.params.userId;
    const establishmentId = req.establishmentId;
    const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
    const showHistoryTime = req.query.history === 'timeline' ? true : false;
    const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

    // validating user id - must be a V4 UUID or it's a username
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    let byUUID = null, byUsername = null;
    if (uuidRegex.test(userId.toUpperCase())) {
        byUUID = userId;
    } else {
        byUsername = escape(userId);
    }

    const thisUser = new User.User(establishmentId);

    try {
        if (await thisUser.restore(byUUID, byUsername, showHistory)) {
            return res.status(200).json(thisUser.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false));
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
            `Failed to retrieve user with uid: ${userId}`);

        console.error('user::GET/:userId - failed', thisError.message);
        return res.status(503).send(thisError.safe);
    }
});

// updates a user with given uid or username
router.use('/establishment/:id/:userId', Authorization.hasAuthorisedEstablishment);
router.route('/establishment/:id/:userId').put(async (req, res) => {
    const userId = req.params.userId;
    const establishmentId = req.establishmentId;

    // validating user id - must be a V4 UUID or it's a username
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    let byUUID = null, byUsername = null;
    if (uuidRegex.test(userId.toUpperCase())) {
        byUUID = userId;
    } else {
        byUsername = escape(userId);
    }
    
    const thisUser = new User.User(establishmentId);
    
    try {
        // before updating a Worker, we need to be sure the Worker is
        //  available to the given establishment. The best way of doing that
        //  is to restore from given UID
        if (await thisUser.restore(byUUID, byUsername, null)) {
            // TODO: JSON validation

            // by loading after the restore, only those properties defined in the
            //  PUT body will be updated (peristed)
            const isValidUser = await thisUser.load(req.body);

            // this is an update to an existing User, so no mandatory properties!
            if (isValidUser) {
                await thisUser.save(req.username);
                return res.status(200).json(thisUser.toJSON(false, false, false, true));
            } else {
                return res.status(400).send('Unexpected Input.');
            }
            
        } else {
            // not found worker
            return res.status(404).send('Not Found');
        }

    } catch (err) {
        if (err instanceof User.UserExceptions.UserJsonException) {
            console.error("User PUT: ", err.message);
            return res.status(400).send(err.safe);
        } else if (err instanceof User.UserExceptions.UserSaveException) {
            console.error("User PUT: ", err.message);
            return res.status(503).send(err.safe);
        }
    }
});


// resets a user's password - must have Authoization header and must be a valid password reset JWT
router.use('/resetPassword', Authorization.isAuthorisedPasswdReset);
router.route('/resetPassword').post(async (req, res) => {
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
                username: req.username,
                isActive: true
            },
            include: [
                {
                    model: models.user,
                    attributes: ['id', 'FullNameValue'],
                }
            ]
        });

        if (loginResponse && loginResponse.username === req.username && loginResponse.user.id) {
            await models.sequelize.transaction(async t => {
                // login account found - update the passowrd, reset invalid attempts
                const passwordHash = await bcrypt.hashSync(givenPassword, bcrypt.genSaltSync(10), null);
                loginResponse.update({
                    Hash: passwordHash,
                    invalidAttempt: 0,
                    passwdLastChanged: new Date()
                }, {transaction: t});

                // and crfeate an audit event
                const auditEvent = {
                    userFk: loginResponse.user.id,
                    username: req.username,
                    type: 'passwdReset',
                    property: 'password',
                    event: {}
                };
                await models.userAudit.create(auditEvent, {transaction: t});

                // mark the given reset as completed
                await models.passwordTracking.update(
                    {
                        completed: new Date()
                    },
                    {
                        where: {
                                uuid: req.resetUuid
                        },
                        transaction: t
                    }
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
        return res.status(503).send();
      }
});

// changes a user's password - must have Authoization header and must be a valid login JWT; authenticates the current password before setting new password
router.use('/changePassword', Authorization.isAuthorised);
router.route('/changePassword').post(async (req, res) => {
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
                username: req.username,
                isActive: true
            },
            include: [
                {
                    model: models.user,
                    attributes: ['id', 'FullNameValue'],
                }
            ]
        });

        if (login && login.username === req.username && login.user.id) {
            // now authenticate the given current password
            login.comparePassword(currentPassword, async (err, isMatch) => {
                if (isMatch && !err) {
                    await models.sequelize.transaction(async t => {
                        // login account found - update the passowrd, reset invalid attempts
                        const passwordHash = await bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null);
                        login.update({
                            Hash: passwordHash,
                            invalidAttempt: 0,
                            passwdLastChanged: new Date()
                        },
                        {transaction: t});
        
                        // and crfeate an audit event
                        const auditEvent = {
                            userFk: login.user.id,
                            username: req.username,
                            type: 'passwdReset',
                            property: 'password',
                            event: {}
                        };
                        await models.userAudit.create(auditEvent, {transaction: t});
                    });

                    return res.status(200).send(`Changed password for ${login.user.FullNameValue}`);

                } else {
                    console.error("User /changePassword failed authentication on current password");

                    // failed authentication
                    await models.sequelize.transaction(async t => {
                        const maxNumberOfFailedAttempts = 10;
          
                        // increment the number of failed attempts by one
                        const loginUpdate = {
                          invalidAttempt: login.invalidAttempt + 1
                        };
                        login.update(loginUpdate, {transaction: t});
          
                        // TODO - could implement both https://www.npmjs.com/package/request-ip & https://www.npmjs.com/package/iplocation 
                        //        to resolve the client's IP address on login failure, thus being able to audit the source of where the failed
                        //        login came from
          
                        // add an audit record
                        const auditEvent = {
                          userFk: login.user.id,
                          username: req.username,
                          type: login.invalidAttempt >= (maxNumberOfFailedAttempts+1) ? 'loginWhileLocked' : 'loginFailed',
                          property: 'password',
                          event: {}
                        };
                        await models.userAudit.create(auditEvent, {transaction: t});
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
        return res.status(503).send();
      }
});

// registers (part add) a new user
router.use('/add/establishment/:id', Authorization.hasAuthorisedEstablishment);
router.route('/add/establishment/:id').post(async (req, res) => {
    // although the establishment id is passed as a parameter, get the authenticated  establishment id from the req
    const establishmentId = req.establishmentId;

    // from body expect to find fullname, job title, role, email address and telephone number
    // if (!(req.body.fullname && req.body.jobTitle && req.body.role && req.body.email && req.body.phone)) {
    //     return res.status(400).send();
    // }

    const expiresTTLms = isLocal(req) && req.body.ttl ? parseInt(req.body.ttl)*1000 : 60*24*1000; // 24 hours
    
    // use the User properties to load (includes validation)
    const thisUser = new User.User(establishmentId);
    
    try {
        // TODO: JSON validation

        // by loading after the restore, only those properties defined in the
        //  PUT body will be updated (peristed)
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
                response = { ...response, trackingUUID: thisUser.trackingId};
            }
            return res.status(200).json(response);
        } else {
            return res.status(400).send('Unexpected Input.');
        }

    } catch (err) {
        if (err instanceof User.UserExceptions.UserJsonException) {
            console.error("/add/establishment/:id POST: ", err.message);
            return res.status(400).send(err.safe);
        } else if (err instanceof User.UserExceptions.UserSaveException && err.message === 'Missing Mandatory properties') {
            console.error("/add/establishment/:id POST: ", err.message);
            return res.status(400).send(err.safe);
        } else if (err instanceof User.UserExceptions.UserSaveException) {
            console.error("/add/establishment/:id POST: ", err.message);
            return res.status(503).send(err.safe);
        }

        console.error("Unexpected exception: ", err)
    }
});

module.exports = router;