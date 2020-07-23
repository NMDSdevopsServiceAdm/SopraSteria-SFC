const config = require('./config');
const AWSSecrets = require('../aws/secrets');

module.exports = async () => {
  if (config.get('aws.secrets.use')) {
    await AWSSecrets.initialiseSecrets(
      config.get('aws.region'),
      config.get('aws.secrets.wallet')
    );

    config.set('db.host', AWSSecrets.dbHost());
    config.set('db.password', AWSSecrets.dbPass());

    if (config.get('db.client_ssl.status')) {
      config.set('db.client_ssl.data.certificate', AWSSecrets.dbAppUserCertificate().replace(/\\n/g, "\n"));
      config.set('db.client_ssl.data.key', AWSSecrets.dbAppUserKey().replace(/\\n/g, "\n"));
      config.set('db.client_ssl.data.ca', AWSSecrets.dbAppRootCertificate().replace(/\\n/g, "\n"));
    }
  }

  return {
    production: {
      use_env_variable: 'DATABASE_URL',
    },
    preproduction: {
      use_env_variable: 'DATABASE_URL',
    },
    test: {
      username: config.get('db.username'),
      password: config.get('db.password'),
      database: config.get('db.database'),
      host: config.get('db.host'),
      port: config.get('db.port'),
      dialect: config.get('db.dialect'),
      migrationStorageTableSchema: 'cqc',
      dialectOptions: {
        ssl: {
          rejectUnauthorized : false,
          ca   : config.get('db.client_ssl.data.ca'),
          key  : config.get('db.client_ssl.data.key'),
          cert : config.get('db.client_ssl.data.certificate'),
        }
      }
    },
    development: {
      username: config.get('db.username'),
      password: config.get('db.password'),
      database: config.get('db.database'),
      host: config.get('db.host'),
      port: config.get('db.port'),
      dialect: config.get('db.dialect'),
      migrationStorageTableSchema: 'cqc',
      dialectOptions: {
        ssl: {
          rejectUnauthorized : false,
          ca   : config.get('db.client_ssl.data.ca'),
          key  : config.get('db.client_ssl.data.key'),
          cert : config.get('db.client_ssl.data.certificate'),
        }
      }
    },
    localhost: {
      username: config.get('db.username'),
      password: config.get('db.password'),
      database: config.get('db.database'),
      host: config.get('db.host'),
      port: config.get('db.port'),
      dialect: config.get('db.dialect'),
      migrationStorageTableSchema: 'cqc',
      dialectOptions: {
        ssl: config.get('db.ssl'),
      }
    }
  }
}
