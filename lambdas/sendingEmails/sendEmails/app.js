// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const SibApiV3Sdk = require('sib-api-v3-sdk');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */



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
}

exports.lambdaHandler = async (event, context) => {
  console.log(event.Records);
  const messages = JSON.parse(event.Records[0].body);
  try {
    // const ret = await axios(url);
    messages.forEach(async (message) => {
      const { to, templateId, params } = message;
      await sendEmail(to, templateId, params);
    });

    return {
      statusCode: 200,
      body: 'Call Successful',
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
