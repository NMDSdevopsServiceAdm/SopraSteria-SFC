const SibApiV3Sdk = require('sib-api-v3-sdk');
const config = require('../../config/config');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = config.get('sendInBlue.apiKey');
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKey.apiKeyPrefix['api-key'] = "Token"

// getAccount(): Get your account information, plan and credits details
// const api = new SibApiV3Sdk.AccountApi()
// api.getAccount().then(function(data) {
//   console.log('API called successfully. Returned data: ' + data);
// }, function(error) {
//   console.error(error);
// });


const sendEmail = async (to, templateId, params) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [to];
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = params;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

exports.sendEmail = sendEmail;
