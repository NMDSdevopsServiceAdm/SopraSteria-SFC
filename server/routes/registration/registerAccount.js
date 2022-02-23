const isEmpty = require('lodash').isEmpty;
const sns = require('../../aws/sns');
const slack = require('../../utils/slack/slack-logger');

const models = require('../../models');
const isPasswordValid = require('../../utils/security/passwordValidation').isPasswordValid;
const isUsernameValid = require('../../utils/security/usernameValidation').isUsernameValid;
const EstablishmentModel = require('../../models/classes/establishment').Establishment;
const EstablishmentSaveException =
  require('../../models/classes/establishment/establishmentExceptions').EstablishmentSaveException;
const User = require('../../models/classes/user').User;
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
    if (!req.body.establishment.isRegulated) {
      delete req.body.establishment.locationId;
    }

    const establishmentData = {
      ...req.body.establishment,
      ustatus: 'PENDING',
      expiresSoonAlertDate: '90',
      mainServiceId: null,
    };

    const userData = {
      ...req.body.user,
      canManageWdfClaims: req.body.user.canManageWdfClaims || false,
      isActive: false,
      status: 'PENDING',
      role: 'Edit',
      isPrimary: true,
      registrationSurveyCompleted: false,
      email: req.body.user.email.toLowerCase(),
      username: req.body.user.username.toLowerCase(),
    };

    // there are multiple steps to regiastering a new user/establishment. They must be done in entirety (all or nothing).
    // 1. looking the main service; to get ID
    // 2. Create Establishment record, to get Establishment ID
    // 3. Create User record (using Establishment ID) to get Registration ID
    // 4. Create Login record (using Registration ID)
    try {
      establishmentData.mainServiceId = await getMainServiceId(establishmentData);

      // now create establishment - using the extended property encapsulation
      defaultError = responseErrors.establishment;
      await models.sequelize.transaction(async (t) => {
        const newEstablishment = new EstablishmentModel(userData.username);
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
          await newEstablishment.save(userData.username, false, t);
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
        const newUser = new User(establishmentData.id);
        await newUser.load(userData);
        if (newUser.isValid) {
          await newUser.save(userData.username, 0, t);
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
          primaryUser: userData.username,
          nmdsId: establishmentData.nmdsId ? establishmentData.nmdsId : 'undefined',
          active: userData.isActive,
          userstatus: userData.status,
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

const getMainServiceId = async (establishmentData) => {
  const mainService = await models.services.getMainServiceByName(
    establishmentData.mainService,
    establishmentData.isRegulated,
  );

  if (!mainService || mainServiceOtherNameIsTooLong(mainService, establishmentData)) {
    throw new RegistrationException(
      'Unexpected main service',
      responseErrors.unexpectedMainService.errCode,
      responseErrors.unexpectedMainService.errMessage,
    );
  }

  return mainService.id;
};

const mainServiceOtherNameIsTooLong = (mainService, establishmentData) =>
  mainService.other &&
  establishmentData.mainServiceOther &&
  establishmentData.mainServiceOther.length > OTHER_MAX_LENGTH;
