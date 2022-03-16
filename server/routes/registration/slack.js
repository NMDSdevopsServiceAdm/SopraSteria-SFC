const omit = require('lodash').omit;
const sns = require('../../aws/sns');
const slack = require('../../utils/slack/slack-logger');

const removeSensitiveData = (userData) => {
  return omit(userData, ['password', 'securityQuestion', 'securityQuestionAnswer']);
};

const postRegistrationToSlack = (req, establishmentInfo) => {
  const slackMessage = {
    ...req.body.establishment,
    nmdsId: establishmentInfo.nmdsId,
    establishmentUid: establishmentInfo.uid,
    user: removeSensitiveData(req.body.user),
  };

  slack.info('Registration', JSON.stringify(slackMessage, null, 2));
  sns.postToRegistrations(slackMessage);
};

module.exports = {
  removeSensitiveData,
  postRegistrationToSlack,
};
