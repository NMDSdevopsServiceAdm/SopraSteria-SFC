 var express = require('express');
 const models = require('../models/index');
 const jwt = require('jsonwebtoken');
 const passport = require('passport');
 var router = express.Router();
 require('../utils/security/passport')(passport);
const Login = require('../models').login;

const generateJWT = require('../utils/security/generateJWT');
const uuid = require('uuid');

router.post('/',async function(req, res) {
   Login
      .findOne({
        where: {
          username: req.body.username,
          isActive:true
        }
        ,
        attributes: ['id', 'username', 'isActive', 'invalidAttempt', 'registrationId', 'firstLogin', 'Hash'],
        include: [ {
          model: models.user,
          attributes: ['id', 'fullname', 'email', 'isAdmin','establishmentId'],
          include: [{
            model: models.establishment,
            attributes: ['id', 'name', 'isRegulated', 'nmdsId'],
            include: [{
              model: models.services,
              as: 'mainService',
              attributes: ['id', 'name']
            }]
          }]
        }]
      
      })
      .then((login) => {
        if (!login) {
          return res.status(401).send({
            message: 'Authentication failed.',
          });
        }

        login.comparePassword(req.body.password, async (err, isMatch) => {
          if (isMatch && !err) {
            const token = generateJWT.loginJWT(12, login.user.establishmentId, req.body.username, login.user.isAdmin);
            var date = new Date().getTime();
            date += (12 * 60 * 60 * 1000);          
   
            const response = formatSuccessulLoginResponse(
              login.user.fullname,
              login.firstLogin,
              login.user.establishment,
              login.user.establishment.mainService,
              new Date(date).toISOString()
            );

            await models.sequelize.transaction(async t => {
              // check if this is the first time logged in and if so, update the "FirstLogin" timestamp
              // reset the number of failed attempts on any successful login
              const loginUpdate = {
                invalidAttempt: 0
              };
              if (!login.firstLogin) {
                loginUpdate.firstLogin = new Date();
              }
              login.update(loginUpdate);

              // add an audit record
              const auditEvent = {
                userFk: login.user.id,
                username: login.username,
                type: 'loginSuccess',
                property: 'password',
                event: {}
              };
              await models.userAudit.create(auditEvent);
            });

            return res.set({'Authorization': 'Bearer ' + token}).status(200).json(response);

          } else {
            await models.sequelize.transaction(async t => {
              const maxNumberOfFailedAttempts = 10;

              // increment the number of failed attempts by one
              const loginUpdate = {
                invalidAttempt: login.invalidAttempt + 1
              };
              login.update(loginUpdate);

              if (login.invalidAttempt === (maxNumberOfFailedAttempts+1)) {
                // send reset password email
                const expiresTTLms = 60*24*1000; // 24 hours

                const requestUuid = uuid.v4();
                const now = new Date();
                const expiresIn = new Date(now.getTime() + expiresTTLms);
          
                await models.passwordTracking.create({
                  userFk: login.user.id,
                  created: now.toISOString(),
                  expires: expiresIn.toISOString(),
                  uuid: requestUuid
                });
          
                const resetLink = `${req.protocol}://${req.get('host')}/api/registration/validateResetPassword?reset=${requestUuid}`;
                console.log("WA TODO - send the email link by email: ", resetLink);

                // TODO - send the email! - https://trello.com/c/ONiKc7Ck
          
              }

              // add an audit record
              const auditEvent = {
                userFk: login.user.id,
                username: login.username,
                type: login.invalidAttempt >= (maxNumberOfFailedAttempts+1) ? 'loginWhileLocked' : 'loginFailed',
                property: 'password',
                event: {}
              };
              await models.userAudit.create(auditEvent);
            });

            res.status(401).send({success: false, msg: 'Authentication failed.'});
          }
        })
      })
      .catch((error) => {
        console.error(error);
        return res.status(400).send(error);
      });
});

// TODO: enforce JSON schema
const formatSuccessulLoginResponse = (fullname, firstLoginDate, establishment, mainService, expiryDate) => {
  // note - the mainService can be null
  return {
    fullname,
    isFirstLogin: firstLoginDate ? false : true,
    establishment: {
      id: establishment.id,
      name: establishment.name,
      isRegulated: establishment.isRegulated,
      nmdsId: establishment.nmdsId
    },
    mainService: {
      id: mainService ? mainService.id : null,
      name: mainService ? mainService.name : null
    },
    expiryDate: expiryDate
  };
};
module.exports = router;
