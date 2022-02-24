const isEmpty = require('lodash').isEmpty;
const sns = require('../../aws/sns');
const slack = require('../../utils/slack/slack-logger');

const models = require('../../models');
const isPasswordValid = require('../../utils/security/passwordValidation').isPasswordValid;
const isUsernameValid = require('../../utils/security/usernameValidation').isUsernameValid;
const EstablishmentSaveException =
  require('../../models/classes/establishment/establishmentExceptions').EstablishmentSaveException;

const UserSaveException = require('../../models/classes/user/userExceptions').UserSaveException;
const { responseErrors, RegistrationException } = require('./responseErrors');
const { createEstablishment } = require('./createEstablishment');
const { createUser } = require('./createUser');

exports.registerAccount = async (req, res) => {
  try {
    let defaultError = responseErrors.default;

    const invalidRequestResponse = validateRequest(req);
    if (invalidRequestResponse) {
      return res.status(400).json(invalidRequestResponse);
    }

    await models.sequelize.transaction(async (transaction) => {
      try {
        defaultError = responseErrors.establishment;
        const establishmentInfo = await createEstablishment(
          req.body.establishment,
          req.body.user.username,
          transaction,
        );

        defaultError = responseErrors.user;
        const userInfo = await createUser(req.body.user, establishmentInfo.id, transaction);

        // post via Slack, but remove sensitive data
        const slackMsg = req.body;
        delete slackMsg.user.password;
        delete slackMsg.user.securityQuestion;
        delete slackMsg.user.securityQuestionAnswer;
        slackMsg.nmdsId = establishmentInfo.nmdsId;
        slackMsg.establishmentUid = establishmentInfo.uid;
        slack.info('Registration', JSON.stringify(slackMsg, null, 2));
        // post through feedback topic - async method but don't wait for a responseThe
        sns.postToRegistrations(slackMsg);
        // gets here on success
        req.sqreen.signup_track({
          userId: userInfo.uid,
          establishmentId: establishmentInfo.uid,
        });

        res.status(200);
        res.json({
          status: 1,
          message: 'Establishment and primary user successfully created',
          establishmentId: establishmentInfo.id,
          establishmentUid: establishmentInfo.uid,
          primaryUser: userInfo.username,
          nmdsId: establishmentInfo.nmdsId ? establishmentInfo.nmdsId : 'undefined',
          active: userInfo.isActive,
          userstatus: userInfo.status,
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
    });
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
