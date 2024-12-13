const { isEmpty } = require('lodash');
const models = require('../../models/index');

const findUsername = async (req, res) => {
  try {
    if (requestIsInvalid(req)) {
      return res.status(400).send('Invalid request');
    }

    const { uid, securityQuestionAnswer } = req.body;
    const userFound = await models.user.getUsernameWithSecurityQuestionAnswer({ uid, securityQuestionAnswer });

    if (!userFound) {
      return sendFailedResponse(res);
    }

    return sendSuccessResponse(res, userFound);
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

const sendFailedResponse = (res) => {
  return res.status(401).json({ answerCorrect: false, remainingAttempts: 4 });
};

module.exports = { findUsername };
