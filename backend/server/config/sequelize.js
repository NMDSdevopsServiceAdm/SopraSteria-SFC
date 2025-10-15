const config = require('./config');
const AWSSecrets = require('../aws/secrets');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  if (config.get('aws.secrets.use')) {
    await AWSSecrets.initialiseSecrets(config.get('aws.region'), config.get('aws.secrets.wallet'));

    config.set('db.host', AWSSecrets.dbHost());
    config.set('db.password', AWSSecrets.dbPass());
  }

  return {
    production: {
      username: config.get('db.username'),
      password: config.get('db.password'),
      database: config.get('db.database'),
      host: config.get('db.host'),
      port: config.get('db.port'),
      dialect: config.get('db.dialect'),
      dialectOptions: {
        ssl: { ca: fs.readFileSync(path.join(__dirname, '../../certificate/rds-ca-certificate.pem')).toString() },
      },
      migrationStorageTableSchema: 'cqc',
    },
    preproduction: {
      username: config.get('db.username'),
      password: config.get('db.password'),
      database: config.get('db.database'),
      host: config.get('db.host'),
      port: config.get('db.port'),
      dialect: config.get('db.dialect'),
      dialectOptions: {
        ssl: { ca: fs.readFileSync(path.join(__dirname, '../../certificate/rds-ca-certificate.pem')).toString() },
      },
      migrationStorageTableSchema: 'cqc',
    },
    test: {
      username: config.get('db.username'),
      password: config.get('db.password'),
      database: config.get('db.database'),
      host: config.get('db.host'),
      port: config.get('db.port'),
      dialect: config.get('db.dialect'),
      dialectOptions: {
        ssl: { ca: fs.readFileSync(path.join(__dirname, '../../certificate/rds-ca-certificate.pem')).toString() },
      },
      migrationStorageTableSchema: 'cqc',
    },
    benchmarks: {
      username: config.get('db.username'),
      password: config.get('db.password'),
      database: config.get('db.database'),
      host: config.get('db.host'),
      port: config.get('db.port'),
      dialect: config.get('db.dialect'),
      dialectOptions: {
        ssl: { ca: fs.readFileSync(path.join(__dirname, '../../certificate/rds-ca-certificate.pem')).toString() },
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
        ssl: false,
      },
    },
    e2etest: {
      username: config.get('e2etestdb.username'),
      password: config.get('e2etestdb.password'),
      database: config.get('e2etestdb.database'),
      host: config.get('e2etestdb.host'),
      port: config.get('e2etestdb.port'),
      dialect: config.get('e2etestdb.dialect'),
      migrationStorageTableSchema: 'cqc',
      dialectOptions: {
        ssl: false,
      },
    },
  };
};
