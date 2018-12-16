var express = require('express');
var router = express.Router();
const models = require('../models/index');

// TODO: JSON schema validation enforcement; for now, they simple have to be defined and not empty (and username only because we're not interested in password in tmpLogin)
const validateLoginParameters = (username, password) => {
  return username && typeof username === 'string' && username.length > 0;
};

// GET Location API by locationId
router.route('/').post(async (req, res) => {
  if (validateLoginParameters(req.body.username, req.body.password)) {
    const username = req.body.username;

    try {
      // user must exist and must be active
      let results = await models.login.findOne({
        where: {
          username,
          isActive: true
        },
        attributes: ['id', 'isActive', 'registrationId'],
        include: [ {
          model: models.user,
          attributes: ['fullname', 'establishmentId']
        }]
      });

      if (results && results.registrationId !== 'undefined' && results.registrationId > 0) {
        const registrationId = results.registrationId;

        // found user
        console.log('WA DEBUG: found user with registration ID and full name: ', registrationId, ' ', results.user.fullname);

        res.status(200);
        return res.json({
          "success" : 1,
          "message" : "Successful login so there"
        });

      } else {
        // TODO - improve logging/error reporting
        console.error('tmpLogin::post - user not found');
        res.status(401).send('Authentication failed');
      }      
  
    } catch (err) {
      // TODO - improve logging/error reporting
      console.error('tmpLogin::post - exception: ', err);
      res.status(503).send('Unable to authenticate user');
    }

  } else {
    // TODO - improve logging/error reporting
    console.error('tmpLogin::post - failed validation');
    res.status(400).send('Expect username/password as JSON');
  }

});

module.exports = router;
