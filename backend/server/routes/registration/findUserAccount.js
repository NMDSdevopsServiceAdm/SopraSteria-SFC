const { isEmpty } = require('lodash');
const { sanitisePostcode } = require('../../utils/postcodeSanitizer');
const models = require('../../models/index');

const findUserAccount = async (req, res) => {
  try {
    if (requestIsInvalid(req)) {
      return res.status(400).send('Invalid request');
    }

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

    return sendNotFoundResponse(res);
  } catch (err) {
    console.error('registration POST findUserAccount - failed', err);
    return res.status(500).send('Internal server error');
  }
};

const requestIsInvalid = (req) => {
  if (!req.body) {
    return true;
  }
  const { name, workplaceIdOrPostcode, email } = req.body;

  return [name, workplaceIdOrPostcode, email].some((field) => isEmpty(field));
};

const sendSuccessResponse = (res, userFound) => {
  const { uid, SecurityQuestionValue } = userFound;
  return res.status(200).json({
    accountFound: true,
    accountUid: uid,
    securityQuestion: SecurityQuestionValue,
  });
};

const sendNotFoundResponse = (res) => {
  return res.status(200).json({ accountFound: false, remainingAttempts: 4 });
};

module.exports = { findUserAccount };
