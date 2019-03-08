const uuid = require('uuid');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyClient = new NotifyClient(process.env.NOTIFY_KEY);

const PASSWORD_RESET_TEMPLATE = '9e7c58e4-ce49-46e1-89d2-057cdcb4f8f9';
const REPLY_TO_ID='44e98371-2e44-4c6b-ad76-235136be0f8a';

//const EMAIL_ADDRESS = 'warren.ayling@ext.soprasteria.com;peter.woodford@soprasteria.com;maria.fairbank-azcarate@soprasteria.com;ann.shepherd1@soprasteria.com;victoria.garnett@skillsforcare.org.uk;david.griffiths@skillsforcare.org.uk';
const EMAIL_ADDRESS = [
    { email: 'warren.ayling@ext.soprasteria.com', name: 'Warren'},
    { email: 'peter.woodford@soprasteria.com', name: 'Peter'},
    { email: 'maria.fairbank-azcarate@soprasteria.com', name: 'Maria'},
    { email: 'ann.shepherd1@soprasteria.com', name: 'Ann'},
    { email: 'victoria.garnett@skillsforcare.org.uk', name: 'Victoria'},
    { email: 'david.griffiths@skillsforcare.org.uk', name: 'Dave'}
];

EMAIL_ADDRESS.forEach(thisEmailAddress => {
    const RESET_UUID = uuid.v4();
    notifyClient
    .sendEmail(
      PASSWORD_RESET_TEMPLATE,
      thisEmailAddress.email,
      {
          personalisation: {
              name: thisEmailAddress.name,
              resetUuid: RESET_UUID
          },
          reference: 'password-reset-' + uuid.v4(),
          emailReplyToId: REPLY_TO_ID
      }
    )
    .then(response => {
      console.log('SUCCESS: ', thisEmailAddress.name);
    })
    .catch(err => {
      console.error('ERROR: ', thisEmailAddress.name);
    });
});
