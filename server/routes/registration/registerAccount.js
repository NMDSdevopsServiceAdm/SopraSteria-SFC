const isEmpty = require('lodash').isEmpty;

const models = require('../../models');
const isPasswordValid = require('../../utils/security/passwordValidation').isPasswordValid;
const isUsernameValid = require('../../utils/security/usernameValidation').isUsernameValid;
const EstablishmentSaveException =
  require('../../models/classes/establishment/establishmentExceptions').EstablishmentSaveException;

const UserSaveException = require('../../models/classes/user/userExceptions').UserSaveException;
const { registrationErrors, RegistrationException } = require('./registrationErrors');
const establishment = require('./createEstablishment');
const user = require('./createUser');
const slack = require('./slack');

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

    slack.postRegistrationToSlack(req, establishmentInfo);
    setUpSqreenMonitoring(req, userInfo.uid, establishmentInfo.uid);

    return sendSuccessResponse(res, userInfo.status);
  } catch (err) {
    console.error('Registration: rolling back all changes - ', err.message);

    return sendErrorResponse(err, res);
  }
};

const validateRequest = (req) => {
  if (isEmpty(req.body)) throw new RegistrationException(registrationErrors.emptyRequest);
  if (!req.body.user || isEmpty(req.body.user)) throw new RegistrationException(registrationErrors.invalidUser);
  if (!isPasswordValid(req.body.user.password)) throw new RegistrationException(registrationErrors.invalidPassword);
  if (!isUsernameValid(req.body.user.username)) throw new RegistrationException(registrationErrors.invalidUsername);
};

const sendSuccessResponse = (res, userStatus) => {
  return res.status(200).json({
    message: 'Establishment and primary user successfully created',
    userStatus,
  });
};

const sendErrorResponse = (err, res) => {
  if (isExpectedError(err)) {
    return res.status(400).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: registrationErrors.unexpectedProblem,
  });
};

const setUpSqreenMonitoring = (req, userId, establishmentId) => {
  req.sqreen.signup_track({
    userId,
    establishmentId,
  });
};

const isExpectedError = (err) =>
  err instanceof EstablishmentSaveException || err instanceof UserSaveException || err instanceof RegistrationException;

module.exports = {
  registerAccount,
  registerAccountWithTransaction,
};
