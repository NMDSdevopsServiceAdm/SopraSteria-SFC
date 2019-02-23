// default route for user endpoint
const express = require('express');
const router = express.Router();

const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated');
const passwordCheck = require('../../utils/security/passwordValidation').isPasswordValid;

const bcrypt = require('bcrypt-nodejs');

// default route
router.route('/').get(async (req, res) => {
    res.status(200).send();
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


module.exports = router;