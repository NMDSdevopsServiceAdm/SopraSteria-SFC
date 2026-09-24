const SibApiV3Sdk = require('sib-api-v3-sdk');
const config = require('./config/config');
const redisStore = require('./storeSendEmailResult');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = config.get('sendInBlue');

const sendEmail = async (to, templateId, params) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [to];
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = params;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

exports.lambdaHandler = async (event, _context) => {
  let { to, templateId, params } = {};
  try {
    const message = event.Records[0].body;
    ({ to, templateId, params } = JSON.parse(message));
    await sendEmail(to, templateId, params);

    await redisStore.storeSendEmailResult({
      result: 'successful',
      templateId,
      to,
      messageId: event.Records[0]?.messageId,
    });

    return {
      statusCode: 200,
      body: 'Call Successful',
    };
  } catch (err) {
    console.error(err);

    await redisStore.storeSendEmailResult({
      result: 'failed',
      templateId,
      to,
      messageId: event?.Records?.[0]?.messageId,
    });

    return err;
  }
};
