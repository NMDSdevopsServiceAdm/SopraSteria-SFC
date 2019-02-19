 var express = require('express');
 const models = require('../models/index');
 const jwt = require('jsonwebtoken');
 const passport = require('passport');
 var router = express.Router();
 require('../utils/security/passport')(passport);
const Login = require('../models').login;

const generateJWT = require('../utils/security/generateJWT');

router.post('/',async function(req, res) {
   Login
      .findOne({
        where: {
          username: req.body.username,
          isActive:true
        }
        ,
        attributes: ['id', 'isActive', 'registrationId', 'firstLogin', 'Hash'],
        include: [ {
          model: models.user,
          attributes: ['fullname', 'isAdmin','establishmentId'],
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

        login.comparePassword(req.body.password, (err, isMatch) => {
          if (isMatch && !err) {
            console.log("WA DEBUG - inside login endpoint - user: ", login.user.isAdmin)
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

            // check if this is the first time logged in and if so, update the "FirstLogin" timestamp
            if (!login.firstLogin) {
                login.update({
                  firstLogin: new Date()
                });
            }

            return res.set({'Authorization': 'Bearer ' + token}).status(200).json(response);

          } else {
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
