const isEmpty = require('lodash').isEmpty;
const sns = require('../../aws/sns');
const slack = require('../../utils/slack/slack-logger');

const models = require('../../models');
const isPasswordValid = require('../../utils/security/passwordValidation').isPasswordValid;
const isUsernameValid = require('../../utils/security/usernameValidation').isUsernameValid;
const EstablishmentModel = require('../../models/classes/establishment').Establishment;
const EstablishmentSaveException =
  require('../../models/classes/establishment/establishmentExceptions').EstablishmentSaveException;
const UserModel = require('../../models/classes/user').User;
const UserSaveException = require('../../models/classes/user/userExceptions').UserSaveException;
const { responseErrors, RegistrationException } = require('./responseErrors');

const OTHER_MAX_LENGTH = 120;

exports.registerAccount = async (req, res) => {
  const invalidRequestResponse = validateRequest(req);
  if (invalidRequestResponse) {
    return res.status(400).json(invalidRequestResponse);
  }

  let defaultError = responseErrors.default;
  try {
    // location ID is only relevant for CQC sites - namely isRegulated is true
    if (!req.body.isRegulated) {
      delete req.body.locationId;
    }

    // extract establishment, user and login data from given input
    const establishmentData = {
      ...req.body.establishment,
      ustatus: 'PENDING',
      expiresSoonAlertDate: '90',
      mainServiceId: null,
    };

    const userData = { ...req.body.user, canManageWdfClaims: req.body.user.canManageWdfClaims || false };

    var Logindata = {
      RegistrationId: 0,
      UserName: req.body.user.username,
      Password: req.body.user.password,
      // Active: CQCpostcode && CQClocationID,
      Active: false,
      InvalidAttempt: 0,
      Status: 'PENDING',
    };

    // there are multiple steps to regiastering a new user/establishment. They must be done in entirety (all or nothing).
    // 1. looking the main service; to get ID
    // 2. Create Establishment record, to get Establishment ID
    // 3. Create User record (using Establishment ID) to get Registration ID
    // 4. Create Login record (using Registration ID)
    try {
      // if any part fails, it all fails. So wrap into a single transaction; commit on success and rollback on failure.
      await models.sequelize.transaction(async (t) => {
        // first - validate given main service id, for which the main service id is dependent on whether the site is CQC regulated or not
        let serviceResults = null;
        if (establishmentData.isRegulated) {
          // if a regulated (CQC) site, then can use any of the services as long as they are a main service
          serviceResults = await models.services.findOne({
            where: {
              name: establishmentData.mainService,
              isMain: true,
            },
          });
        } else {
          // a non-CQC site can only use non-CQC services
          serviceResults = await models.services.findOne({
            where: {
              name: establishmentData.mainService,
              iscqcregistered: {
                [models.Sequelize.Op.or]: [false, null],
              },
              isMain: true,
            },
          });
        }

        if (serviceResults && serviceResults.id && establishmentData.mainService === serviceResults.name) {
          establishmentData.mainServiceId = serviceResults.id;
        } else {
          throw new RegistrationException(
            `Lookup on services for '${establishmentData.mainService}' being cqc registered (${establishmentData.isRegulated}) resulted with zero records`,
            responseErrors.unexpectedMainService.errCode,
            responseErrors.unexpectedMainService.errMessage,
          );
        }

        if (
          serviceResults.other &&
          establishmentData.mainServiceOther &&
          establishmentData.mainServiceOther.length > OTHER_MAX_LENGTH
        ) {
          throw new RegistrationException(
            `Other field value of '${establishmentData.mainServiceOther}' greater than length ${OTHER_MAX_LENGTH}`,
            responseErrors.unexpectedMainService.errCode,
            responseErrors.unexpectedMainService.errMessage,
          );
        }

        // now create establishment - using the extended property encapsulation
        defaultError = responseErrors.establishment;
        const newEstablishment = new EstablishmentModel(Logindata.UserName);
        newEstablishment.initialise(
          establishmentData.addressLine1,
          establishmentData.addressLine2,
          establishmentData.addressLine3,
          establishmentData.townCity,
          establishmentData.county,
          establishmentData.locationId,
          null, // PROV ID is not captured yet on registration
          establishmentData.postalCode,
          establishmentData.isRegulated,
        );
        await newEstablishment.load({
          name: establishmentData.locationName,
          mainService: {
            id: establishmentData.mainServiceId,
            other: establishmentData.mainServiceOther,
          },
          ustatus: establishmentData.ustatus,
          expiresSoonAlertDate: establishmentData.expiresSoonAlertDate,
          numberOfStaff: establishmentData.numberOfStaff,
        }); // no Establishment properties on registration
        if (newEstablishment.hasMandatoryProperties && newEstablishment.isValid) {
          await newEstablishment.save(Logindata.UserName, false, t);
          establishmentData.id = newEstablishment.id;
          establishmentData.eUID = newEstablishment.uid;
          establishmentData.nmdsId = newEstablishment.nmdsId;
        } else {
          // Establishment properties not valid
          throw new RegistrationException(
            'Inavlid establishment properties',
            responseErrors.invalidEstablishment.errCode,
            responseErrors.invalidEstablishment.errMessage,
          );
        }

        // now create user
        defaultError = responseErrors.user;
        const newUser = new UserModel(establishmentData.id);
        await newUser.load({
          role: 'Edit',
          isPrimary: true,
          isActive: Logindata.Active,
          status: Logindata.Status,
          registrationSurveyCompleted: false,
          canManageWdfClaims: userData.canManageWdfClaims,

          fullname: userData.fullname,
          jobTitle: userData.jobTitle,
          email: userData.email.toLowerCase(),
          phone: userData.phone,
          securityQuestion: userData.securityQuestion,
          securityQuestionAnswer: userData.securityQuestionAnswer,
          username: Logindata.UserName.toLowerCase(),
          password: Logindata.Password,
        });
        if (newUser.isValid) {
          await newUser.save(Logindata.UserName, 0, t);
          userData.registrationID = newUser.id;
        } else {
          // Establishment properties not valid
          throw new RegistrationException(
            'Inavlid user/login properties',
            responseErrors.invalidUser.errCode,
            responseErrors.invalidUser.errMessage,
          );
        }

        // post via Slack, but remove sensitive data
        const slackMsg = req.body;
        delete slackMsg.user.password;
        delete slackMsg.user.securityQuestion;
        delete slackMsg.user.securityQuestionAnswer;
        slackMsg.nmdsId = establishmentData.nmdsId;
        slackMsg.establishmentUid = establishmentData.eUID;
        slack.info('Registration', JSON.stringify(slackMsg, null, 2));
        // post through feedback topic - async method but don't wait for a responseThe
        sns.postToRegistrations(slackMsg);
        // gets here on success
        req.sqreen.signup_track({
          userId: newUser.uid,
          establishmentId: establishmentData.eUID,
        });

        res.status(200);
        res.json({
          status: 1,
          message: 'Establishment and primary user successfully created',
          establishmentId: establishmentData.id,
          establishmentUid: establishmentData.eUID,
          primaryUser: Logindata.UserName,
          nmdsId: establishmentData.nmdsId ? establishmentData.nmdsId : 'undefined',
          active: Logindata.Active,
          userstatus: Logindata.Status,
        });
      });
    } catch (err) {
      //console.error('Caught exception in registration: ', err);

      // if we've already found a specific registration error, re-throw the error
      if (err instanceof RegistrationException) throw err;

      if (!defaultError) defaultError = responseErrors.default;

      if (err instanceof EstablishmentSaveException) {
        if (err.message === 'Duplicate Establishment') {
          defaultError = responseErrors.duplicateEstablishment;
        } else if (err.message === 'Unknown Location') {
          defaultError = responseErrors.unknownLocation;
        } else if (err.message === 'Unknown NMDSID') {
          defaultError = responseErrors.unknownNMDSLetter;
        }
      }

      if (err instanceof UserSaveException) {
        if (err.message === 'Duplicate Username') {
          defaultError = responseErrors.duplicateUsername;
        }
      }

      throw new RegistrationException(err, defaultError.errCode, defaultError.errMessage);
    }
  } catch (err) {
    // failed to fully register a new user/establishment - full rollback
    console.error('Registration: rolling back all changes because: ', err.errCode, err.errMessage);
    if (err.errCode > -99) {
      console.error('Registration: original error: ', err.err);
    }

    if (err.errCode > -99) {
      // we have an unexpected error
      res.status(500);
    } else {
      // we have an expected error owing to given client data
      res.status(400);
    }
    res.json({
      status: err.errCode,
      message: err.errMessage,
    });
  }
};

const validateRequest = (req) => {
  if (isEmpty(req.body)) return responseErrors.emptyRequest;
  if (!req.body.user || isEmpty(req.body.user)) return responseErrors.invalidUser;
  if (!isPasswordValid(req.body.user.password)) return responseErrors.invalidPassword;
  if (!isUsernameValid(req.body.user.username)) return responseErrors.invalidUsername;
};
