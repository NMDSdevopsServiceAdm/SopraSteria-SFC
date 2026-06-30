const models = require('../../models');
const cacheUserLogoutTime = require('../cacheUserLogoutTime');

const validateTokenIssueTimeAgainstPasswordChange = async function (req, res, next) {
  const tokenIssuedTime = req.tokenIssuedAt;
  const passwordLastChangedTime = await models.login.getPasswordLastChangedTime(req?.username);

  if (!passwordLastChangedTime) {
    next();
  }

  const passwordLastChangeInEpochSecond = new Date(passwordLastChangedTime).getTime() / 1000;
  const tokenIssuedBeforePasswordChange = tokenIssuedTime < passwordLastChangeInEpochSecond;

  if (tokenIssuedBeforePasswordChange) {
    return res.status(403).send('Invalid Token');
  }
  next();
};

const validateTokenIssueTimeAgainstLastLogout = async function (req, res, next) {
  const tokenIssuedTime = req.tokenIssuedAt;
  const userLastLogoutTime = await cacheUserLogoutTime.getUserLastLogoutTime(req.username);
  if (!userLastLogoutTime) {
    next();
    return;
  }

  const tokenIssuedBeforeLogout = tokenIssuedTime < userLastLogoutTime;

  if (tokenIssuedBeforeLogout) {
    return res.status(403).send('Invalid Token');
  }
  next();
};

module.exports = { validateTokenIssueTimeAgainstPasswordChange, validateTokenIssueTimeAgainstLastLogout };
