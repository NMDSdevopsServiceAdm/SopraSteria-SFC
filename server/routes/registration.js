var express = require('express');
var router = express.Router();
var concatenateAddress = require('../utils/concatenateAddress').concatenateAddress;
const bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
const slack = require('../utils/slack/slack-logger');

const models = require('../models');

class RegistrationException {
  constructor(originalError, errCode, errMessage) {
    this.err = originalError;
    this.errCode = errCode;
    this.errMessage = errMessage;
  };

  toString() {
    return `${this.errCode}: ${this.errMessage}`;
  };
};


// Check if service exists
router.get('/service/:name', async (req, res) => {
  const requestedServiceName = req.params.name;
  try {
    const results = await models.services.findOne({
      where: {
        name: requestedServiceName
      }
    });

    if (results && results.id && (requestedServiceName === results.name)) {
      return res.status(200).json({
        status: '1',
        message: `Service name '${requestedServiceName}' found`,
      });
    } else {
      return res.status(200).json({
        status: '0',
        message: `Service name '${requestedServiceName}' not found`,
      });
    }
  
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET service/:name - failed', err);
    return res.status(503).send(`Unable to retrive service by name: ${requestedServiceName}`);
  }
});

router.get('/username', (req, res) => {
  // this is a false trap for empty username lookup requests from the UI
  return res.status(200).json({
    status: '0',
    message: 'Username not found',
  });
});
router.get('/username/:username', async (req, res) => {
  const requestedUsername = req.params.username;
  try {
    const results = await models.login.findOne({
      where: {
        username: requestedUsername
      }
    });

    if (results && results.id && (requestedUsername === results.username)) {
      return res.status(200).json({
        status: '1',
        message: `Username '${requestedUsername}' found`,
      });
    } else {
      return res.status(200).json({
        status: '0',
        message: `Username '${requestedUsername}' not found`,
      });
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET username/:username - failed', err);
    return res.json({
      status: '0',
      message: `Username '${requestedUsername}' not found`,
    });
  }
});

router.get('/estbname/:name', async (req, res) => {
  const requestedEstablishmentName = req.params.name;
  try {
    const results = await models.establishment.findOne({
      where: {
        name: requestedEstablishmentName
      }
    });

    if (results && results.id && (requestedEstablishmentName === results.name)) {
      return res.status(200).json({
        status: '1',
        message: `Establishment by name '${requestedEstablishmentName}' found`,
      });
    } else {
      return res.status(200).json({
        status: '0',
        message: `Establishment by name '${requestedEstablishmentName}' not found`,
      });
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET estbname/:name - failed', err);
    return res.json({
      status: '0',
      message: `Establishment by name '${requestedEstablishmentName}' not found`,
    });
  }
});

router.get('/estb/:name/:locationid', async (req, res) => {
  const requestedEstablishmentName = req.params.name;
  const requestedEstablishmentLocationId = req.params.locationid;
  try {
    const results = await models.establishment.findOne({
      where: {
        name: requestedEstablishmentName,
        locationId: requestedEstablishmentLocationId
      }
    });

    if (results && results.id && (requestedEstablishmentName === results.name)) {
      return res.status(200).json({
        status: '1',
        message: `Establishment by name '${requestedEstablishmentName}' and by location id '${requestedEstablishmentLocationId}' found`,
      });
    } else {
      return res.status(200).json({
        status: '0',
        message: `Establishment by name '${requestedEstablishmentName}' and by location id '${requestedEstablishmentLocationId}' not found`,
      });
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET /estb/:name&:locationid - failed', err);
    return res.json({
      status: '0',
      message: `Establishment by name '${requestedEstablishmentName}' and by location id '${requestedEstablishmentLocationId}' not found`,
    });
  }
});

const responseErrors = {
  default: {
    errCode: -1,
    errMessage: 'Registration Error'
  },
  eastablishment: {
    errCode: -2,
    errMessage: 'Registration: Failed to create Establishment'
  },
  user: {
    errCode: -3,
    errMessage: 'Registration: Failed to create User'
  },
  login: {
    errCode: -4,
    errMessage: 'Registration: Failed to create Login'
  },
  duplicateNonCQC: {
    errCode: -100,
    errMessage: 'Duplicate non-CQC Establishment',
    db_constraint: 'Establishment_unique_registration'
  },
  duplicateCQC: {
    errCode: -150,
    errMessage: 'Duplicate CQC Establishment',
    db_constraint: 'Establishment_unique_registration_with_locationid'
  },
  duplicateUsername: {
    errCode: -200,
    errMessage: 'Duplicate Username',
    db_constraint: 'uc_Login_Username'
  },
  unexpectedMainServiceId: {
    errCode: -300,
    errMessage: 'Unexpected main service id'
  },
  unknownLocation: {
    errCode: -400,
    errMessage: 'Unknown location',
    db_constraint: 'uc_Login_Username'
  },
};

router.route('/')
  .get((req, res) => {
    res.json({
      status: 'API id Working',
      message: 'Registration API',
    });
  })

  .post(async (req, res) => {
    //basic validation
    if(JSON.stringify(req.body) == '{}') {
			return res.status(404).json({
				"success" : 0,
				"message" : "Parameters missing"
			});
    }

    // TODO: JSON Schema validation


    let defaultError = responseErrors.default;
    try {
      // location ID is only relevant for CQC sites - namely isRegulated is true
      if (!req.body[0].isRegulated) {
        delete req.body[0].locationId;
      }

      // extract establishment, user and login data from given input
      const Estblistmentdata = {
        Name : req.body[0].locationName,
        Address : concatenateAddress(req.body[0].addressLine1, req.body[0].addressLine2, req.body[0].townCity, req.body[0].county),
        LocationID: req.body[0].locationId,
        PostCode: req.body[0].postalCode,
        MainService: req.body[0].mainService,
        MainServiceId : null,
        IsRegulated: req.body[0].isRegulated
      };
      const Userdata = {
        FullName : req.body[0].user.fullname,
        JobTitle : req.body[0].user.jobTitle,
        Email    : req.body[0].user.emailAddress,
        Phone    : req.body[0].user.contactNumber,
        DateCreated: new Date(),
        EstablishmentID:0,
        AdminUser: true
      };
      var Logindata = {
        RegistrationId:0,
        UserName: req.body[0].user.username,
        Password: req.body[0].user.password,
        SecurityQuestion: req.body[0].user.securityQuestion,
        SecurityQuestionAnswer: req.body[0].user.securityAnswer,
        Active:true,
        InvalidAttempt:0
      };


      // there are multiple steps to regiastering a new user/establishment. They must be done in entirety (all or nothing).
      // 1. looking the main service; to get ID
      // 2. Create Establishment record, to get Establishment ID
      // 3. Create User record (using Establishment ID) to get Registration ID
      // 4. Create Login record (using Registration ID)
      try {
        // if any part fails, it all fails. So wrap into a single transaction; commit on success and rollback on failure.
        await models.sequelize.transaction(async t => {
          // first - validate given main service id, for which the main service id is dependent on whether the site is CQC regulated or not
          let serviceResults = null;
          if (Estblistmentdata.IsRegulated) {
            // if a regulated (CQC) site, then can use any of the services as long as they are a main service
            serviceResults = await models.services.findOne({
              where: {
                name: Estblistmentdata.MainService,
                isMain: true
              }
            });
          } else {
            // a non-CQC site can only use non-CQC services
            serviceResults = await models.services.findOne({
              where: {
                name: Estblistmentdata.MainService,
                iscqcregistered: false,
                isMain: true
              }
            });
          }

          if (serviceResults && serviceResults.id && (Estblistmentdata.MainService === serviceResults.name)) {
            Estblistmentdata.MainServiceId = serviceResults.id
          } else {
            throw new RegistrationException(
              `Lookup on services for '${Estblistmentdata.MainService}' being cqc registered (${Estblistmentdata.IsRegulated}) resulted with zero records`,
              responseErrors.unexpectedMainServiceId.errCode,
              responseErrors.unexpectedMainServiceId.errMessage
            );
          }

          // now create establishment
          defaultError = responseErrors.establishment;
          const establishmentCreation = await models.establishment.create({
            name: Estblistmentdata.Name,
            address: Estblistmentdata.Address,
            locationId: Estblistmentdata.LocationID,
            postcode: Estblistmentdata.PostCode,
            mainServiceId: Estblistmentdata.MainServiceId,
            isRegulated: Estblistmentdata.IsRegulated,
            shareData: false,
            shareWithCQC: false,
            shareWithLA: false,
          });
          const sanitisedEstablishmentResults = establishmentCreation.get({plain: true});
          Estblistmentdata.id = sanitisedEstablishmentResults.EstablishmentID;


          // now create user
          defaultError = responseErrors.user;
          const userCreation = await models.user.create({
            establishmentId: Estblistmentdata.id,
            fullname: Userdata.FullName,
            jobTitle: Userdata.JobTitle,
            email: Userdata.Email,
            phone: Userdata.Phone,
            created: Userdata.DateCreated,
            isAdmin: true,
          });
          const sanitisedUserResults = userCreation.get({plain: true});
          Userdata.registrationID = sanitisedUserResults.RegistrationID;

          // now create login
          defaultError = responseErrors.login;
          const passwordHash = await bcrypt.hashSync(Logindata.Password, bcrypt.genSaltSync(10), null);
          const loginCreation = await models.login.create({
            registrationId: Userdata.registrationID,
            username: Logindata.UserName,
            Hash: passwordHash,
            securityQuestion: Logindata.SecurityQuestion,
            securityAnswer: Logindata.SecurityQuestionAnswer,
            isActive: true,
            invalidAttempt: 0,
          });
          const sanitisedLoginResults = loginCreation.get({plain: true});
          Logindata.id = sanitisedLoginResults.ID;

          // gets here on success
          res.status(200);
          res.json({
            "status" : 1,
            "message" : "Establishment and primary user successfully created",
            "establishmentId" : Estblistmentdata.id,
            "primaryUser" : Logindata.UserName
          }); 
        });

      } catch (err) {
        // if we've already found a specific registration error, re-throw the error
        if (err instanceof RegistrationException) throw err;

        if (!defaultError) defaultError = responseErrors.default;

        if (err.name && err.name === 'SequelizeUniqueConstraintError') {
          // we can expect one of three unique constraint failures which will override the default error
          if (err.parent.constraint && err.parent.constraint === 'Establishment_unique_registration_with_locationid') {
            defaultError = responseErrors.duplicateCQC;
          } else if (err.parent.constraint && err.parent.constraint === 'Establishment_unique_registration') {
            defaultError = responseErrors.duplicateNonCQC;
          } else if (err.parent.constraint && err.parent.constraint === 'uc_Login_Username') {
            defaultError = responseErrors.duplicateUsername;
          }
        }

        // TODO: trap for location foreign key failure
        if (err.name && err.name === 'SequelizeForeignKeyConstraintError') {
          if (err.parent.constraint && err.parent.constraint === 'estloc_fk') {
            defaultError = responseErrors.unknownLocation;
          }
        }
        
        throw new RegistrationException(
          err,
          defaultError.errCode,
          defaultError.errMessage
        );
      }

    } catch (err) {
        // failed to fully register a new user/establishment - full rollback
        console.error("Registration: rolling back all changes because: ", err.errCode, err.errMessage);
        if (err.errCode > -99) {
          console.error("Registration: original error: ", err.err);
        }

        if (err.errCode > -99) {
          // we have an unexpected error
          res.status(500);
        } else {
          // we have an expected error owing to given client data
          res.status(400);
        }

      // post via Slack, but remove sensitive data
      const slackMsg = req.body[0];
      delete slackMsg.user.password;
      delete slackMsg.user.securityQuestion;
      delete slackMsg.user.securityAnswer;
      slack.info("Registration", JSON.stringify(slackMsg, null, 2));

        res.json({
          "status" : err.errCode,
          "message" : err.errMessage
        });
    }
  });  // ends router.route('/').post

module.exports = router;
