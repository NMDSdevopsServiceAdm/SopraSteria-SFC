const SibApiV3Sdk = require('sib-api-v3-sdk');
const AppConfig = require('../../config/appConfig');
const config = require('../../config/config');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];

if (AppConfig.ready) {
  apiKey.apiKey = config.get('sendInBlue.apiKey');
}

AppConfig.on(AppConfig.READY_EVENT, () => {
  apiKey.apiKey = config.get('sendInBlue.apiKey');
});

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

const getTemplates = async (options) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    return await apiInstance.getSmtpTemplates(options);
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

exports.sendEmail = sendEmail;
exports.getTemplates = getTemplates;
