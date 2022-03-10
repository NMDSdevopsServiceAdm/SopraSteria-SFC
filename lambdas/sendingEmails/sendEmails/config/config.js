const convict = require('convict');

const config = convict({
  sendInBlue: {
    apiKey: 'Send in Blue API Key',
    format: String,
    default: '',
    sensitive: true,
    env: 'SEND_IN_BLUE_KEY',
  },
});

module.exports = config;
