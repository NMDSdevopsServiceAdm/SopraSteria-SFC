const { isEmpty } = require('lodash');
const { sanitisePostcode } = require('../../utils/postcodeSanitizer');
const limitFindUserAccountUtils = require('../../utils/limitFindUserAccountUtils');
const HttpError = require('../../utils/errors/httpError');
const models = require('../../models/index');
const { MaxFindUsernameAttempts } = require('../../data/constants');

class FindUserAccountException extends HttpError {}

const findUserAccount = async (req, res) => {
  try {
    await validateRequest(req);

    const { name, workplaceIdOrPostcode, email } = req.body;
    let userFound = null;

    const postcode = sanitisePostcode(workplaceIdOrPostcode);
    if (postcode) {
      userFound = await models.user.findByRelevantInfo({ name, postcode, email });
    }

    userFound =
      userFound ?? (await models.user.findByRelevantInfo({ name, workplaceId: workplaceIdOrPostcode, email }));

    if (!userFound) {
      const failedAttemptsCount = await limitFindUserAccountUtils.recordFailedAttempt(req.ip);
      const remainingAttempts = MaxFindUsernameAttempts - failedAttemptsCount;

      return sendNotFoundResponse(res, remainingAttempts);
    }

    if (userFound.multipleAccountsFound) {
      return sendMultipleAccountsFoundResponse(res);
    }

    if (userFound.accountLocked) {
      throw new FindUserAccountException('User account is locked', 423);
    }

    return sendSuccessResponse(res, userFound);
  } catch (err) {
    return sendErrorResponse(res, err);
  }
};

const validateRequest = async (req) => {
  if (requestBodyIsInvalid(req)) {
    throw new FindUserAccountException('Invalid request', 400);
  }

  if (await ipAddressReachedMaxAttempt(req)) {
    throw new FindUserAccountException('Reached maximum retry', 429);
  }
};

const requestBodyIsInvalid = (req) => {
  if (!req.body) {
    return true;
  }
  const { name, workplaceIdOrPostcode, email } = req.body;

  return [name, workplaceIdOrPostcode, email].some((field) => isEmpty(field));
};

const ipAddressReachedMaxAttempt = async (req) => {
  const attemptsSoFar = (await limitFindUserAccountUtils.getNumberOfFailedAttempts(req.ip)) ?? 0;
  return attemptsSoFar >= MaxFindUsernameAttempts;
};

const sendSuccessResponse = (res, userFound) => {
  const { uid, SecurityQuestionValue } = userFound;
  return res.status(200).json({
    status: 'AccountFound',
    accountUid: uid,
    securityQuestion: SecurityQuestionValue,
  });
};

const sendNotFoundResponse = (res, remainingAttempts = 0) => {
  return res.status(200).json({ status: 'AccountNotFound', remainingAttempts });
};

const sendMultipleAccountsFoundResponse = (res) => {
  return res.status(200).json({ status: 'MultipleAccountsFound' });
};

const sendErrorResponse = (res, err) => {
  console.error('registration POST findUserAccount - failed', err);

  if (err instanceof FindUserAccountException) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).send('Internal server error');
};

module.exports = { findUserAccount, FindUserAccountException };
