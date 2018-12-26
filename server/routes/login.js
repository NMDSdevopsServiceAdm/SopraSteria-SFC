 var express = require('express');
 const models = require('../models/index');
 const jwt = require('jsonwebtoken');
 const passport = require('passport');
var router = express.Router();
require('../config/passport')(passport);
const Login = require('../models').login;
// console.log("this is console user");
// //console.log(models.user.username);

router.post('/', function(req, res) {
  console.log('inside login');
  Login
      .find({
        where: {
          username: req.body.username
        }
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
            res.json({success: true, token: 'JWT ' + token});
          } else {
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        })
      })
      .catch((error) => res.status(400).send(error));
});

module.exports = router;
