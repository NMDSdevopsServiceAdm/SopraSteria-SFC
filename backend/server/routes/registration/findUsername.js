const { isEmpty } = require('lodash');
const models = require('../../models/index');

const findUsername = async (req, res) => {
  try {
    if (requestIsInvalid(req)) {
      return res.status(400).send('Invalid request');
    }

    const { uid, securityQuestionAnswer } = req.body;
    const findUserResult = await models.user.getUsernameWithSecurityQuestionAnswer({ uid, securityQuestionAnswer });

    if (!findUserResult || !findUserResult.username) {
      return sendFailedResponse(res, findUserResult);
    }

    return sendSuccessResponse(res, findUserResult);
  } catch (err) {
    console.error('registration POST findUsername - failed', err);
    return res.status(500).send('Internal server error');
  }
};

const requestIsInvalid = (req) => {
  if (!req.body) {
    return true;
  }
  const { securityQuestionAnswer, uid } = req.body;

  return [securityQuestionAnswer, uid].some((field) => isEmpty(field));
};

const sendSuccessResponse = (res, userFound) => {
  const { username } = userFound;
  return res.status(200).json({
    answerCorrect: true,
    username,
  });
};

const sendFailedResponse = (res, findUserResult) => {
  const remainingAttempts = findUserResult?.remainingAttempts ?? 0;
  return res.status(401).json({ answerCorrect: false, remainingAttempts });
};

module.exports = { findUsername };
