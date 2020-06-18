const { createLogger, format, transports } = require('winston');
const config = require('../config/config');;

const datadogFormat = format((info, opts) => {
  info.ddtags = `env:${config.get('env')}`

  return info;
});

const httpTransportOptions = {
  host: `http-intake.logs.${config.get('datadog.site')}`,
  path: `/v1/input/${config.get('datadog.api_key')}?ddsource=nodejs&service=sfc`,
  ssl: true
};

const logger = createLogger({
  level: 'info',
  exitOnError: false,
  transports: [
    new transports.Console({
      format: format.simple()
    }),
  ],
});

if (config.get('datadog.api_key')) {
  console.log(httpTransportOptions)
  logger.add(new transports.Http(httpTransportOptions, {
    format: format.combine(
      format.errors({ stack: true }),
      format.timestamp(),
      datadogFormat(),
      format.json()
    ),
  }));
}

module.exports = logger;

console.log = function(){
  return logger.info.apply(logger, arguments)
}
console.error = function(){
  return logger.error.apply(logger, arguments)
}
console.info = function(){
  return logger.warn.apply(logger, arguments)
}
