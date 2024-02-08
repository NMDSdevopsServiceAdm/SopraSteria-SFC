const isWhitelisted = require('../isWhitelisted');
const sendToSQSQueue = require('../../../utils/email/sendToSQSQueue');

const getParams = (user) => {
  return {
    FULL_NAME: user.FullNameValue,
    WORKPLACE_ID: user.establishment.nmdsId,
  };
};

const sendEmail = async (user, templateId, index) => {
  if (!isWhitelisted.isWhitelisted(user.get('email'))) {
    return;
  }

  const params = getParams(user);

  sendToSQSQueue.sendToSQSQueue(
    {
      email: user.get('email'),
      name: user.FullNameValue,
    },
    templateId,
    params,
    index,
  );
};

module.exports = {
  sendEmail,
  getParams,
};
