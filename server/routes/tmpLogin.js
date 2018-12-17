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
        attributes: ['id', 'isActive', 'registrationId', 'firstLogin'],
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
      });

      if (results && results.registrationId !== 'undefined' && results.registrationId > 0 &&
          results.user && results.user.establishment) {

        //console.log('WA DEBUG: main service: ', results.user.establishment.mainService)

        // successfully logged in
        const response = formatSuccessulLoginResponse(
          results.user.fullname,
          results.firstLogin,
          results.user.establishment,
          results.user.establishment.mainService
        );

        // this faus login sets the Authorization header to be the establishment iD
        const headers = {
          'Authorization': results.user.establishment.id
        };

        // check if this is the first time logged in and if so, update the "FirstLogin" timestamp
        if (!results.firstLogin) {
          await results.update({
            firstLogin: new Date()
          });
        }

        res.set(headers);
        res.status(200);
        return res.json(response);
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
