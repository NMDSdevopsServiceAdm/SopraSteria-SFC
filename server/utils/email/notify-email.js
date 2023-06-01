const config = require('../../config/config');
const { v4: uuidv4 } = require('uuid');
uuidv4();

const GovNotifyClient = require('notifications-node-client').NotifyClient;

const REPLY_TO_ID = config.get('notify.replyTo');

exports.sendPasswordReset = async (emailAddress, name, resetUuid) => {
  if (
    config.get('notify.key') === 'unknown' ||
    config.get('notify.replyTo') === '80d54020-c420-46f1-866d-b8cc3196809d' ||
    config.get('notify.templates.resetPassword') === '80d54020-c420-46f1-866d-b8cc3196809d'
  ) {
    // gov.uk notify is not configured
    console.log('INFO - sendPasswordReset - gov.uk notify is not configured');
    return;
  }

  try {
    const notifyClient = new GovNotifyClient(config.get('notify.key'));
    await notifyClient.sendEmail(config.get('notify.templates.resetPassword'), emailAddress, {
      personalisation: {
        name,
        resetUuid,
      },
      reference: config.get('env') + '-password-reset-' + uuidv4(),
      emailReplyToId: REPLY_TO_ID,
    });

    console.log('sendPasswordReset - Successfully sent (requested) email');
  } catch (err) {
    console.error('sendPasswordReset - FAILED to send (request) email');
  }
};

exports.sendAddUser = async (emailAddress, name, addUserUuid) => {
  if (
    config.get('notify.key') === 'unknown' ||
    config.get('notify.replyTo') === '80d54020-c420-46f1-866d-b8cc3196809d' ||
    config.get('notify.templates.addUser') === '80d54020-c420-46f1-866d-b8cc3196809d'
  ) {
    // gov.uk notify is not configured
    console.log('INFO - sendAddUser - gov.uk notify is not configured');
    return;
  }

  try {
    const notifyClient = new GovNotifyClient(config.get('notify.key'));
    await notifyClient.sendEmail(config.get('notify.templates.addUser'), emailAddress, {
      personalisation: {
        name,
        addUserUuid,
      },
      reference: config.get('env') + '-add-user-' + uuidv4(),
      emailReplyToId: REPLY_TO_ID,
    });

    console.log('sendAddUser - Successfully sent (requested) email');
  } catch (err) {
    console.error('sendAddUser - FAILED to send (requested) email to');
  }
};
