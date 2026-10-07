const convict = require('convict');

const config = convict({
  sendInBlue: {
    apiKey: 'Send in Blue API Key',
    format: String,
    default: '',
    sensitive: true,
    env: 'SEND_IN_BLUE_KEY',
  },
  redis: {
    url: {
      doc: 'The URI to redirect users to the Redis',
      format: String,
      default: 'redis://localhost:6379',
      env: 'REDIS_ENDPOINT',
    },
  },
});

module.exports = config;
