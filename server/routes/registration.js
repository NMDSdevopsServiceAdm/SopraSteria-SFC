var express = require('express');
var router = express.Router();
var concatenateAddress = require('../utils/concatenateAddress').concatenateAddress;
const uuid = require('uuid');
const isLocal = require('../utils/security/isLocalTest').isLocal;
var bcrypt = require('bcrypt-nodejs');
const slack = require('../utils/slack/slack-logger');

const models = require('../models');

const generateJWT = require('../utils/security/generateJWT');

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

router.get('/usernameOrEmail/:usernameOrEmail', async (req, res) => {
  const requestedUsernameOrEmail = req.params.usernameOrEmail;

  try {
    // username is on Login table, but email is on User table. Could join, but it's just as east to fetch each individual
    const loginResults = await models.login.findOne({
      where: {
          username: requestedUsernameOrEmail
      }
    });
    const userResults = await models.user.findOne({
      where: {
          email: requestedUsernameOrEmail
      }
    });

    if ((loginResults && loginResults.id && (requestedUsernameOrEmail === loginResults.username)) ||
        (userResults && userResults.id && (requestedUsernameOrEmail === userResults.email))) {
      return res.status(200).send();
    } else {
      return res.status(404).send();
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET u/usernameOrEmail/:usernameOrEmail - failed', err);
    return res.status(503).send();
  }
});

router.get('/usernameOrEmail/:usernameOrEmail', async (req, res) => {
  const requestedUsernameOrEmail = req.params.usernameOrEmail;

  try {
    // username is on Login table, but email is on User table. Could join, but it's just as east to fetch each individual
    const loginResults = await models.login.findOne({
      where: {
          username: requestedUsernameOrEmail
      }
    });
    const userResults = await models.user.findOne({
      where: {
          email: requestedUsernameOrEmail
      }
    });

    if ((loginResults && loginResults.id && (requestedUsernameOrEmail === loginResults.username)) ||
        (userResults && userResults.id && (requestedUsernameOrEmail === userResults.email))) {
      return res.status(200).send();
    } else {
      return res.status(404).send();
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET u/usernameOrEmail/:usernameOrEmail - failed', err);
    return res.status(503).send();
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
  unknownNMDSsequence: {
    errCode: -500,
    errMessage: 'Unknown NMDS Sequence'
  },
  unknownNMDSLetter: {
    errCode: -600,
    errMessage: 'Unknown NMDS Letter/CSSR Region'
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

          // need to create an NMDS ID - which is a combination of the CSSR nmds letter and a unique sequence number
          // first find the associated CSSR NMDS letter using the postcode given for this establishment. Note - there
          //  might not be an associated pcodedata record
          const cssrResults = await models.pcodedata.findOne({
            where: {
              postcode: Estblistmentdata.PostCode,
            },
            include: [{
              model: models.cssr,
              as: 'theAuthority',
              attributes: ['id', 'name', 'nmdsIdLetter']
            }]
          });

          let nmdsLetter = null;
          if (cssrResults && cssrResults.postcode === Estblistmentdata.PostCode &&
              cssrResults.theAuthority && cssrResults.theAuthority.id &&
              Number.isInteger(cssrResults.theAuthority.id)) {
            nmdsLetter = cssrResults.theAuthority.nmdsIdLetter;
          } else {
            // if, there is no direct match on pcodedata using the Establishment's postcode, then a more fuzzy match is done
            //  using just the first half of the postcode
            const [firstHalfOfPostcode] = Estblistmentdata.PostCode.split(' '); 
            
            // must escape the string to prevent SQL injection
            const fuzzyCssrNmdsIdMatch = await models.sequelize.query(
                `select "Cssr"."NmdsIDLetter" from cqcref.pcodedata, cqc."Cssr" where postcode like \'${escape(firstHalfOfPostcode)}%\' and pcodedata.local_custodian_code = "Cssr"."LocalCustodianCode" group by "Cssr"."NmdsIDLetter" limit 1`,
                {
                  type: models.sequelize.QueryTypes.SELECT
                }
              );
            if (fuzzyCssrNmdsIdMatch && fuzzyCssrNmdsIdMatch[0] && fuzzyCssrNmdsIdMatch[0] && fuzzyCssrNmdsIdMatch[0].NmdsIDLetter) {
              nmdsLetter = fuzzyCssrNmdsIdMatch[0].NmdsIDLetter;
            }
          }

          let nextNmdsIdSeqNumber = 0;
          const nextNmdsIdSeqNumberResults = await models.sequelize.query(
              'SELECT nextval(\'cqc."NmdsID_seq"\')',
              {
                type: models.sequelize.QueryTypes.SELECT
              });
          if (nextNmdsIdSeqNumberResults && nextNmdsIdSeqNumberResults[0] && nextNmdsIdSeqNumberResults[0] && nextNmdsIdSeqNumberResults[0].nextval) {
            nextNmdsIdSeqNumber = parseInt(nextNmdsIdSeqNumberResults[0].nextval);
          } else {
            // no sequence number
            console.error("Failed to get next sequence number for Establishment: ", nextNmdsIdSeqNumberResults);
            throw new RegistrationException(
              'Failed to get next sequence number for Establishment',
              responseErrors.unknownNMDSsequence.errCode,
              responseErrors.unknownNMDSsequence.errMessage
            );
          }

          if (nmdsLetter) {
            Estblistmentdata.NmdsId = `${nmdsLetter}${nextNmdsIdSeqNumber}`;
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
            nmdsId: Estblistmentdata.NmdsId
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
          
          // post via Slack, but remove sensitive data
          const slackMsg = req.body[0];
          delete slackMsg.user.password;
          delete slackMsg.user.securityQuestion;
          delete slackMsg.user.securityAnswer;
          slackMsg.NmdsId = Estblistmentdata.NmdsId;
          slack.info("Registration", JSON.stringify(slackMsg, null, 2));

          // gets here on success
          res.status(200);
          res.json({
            "status" : 1,
            "message" : "Establishment and primary user successfully created",
            "establishmentId" : Estblistmentdata.id,
            "primaryUser" : Logindata.UserName.postcode,
            "nmdsId": Estblistmentdata.NmdsId ? Estblistmentdata.NmdsId : 'undefined'
          }); 
        });

      } catch (err) {
        console.error('Caught exception in registration: ', err);

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

        // catch when the nmdsId is undefined
        if (err.name && err.name === 'SequelizeValidationError' && err.errors[0].path === 'nmdsId') {
          defaultError = responseErrors.unknownNMDSLetter;
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
        res.json({
          "status" : err.errCode,
          "message" : err.errMessage
        });
    }
  });  // ends router.route('/').post



router.post('/requestPasswordReset', async (req, res) => {
  // parse input - escaped to prevent SQL injection
  if (!req.body.usernameOrEmail) {
    return res.status(400).send();
  }
  const givenEmailOrUsername = escape(req.body.usernameOrEmail);
  
  // for automated testing, allow the expiry to be overridden by a given TTL parameter (in seconds)
  //  only for localhost/dev
  const expiresTTLms = isLocal(req) && req.body.ttl ? parseInt(req.body.ttl)*1000 : 60*24*1000; // 24 hours

  try {
    // username is on Login table, but email is on User table. Could join, but it's just as east to fetch each individual
    const loginResults = await models.login.findOne({
      where: {
          username: givenEmailOrUsername
      },
      include: [
        {
          model: models.user,
          attributes: ['email', 'fullname', 'id'],
        }
      ]
    });
    const userResults = await models.user.findOne({
      where: {
          email: givenEmailOrUsername
      }
    });

    if ((loginResults && loginResults.id && (givenEmailOrUsername === loginResults.username)) ||
        (userResults && userResults.id && (givenEmailOrUsername === userResults.email))) {

      //console.log("WA DEBUG - have matched on login or user", loginResults.user)

      let sendToAddress = null, sendToName = null, userRegistrationId = null;
      if (userResults && userResults.email) {
        sendToAddress = userResults.email;
        sendToName = userResults.fullname;
        userRegistrationId = userResults.id;
      } else if (loginResults && loginResults.user && loginResults.user.email) {
        sendToAddress = loginResults.user.email;
        sendToName = loginResults.user.fullname;
        userRegistrationId = loginResults.user.id;
      }

      if (sendToAddress===null || sendToName===null || userRegistrationId===null) {
        throw new Error(`Unexpected error: failed to retrieve registration ID/name/email address (${givenEmailOrUsername}) on either user or login`);
      }

      const requestUuid = uuid.v4();
      const now = new Date();
      const expiresIn = new Date(now.getTime() + expiresTTLms);

      const requestTrackerResponse = await models.passwordTracking.create({
        userFk: userRegistrationId,
        created: now.toISOString(),
        expires: expiresIn.toISOString(),
        uuid: requestUuid
      });

      const resetLink = `${req.protocol}://${req.get('host')}/api/registration/validateResetPassword?reset=${requestUuid}`;

      // TODO: send email with link - https://trello.com/c/ONiKc7Ck

      if (isLocal(req)) {
        return res.status(200).json({resetLink, uuid:requestUuid});
      } else {
        return res.status(200).send();
      }
 
    } else {
      // non-disclosure - if account is not found, return 200 anyway - suggesting that an email has been found
      return res.status(200).send();
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration POST /requestPasswordReset - failed', err);
    return res.status(503).send();
  }
});

router.post('/validateResetPassword', async (req, res) => {
  if (!req.body.uuid) {
    console.error('No UUID');
    return res.status(400).send();
  }
  // parse input - escaped to prevent SQL injection
  const givenUuid = escape(req.body.uuid);
  const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

  if (!uuidV4Regex.test(givenUuid)) {
    console.error('Invalid UUID');
    return res.status(400).send();
  }
  
  try {
    // username is on Login table, but email is on User table. Could join, but it's just as east to fetch each individual
    const passTokenResults = await models.passwordTracking.findOne({
      where: {
        uuid: givenUuid
      }
    });

    if (passTokenResults && passTokenResults.id) {

      // now check if the token has expired or already been consumed
      const now = new Date().getTime();
      if (passTokenResults.expires.getTime() < now) {
        console.error(`registration POST /validateResetPassword - reset token (${givenUuid}) expired`);
        return res.status(403).send();
      }

      if (passTokenResults.completed) {
        console.error(`registration POST /validateResetPassword - reset token (${givenUuid}) has already been used`);
        return res.status(401).send();
      }

      // gets this far if the token is valid. Generate a JWT, which requires knowing the associated User/Login details.
      const userResults = await models.user.findOne({
        where: {
          id: passTokenResults.userFk
        },
        include: [
          {
            model: models.login,
            attributes: ['username'],
          }
        ]
      });

      if (userResults && userResults.id && userResults.id === passTokenResults.userFk) {
        // generate JWT and attach it to the header (Authorization)
        const JWTexpiryInMinutes = 15;
        const token = generateJWT.passwordResetJWT(JWTexpiryInMinutes, userResults.login.username, userResults.fullname , givenUuid);

        res.set({
          'Authorization': 'Bearer ' + token
        });

        // mark the given reset as completed
        await models.passwordTracking.update({
            completed: new Date()
          },
          {
            where: {
              uuid: givenUuid
          }
        });

        return res.status(200).json({
          username: userResults.login.username,
          fullname: userResults.fullname,
        });

      } else {
        throw new Error(`Failed to find user matching reset token (${givenUuid})`);
      }

      
 
    } else {
      // token not found
      console.error(`registration POST /validateResetPassword - reset token (${givenUuid}) not found`);
      return res.status(404).send();
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration POST /validateResetPassword - failed', err);
    return res.status(503).send();
  }
});


module.exports = router;
