const { createLogger, format, transports } = require('winston');
const config = require('../config/config');

const logger = createLogger({
  level: 'info',
  exitOnError: false,
  transports: [
    new transports.Console({
      format: format.simple()
    })
  ]
});

const start = () => {
  if (config.get('datadog.api_key')) {
    logger.add(new transports.Http({
      host: `http-intake.logs.${config.get('datadog.site')}`,
      path: `/v1/input/${config.get('datadog.api_key')}?ddsource=nodejs&service=sfc&ddtags=env:${config.get('env')}`,
      ssl: true
    }, {
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json()
      )
    }));
  }
};

module.exports = logger;
module.exports.start = start;

console.log = function() {
  return logger.info.apply(logger, arguments);
};
console.error = function() {
  return logger.error.apply(logger, arguments);
};
console.info = function() {
  return logger.warn.apply(logger, arguments);
};
