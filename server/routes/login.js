 var express = require('express');
 const models = require('../models/index');
 const jwt = require('jsonwebtoken');
 const passport = require('passport');
 var router = express.Router();
 require('../utils/security/passport')(passport);
const Login = require('../models').login;

Token_Secret = process.env.Token_Secret ? process.env.Token_Secret : "nodeauthsecret";

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
            attributes: ['id', 'name', 'isRegulated'],
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
            message: 'Authentication failed. User not found.',
          });
        }
    login.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch && !err) {

        var claims = {
          EstblishmentId: login.user.establishmentId,
          Username: req.body.username,
          isAdmin: login.user.isAdmin
        }
        console.log(claims);

        var token = jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: 43200 * 1});        

 
            const response = formatSuccessulLoginResponse(
              login.user.fullname,
              login.firstLogin,
              login.user.establishment,
              login.user.establishment.mainService
            );

            // check if this is the first time logged in and if so, update the "FirstLogin" timestamp
            if (!login.firstLogin) {
                login.update({
                firstLogin: new Date()
              });
            }

          token = 'Bearer ' + token;

          const headers = {
            'Authorization': token
          };
          res.set(headers);

          
          res.json({success: true, token: token});
          } else {
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        })
      })
      .catch((error) => res.status(400).send(error));
});

// TODO: enforce JSON schema
const formatSuccessulLoginResponse = (fullname, firstLoginDate, establishment, mainService) => {
  // note - the mainService can be null
  return {
    fullname,
    isFirstLogin: firstLoginDate ? false : true,
    establishment: {
      id: establishment.id,
      name: establishment.name,
      isRegulated: establishment.isRegulated
    },
    mainService: {
      id: mainService ? mainService.id : null,
      name: mainService ? mainService.name : null
    }
  };
};
module.exports = router;
