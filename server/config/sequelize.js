const config = require('./config');
const AWSSecrets = require('../aws/secrets');

module.exports = async () => {
  if (config.get('aws.secrets.use')) {
    await AWSSecrets.initialiseSecrets(config.get('aws.region'), config.get('aws.secrets.wallet'));

    config.set('db.host', AWSSecrets.dbHost());
    config.set('db.password', AWSSecrets.dbPass());
  }

  return {
    production: {
      use_env_variable: 'DATABASE_URL',
      dialect: config.get('db.dialect'),
      dialectOptions: {
        ssl: config.get('db.ssl'),
      },
      migrationStorageTableSchema: 'cqc',
    },
    preproduction: {
      use_env_variable: 'DATABASE_URL',
      dialect: config.get('db.dialect'),
      dialectOptions: {
        ssl: config.get('db.ssl'),
      },
      migrationStorageTableSchema: 'cqc',
    },
    test: {
      use_env_variable: 'DATABASE_URL',
      dialect: config.get('db.dialect'),
      dialectOptions: {
        ssl: config.get('db.ssl'),
      },
      migrationStorageTableSchema: 'cqc',
    },
    benchmarks: {
      use_env_variable: 'DATABASE_URL',
      dialect: config.get('db.dialect'),
      dialectOptions: {
        ssl: config.get('db.ssl'),
      },
      migrationStorageTableSchema: 'cqc',
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
      },
    },
  };
};
