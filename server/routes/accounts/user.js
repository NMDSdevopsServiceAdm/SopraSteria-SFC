// default route for user endpoint
const express = require('express');
const router = express.Router();

const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated').isAuthorisedPasswdReset;
const passwordCheck = require('../../utils/security/passwordValidation').isPasswordValid;

const bcrypt = require('bcrypt-nodejs');

// default route
router.route('/').get(async (req, res) => {
    res.status(200).send();
});


// resets a user's password - must have Authoization header and must be a valid password reset JWT
router.use('/resetPassword', Authorization);
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
                    attributes: ['id'],
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
                });

                // and crfeate an audit event
                const auditEvent = {
                    userFk: loginResponse.user.id,
                    username: req.username,
                    type: 'passwdReset',
                    property: 'password',
                    event: {}
                };
                await models.userAudit.create(auditEvent);

                // mark the given reset as completed
                await models.passwordTracking.update(
                    {
                        completed: new Date()
                    },
                    {
                        where: {
                        uuid: req.resetUuid
                    }
                });            
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

module.exports = router;