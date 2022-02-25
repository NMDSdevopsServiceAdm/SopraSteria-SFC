const isEmpty = require('lodash').isEmpty;

const models = require('../../models');
const isPasswordValid = require('../../utils/security/passwordValidation').isPasswordValid;
const isUsernameValid = require('../../utils/security/usernameValidation').isUsernameValid;
const EstablishmentSaveException =
  require('../../models/classes/establishment/establishmentExceptions').EstablishmentSaveException;

const UserSaveException = require('../../models/classes/user/userExceptions').UserSaveException;
const { responseErrors, RegistrationException } = require('./responseErrors');
const establishment = require('./createEstablishment');
const user = require('./createUser');
const { postRegistrationToSlack } = require('./slack');

const registerAccount = async (req, res) => {
  await models.sequelize.transaction(async (transaction) => {
    return await registerAccountWithTransaction(req, res, transaction);
  });
};

const registerAccountWithTransaction = async (req, res, transaction) => {
  try {
    let defaultError = responseErrors.default;

    validateRequest(req);

    try {
      defaultError = responseErrors.establishment;

      const establishmentInfo = await establishment.createEstablishment(
        req.body.establishment,
        req.body.user.username,
        transaction,
      );

      defaultError = responseErrors.user;
      const userInfo = await user.createUser(req.body.user, establishmentInfo.id, transaction);

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
      if (!defaultError) defaultError = responseErrors.default;

      if (
        err instanceof EstablishmentSaveException ||
        err instanceof UserSaveException ||
        err instanceof RegistrationException
      ) {
        return res.status(400).json({
          message: err.message,
        });
      }

      throw new RegistrationException(defaultError.errMessage);
    }
  } catch (err) {
    // failed to fully register a new user/establishment - full rollback
    console.error('Registration: rolling back all changes because: ', err.errCode, err.errMessage);

    if (err instanceof RegistrationException) {
      return res.status(400).json({
        message: err.message,
      });
    }

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
  if (isEmpty(req.body)) throw new RegistrationException(responseErrors.emptyRequest.errMessage);
  if (!req.body.user || isEmpty(req.body.user)) throw new RegistrationException(responseErrors.invalidUser.errMessage);
  if (!isPasswordValid(req.body.user.password))
    throw new RegistrationException(responseErrors.invalidPassword.errMessage);
  if (!isUsernameValid(req.body.user.username))
    throw new RegistrationException(responseErrors.invalidUsername.errMessage);
};

module.exports = {
  registerAccount,
  registerAccountWithTransaction,
};
