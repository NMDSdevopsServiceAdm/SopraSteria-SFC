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
    validateRequest(req);

    const establishmentInfo = await establishment.createEstablishment(
      req.body.establishment,
      req.body.user.username,
      transaction,
    );

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
    console.error('Registration: rolling back all changes - ', err.message);

    if (
      err instanceof EstablishmentSaveException ||
      err instanceof UserSaveException ||
      err instanceof RegistrationException
    ) {
      return res.status(400).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: responseErrors.unexpectedProblem,
    });
  }
};

const validateRequest = (req) => {
  if (isEmpty(req.body)) throw new RegistrationException(responseErrors.emptyRequest);
  if (!req.body.user || isEmpty(req.body.user)) throw new RegistrationException(responseErrors.invalidUser);
  if (!isPasswordValid(req.body.user.password)) throw new RegistrationException(responseErrors.invalidPassword);
  if (!isUsernameValid(req.body.user.username)) throw new RegistrationException(responseErrors.invalidUsername);
};

module.exports = {
  registerAccount,
  registerAccountWithTransaction,
};
