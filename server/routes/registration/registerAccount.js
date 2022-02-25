const isEmpty = require('lodash').isEmpty;

const models = require('../../models');
const isPasswordValid = require('../../utils/security/passwordValidation').isPasswordValid;
const isUsernameValid = require('../../utils/security/usernameValidation').isUsernameValid;
const EstablishmentSaveException =
  require('../../models/classes/establishment/establishmentExceptions').EstablishmentSaveException;

const UserSaveException = require('../../models/classes/user/userExceptions').UserSaveException;
const { responseErrors, RegistrationException } = require('./responseErrors');
const establishment = require('./createEstablishment');
const { createUser } = require('./createUser');
const { postRegistrationToSlack } = require('./slack');

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
        const establishmentInfo = await establishment.createEstablishment(
          req.body.establishment,
          req.body.user.username,
          transaction,
        );

        defaultError = responseErrors.user;
        const userInfo = await createUser(req.body.user, establishmentInfo.id, transaction);

        postRegistrationToSlack(req, establishmentInfo);

        req.sqreen.signup_track({
          userId: userInfo.uid,
          establishmentId: establishmentInfo.uid,
        });

        res.status(200);
        res.json({
          status: 1,
          message: 'Establishment and primary user successfully created',
          userstatus: userInfo.status,
        });
      } catch (err) {
        if (err instanceof RegistrationException) throw err;

        if (!defaultError) defaultError = responseErrors.default;

        if (err instanceof EstablishmentSaveException) {
          return res.status(400).json({
            message: err.message,
          });
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
