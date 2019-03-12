const convict = require('convict');
const fs = require('fs');
const yaml = require('js-yaml');

// Define schema
const config = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'test', 'localhost'],
    default: 'localhost',
    env: 'NODE_ENV'
  },
  version: {
    doc: 'The API version',
    format: String,
    default: '0.0.0'
  },
  log: {
    level: {
      doc: 'Not yet used, but will be the default log level',
      format: String,
      default: 'NONE'
    }
  },
  listen: {
    port: {
      doc: 'Server binding port',
      format: 'port',
      default: 3000,
      env: 'PORT'
    },
    ip: {
      doc: 'Server binding IP',
      format: "ipaddress",
      default: "127.0.0.1",
      env: 'HOST',
    }
  },
  db: {
    host: {
      doc: 'Database host name/IP',
      format: String,
      default: 'localhost',
      env: 'DB_HOST'
    },
    database: {
      doc: 'Database name',
      format: String,
      default: 'sfcdevdb',
      env: 'DB_NAME'
    },
    username: {
        doc: 'Database username',
        format: String,
        default: 'sfcadmin',
        env: 'DB_USER'
    },
    password: {
        doc: 'Database username',
        format: '*',
        default: 'unknown',           // note - bug in notify - must provide a default value for it to use env var
        env: 'DB_PASS'
    },
    port: {
        doc: 'Database port',
        format: 'port',
        default: 5432,
        env: 'DB_PORT'
    },
    dialect: {
      doc: 'Database dialect (sequelize)',
      format: String,
      default: 'postgres'
    },
    ssl: {
      doc: 'Use SSL?',
      format: 'Boolean',
      default: false,
      env: 'DB_SSL'
    },
    pool: {
      doc: 'Number of connections in the pool',
      format: 'int',
      default: 5
    }
  },
  notify: {
      key: {
          doc: 'The gov.uk notify key',
          format: '*',
          default: 'unknown',           // note - bug in notify - must provide a default value for it to use env var
          env: "NOTIFY_KEY"
      },
      replyTo: {
        doc: 'The id to use for reply-to',
        format: function check(val) {
          const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
          if (!uuidRegex.test(val.toUpperCase())) throw new TypeError('gov.uk notify reply-to id should be a V4 UUID');
        },
        default: '80d54020-c420-46f1-866d-b8cc3196809d'
      },
      templates: {
        resetPassword: {
          doc: 'The template id for sending reset password emails',
          format: function check(val) {
            const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
            if (!uuidRegex.test(val.toUpperCase())) throw new TypeError('gov.uk notify reset password template id should be a V4 UUID');
          },
          default: '80d54020-c420-46f1-866d-b8cc3196809d'
        },
        addUser: {
          doc: 'The template id for sending user registration emails',
          format: function check(val) {
            const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
            if (!uuidRegex.test(val.toUpperCase())) throw new TypeError('gov.uk notify add user template id should be a V4 UUID');
          },
          default: '80d54020-c420-46f1-866d-b8cc3196809d'
        }
      }
  },
  jwt: {
      iss: {
          doc: 'The JWT issuer',
          format: 'url',
          env: 'TOKEN_ISS',
          default: 'http://localhost:3000'
      },
      secret: {
        doc: 'The JWT signing secret',
        format: '*',
        env: 'Token_Secret'
      },
      aud: {
        login: {
          doc: 'The logged in JWT audience',
          format: String,
          default: 'ADS-WDS'
        },
        passwordReset: {
          doc: 'The password reset JWT audience',
          format: String,
          default: 'ADS-WDS-password-reset'
        }
      }
  },
  slack: {
      url: {
          doc: 'The slack notification endpoint',
          format: 'url',
          default: 'unknown',           // note - bug in notify - must provide a default value for it to use env var
          env: 'SLACK_URL'
      },
      level: {
          doc: 'The level of notifications to be sent to Slack: 0 - disabled, 1-error, 2-warning, 3-info, 5 - trace',
          format: function check(val) {
              if (![0, 1, 2, 3, 5].includes(val)) throw new TypeError('Slack level must be one of 0, 1, 2, 3 or 5');
          },
          env: 'SLACK_LEVEL',
          default: 0
      }
  }
});

// Load environment dependent configuration
var env = config.get('env');

const envConfigfile = yaml.safeLoad(fs.readFileSync(__dirname + '/' + env + '.yaml'));
const commonConfigfile = yaml.safeLoad(fs.readFileSync(__dirname + '/common.yaml'));

// load common file first, then env (so env overrides common)
config.load(commonConfigfile);
config.load(envConfigfile);

// Perform validation
config.validate(
    {allowed: 'strict'}
);
module.exports = config;