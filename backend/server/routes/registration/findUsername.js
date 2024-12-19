const { isEmpty, unescape } = require('lodash');
const models = require('../../models/index');
const { MaxFindUsernameAttempts, UserAccountStatus } = require('../../data/constants');

const findUsername = async (req, res) => {
  try {
    if (requestIsInvalid(req)) {
      return res.status(400).send('Invalid request');
    }

    const { uid, securityQuestionAnswer } = req.body;
    const user = await models.user.findByUUID(uid);
    const loginAccount = await user?.getLogin();

    if (!user || !loginAccount) {
      return res.status(404).send('User not found');
    }

    if (loginAccount.status === UserAccountStatus.Locked) {
      return sendFailedResponse(res, 0);
    }

    const answerIsCorrect = securityQuestionAnswer === user.SecurityQuestionAnswerValue;

    if (!answerIsCorrect) {
      const remainingAttempts = await handleWrongAnswer(loginAccount);
      return sendFailedResponse(res, remainingAttempts);
    }

    return sendSuccessResponse(res, unescape(loginAccount.username));
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

const handleWrongAnswer = async (loginAccount) => {
  const previousAttempts = loginAccount.invalidFindUsernameAttempts ?? 0;
  const currentCount = previousAttempts + 1;
  const remainingAttempts = Math.max(MaxFindUsernameAttempts - currentCount, 0);

  await models.sequelize.transaction(async (transaction) => {
    if (remainingAttempts === 0) {
      console.log('POST findUsername - failed: Number of wrong answer for security question reached limit.');
      console.log('Will lock the user account with RegistrationID:', loginAccount.registrationId);
      await loginAccount.lockAccount(transaction);
    }
    await loginAccount.recordInvalidFindUsernameAttempts(transaction);
  });

  return remainingAttempts;
};

const sendSuccessResponse = (res, username) => {
  return res.status(200).json({
    answerCorrect: true,
    username,
  });
};

const sendFailedResponse = (res, remainingAttempts) => {
  return res.status(401).json({ answerCorrect: false, remainingAttempts });
};

module.exports = { findUsername };
