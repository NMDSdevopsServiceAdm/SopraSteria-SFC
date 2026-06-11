const config = require('../../config/config');
const { v4: uuidv4 } = require('uuid');
const { getToday } = require('../dateUtils');

const GovNotifyClient = require('notifications-node-client').NotifyClient;

const DEFAULT_DUMMY_ID = '80d54020-c420-46f1-866d-b8cc3196809d';

const EmailTypes = {
  passwordReset: { type: 'passwordReset', templateIdKey: 'notify.templates.resetPassword', slug: 'password-reset' },
  addUser: { type: 'addUser', templateIdKey: 'notify.templates.addUser', slug: 'add-user' },
  updateUserDetails: {
    type: 'updateUserDetails',
    templateIdKey: 'notify.templates.updateUserDetails',
    slug: 'update-user-details',
  },
};

const loadConfigs = (emailType) => {
  if (!emailType) {
    console.error('INFO - sendEmailToUser - email type is missing');
    return false;
  }

  const templateId = config.get(emailType.templateIdKey);
  const apiKey = config.get('notify.key');
  const replyToId = config.get('notify.replyTo');
  const env = config.get('env');

  if (apiKey === 'unknown' || replyToId === DEFAULT_DUMMY_ID || templateId === DEFAULT_DUMMY_ID) {
    console.log(`INFO - ${emailType.type} - gov.uk notify is not configured`);
    return false;
  }

  return { templateId, apiKey, replyToId, env };
};

const sendEmailToUser = async (emailType, emailAddress, personalisation) => {
  const sendEmailConfig = loadConfigs(emailType);
  if (!sendEmailConfig) {
    return;
  }

  const { templateId, apiKey, replyToId, env } = sendEmailConfig;
  const reference = env + `-${emailType.slug}-` + uuidv4();

  try {
    const notifyClient = new GovNotifyClient(apiKey);
    await notifyClient.sendEmail(templateId, emailAddress, {
      personalisation,
      reference,
      emailReplyToId: replyToId,
    });

    console.log(`${emailType.type} - Successfully sent (requested) email`);
  } catch (err) {
    console.error(`${emailType.type} - FAILED to send (request) email:`, err);
    console.error('Error message from GovNotify API:', err?.response?.data?.errors);
  }
};

const sendPasswordReset = async (emailAddress, name, resetUuid) => {
  const personalisation = { name, resetUuid };
  return sendEmailToUser(EmailTypes.passwordReset, emailAddress, personalisation);
};

const sendAddUser = async (emailAddress, name, addUserUuid) => {
  const personalisation = { name, addUserUuid };
  return sendEmailToUser(EmailTypes.addUser, emailAddress, personalisation);
};

const sendUpdateUserDetails = async (emailAddress, name) => {
  const date = getToday('D MMMM YYYY');
  const personalisation = { name, date };
  return sendEmailToUser(EmailTypes.updateUserDetails, emailAddress, personalisation);
};

module.exports = { sendPasswordReset, sendAddUser, sendUpdateUserDetails };
