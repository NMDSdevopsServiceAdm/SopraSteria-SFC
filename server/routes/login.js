 var express = require('express');
 const models = require('../models/index');
 const jwt = require('jsonwebtoken');
 const passport = require('passport');
var router = express.Router();
require('../config/passport')(passport);
const Login = require('../models').login;
// console.log("this is console user");
// //console.log(models.user.username);

router.post('/',async function(req, res) {
  console.log('inside login');
  await Login
      .findOne({
        where: {
          username: req.body.username
        }
        ,
        attributes: ['id', 'isActive', 'registrationId', 'firstLogin', 'Hash'],
        include: [ {
          model: models.user,
          attributes: ['fullname'],
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
          if(isMatch && !err) {
            var token = jwt.sign(JSON.parse(JSON.stringify(login)), 'nodeauthsecret', {expiresIn: 86400 * 30});
            jwt.verify(token, 'nodeauthsecret', function(err, data){
              console.log(err, data);
            })
             // successfully logged in
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
      
          const headers = {
            'Authorization': login.user.establishment.id
          };
          res.set(headers);

            res.json({success: true, token: 'JWT ' + token});
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
