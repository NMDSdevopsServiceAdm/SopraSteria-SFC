// const sendInBlueEmail = require('../../../utils/email/sendInBlueEmail');
const isWhitelisted = require('../isWhitelisted');
const sendToSQSQueue = require('../../../utils/email/sendToSQSQueue');

const getParams = (user) => {
  return {
    FULL_NAME: user.FullNameValue,
    WORKPLACE_ID: user.establishment.nmdsId,
  };
};

const sendEmail = async (user, templateId) => {
  if (!isWhitelisted.isWhitelisted(user.get('email'))) {
    return;
  }

  const params = getParams(user);
  // Change this call to add to the sqs queue
  sendToSQSQueue.sendToSQSQueue(
    {
      email: user.get('email'),
      name: user.FullNameValue,
    },
    templateId,
    params,
  );
  // sendInBlueEmail.sendEmail(
  //   {
  //     email: user.get('email'),
  //     name: user.FullNameValue,
  //   },
  //   templateId,
  //   params,
  // );
};

module.exports = {
  sendEmail,
  getParams,
};
