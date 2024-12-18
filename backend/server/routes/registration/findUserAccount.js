const { isEmpty } = require('lodash');
const { sanitisePostcode } = require('../../utils/postcodeSanitizer');
const limitFindUserAccountUtils = require('../../utils/limitFindUserAccountUtils');
const HttpError = require('../../utils/errors/httpError');
const models = require('../../models/index');

const MaxAttempts = 5;
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

    if (userFound) {
      return sendSuccessResponse(res, userFound);
    }

    const failedAttemptsCount = await limitFindUserAccountUtils.recordFailedAttempt(req.ip);
    const remainingAttempts = MaxAttempts - failedAttemptsCount;

    return sendNotFoundResponse(res, remainingAttempts);
  } catch (err) {
    if (err instanceof FindUserAccountException) {
      return res.status(err.statusCode).send(err.message);
    }
    console.error('registration POST findUserAccount - failed', err);
    return res.status(500).send('Internal server error');
  }
};

const validateRequest = async (req) => {
  if (requestBodyIsInvalid(req)) {
    throw new FindUserAccountException('Invalid request', 400);
  }

  if (await ipAddressReachedMaxAttempt(req)) {
    throw new FindUserAccountException('Reached maximum retry', 423);
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
  return attemptsSoFar >= MaxAttempts;
};

const sendSuccessResponse = (res, userFound) => {
  const { uid, SecurityQuestionValue } = userFound;
  return res.status(200).json({
    accountFound: true,
    accountUid: uid,
    securityQuestion: SecurityQuestionValue,
  });
};

const sendNotFoundResponse = (res, remainingAttempts = 0) => {
  return res.status(200).json({ accountFound: false, remainingAttempts });
};

module.exports = { findUserAccount };
