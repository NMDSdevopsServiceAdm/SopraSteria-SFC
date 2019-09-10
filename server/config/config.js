
const convict = require('convict');
const fs = require('fs');
const yaml = require('js-yaml');

// AWS Secrets Manager override
const AWSSecrets = require('../aws/secrets');

const AppConfig = require('./appConfig');

// Define schema
const config = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'preproduction', 'development', 'test', 'accessibility', 'localhost'],
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
    },
    sequelize: {
      doc: 'Whether to log sequelize SQL statements',
      format: 'Boolean',
      default: false
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
    client_ssl: {
      status: {
        doc: 'Client SSL enabled or not',
        format: 'Boolean',
        default: false,
        env: "DB_CLIENT_SSL_STATUS"
      },
      usingFiles: {
        doc: 'If true, retrieves client certificate, client key and root certificate from file; if false, using data values',
        format: 'Boolean',
        default: true,
      },
      files: {
        certificate: {
          doc: 'The full path location of the client certificate file',
          format: String,
          default: 'TBC',
          env: "DB_CLIENT_SSL_CERTIFICATE"
        },
        key: {
          doc: 'The full path location of the client key file',
          format: String,
          default: 'TBC',
          env: "DB_CLIENT_SSL_KEY"
        },
        ca: {
          doc: 'The full path location of the server certificate (authority - ca) file',
          format: String,
          default: 'TBC',
          env: "DB_CLIENT_SSL_CA"
        }
      },
      data: {
        certificate: {
          doc: 'The client certificate',
          format: String,
          default: 'TBC',
        },
        key: {
          doc: 'The client key',
          format: String,
          default: 'TBC',
        },
        ca: {
          doc: 'The server certificate (authority - ca)',
          format: String,
          default: 'TBC',
        }
      }
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
        default: 'nodeauthsecret',
        env: 'TOKEN_SECRET'
      },
      ttl: {
        default : {
          doc: 'The (default) Time To Live (in minutes) for token (timeout)',
          format: 'int',
          default: 5
        },
        login: {
          doc: 'The Time To Live (in minutes) for login token',
          format: 'int',
          default: 5,
          env: 'LOGIN_JWT_TTL'
        }
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
        },
        addUser: {
          doc: 'The add user JWT audience',
          format: String,
          default: 'ADS-WDS-add-user'
        },
        internalAdminApp: {
          doc: 'The JWT audience for the Internal Admin application',
          format: String,
          default: 'ADS-WDS-Internal-Admin-App'
        },
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
  },
  aws: {
    region: {
      doc: 'AWS region',
      format: '*',
      default: 'eu-west-2',
    },
    secrets: {
      use: {
        doc: 'Whether to use AWS Secret Manager to retrieve sensitive information, e.g. DB_PASS. If false, expect to read from environment variables.',
        format: 'Boolean',
        default: false
      },
      wallet: {
        doc: 'The name of the AWS Secrets Manager wallet to recall from',
        format: String,
        default: 'bob'
      }
    },
    kinesis: {
      enabled: {
        doc: 'Enables/disables kinesis pump',
        format: 'Boolean',
        default: false,
      },
      establishments: {
        doc: 'The name of the kinesis stream into which to pump all establishments',
        format: String,
        default: 'kensis-establishments',
      },
      workers: {
        doc: 'The name of the kinesis stream into which to pump all workers',
        format: String,
        default: 'kensis-workers',
      },
      users: {
        doc: 'The name of the kinesis stream into which to pump all users',
        format: String,
        default: 'kensis-users',
      },
    },
    sns: {
      enabled: {
        doc: 'Enables/disables SNS posts',
        format: 'Boolean',
        default: false,
      },
      registrations: {
        doc: 'The ARN of the SNS topic for registrations',
        format: String,
        default: 'sns-registrations-arn',
      },
      feedback: {
        doc: 'The ARN of the SNS topic for feedback',
        format: String,
        default: 'sns-feedback-arn',
      },
    },
  },
  bulkupload: {
    region: {
      doc: 'AWS region override for bulk upload S3 only',
      format: '*',
      default: 'eu-west-2',
    },
    bucketname: {
      doc: 'Bucket used to upload all client related csv files',
      format: '*',
      default: 'sfcbulkuploadfiles',
    },
    uploadSignedUrlExpire: {
      doc: 'The duration in seconds for the upload signed URL to expire',
      format: 'int',
      default: 300,
    },
    validation: {
      timeout: {
        doc: 'The timeout in seconds for bulk upload validations',
        format: 'int',
        default: '300'
      },
      storeIntermediaries: {
        doc: 'If true, intermediary trace data will be stored',
        format: 'Boolean',
        default: false
      },
    },
    completion: {
      timeout: {
        doc: 'The timeout in seconds for bulk upload validations',
        format: 'int',
        default: '300'
      },
    }
  },
  public: {
    download: {
      baseurl: {
        doc: 'The baseurl to S3 bucket where public download content will be stored',
        format: '*',
        default: 'https://sfc-public-dev.s3.eu-west-2.amazonaws.com/public/download',
      },
    },
  },
  admin: {
    url: {
      doc: 'The URL to redirect users to the admin application',
      format: 'url',
      default: 'https://unknown.com',
      env: 'ADMIN_URL',
    },
    overrideWdfEffectiveDate: {
      doc: 'Allows for overridding the effective date - false is default (calculated) effective date',
      format: '*',
      default: false
    }
  },
  app: {
    reports: {
      localAuthority: {
        fromDate: {
          doc: 'A fixed from reporting date; in the format YYYY-MM-DD',
          format: String,
          default: '2019-09-09'
        },
        toDate: {
          doc: 'A fixed to reporting date; in the format YYYY-MM-DD',
          format: String,
          default: '2019-10-31'
        },
      }
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

// now, if defined, load secrets from AWS Secret Manager
if (config.get('aws.secrets.use')) {
  AWSSecrets.initialiseSecrets(
    config.get('aws.region'),
    config.get('aws.secrets.wallet')
  ).then(ret => {
    // DB rebind
    config.set('db.host', AWSSecrets.dbHost());
    config.set('db.password', AWSSecrets.dbPass());
    //config.set('db.client_ssl.data.certificate', AWSSecrets.dbAppUserCertificate().replace(/\\n/g, "\n"));
    //config.set('db.client_ssl.data.key', AWSSecrets.dbAppUserKey().replace(/\\n/g, "\n"));
    //config.set('db.client_ssl.data.ca', AWSSecrets.dbAppRootCertificate().replace(/\\n/g, "\n"));

    // external APIs
    config.set('slack.url', AWSSecrets.slackUrl());
    config.set('notify.key', AWSSecrets.govNotify());
    config.set('admin.url', AWSSecrets.adminUrl());

    // token secret
    config.set('jwt.secret', AWSSecrets.jwtSecret());

    AppConfig.ready = true;
    AppConfig.emit(AppConfig.READY_EVENT);
  });
} else {
  // emit something here
  AppConfig.ready = true;
}

module.exports = config;
