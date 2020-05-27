const appConfig = require('./config');

module.exports = {
  development: {
    username: appConfig.get('db.username'),
    password: appConfig.get('db.password'),
    database: appConfig.get('db.database'),
    host: appConfig.get('db.host'),
    port: appConfig.get('db.port'),
    dialect: appConfig.get('db.dialect'),
    migrationStorageTableSchema: 'cqc',
    dialectOptions: {
      ssl: appConfig.get('db.ssl'),
    }
  },
  localhost: {
    username: appConfig.get('db.username'),
    password: appConfig.get('db.password'),
    database: appConfig.get('db.database'),
    host: appConfig.get('db.host'),
    port: appConfig.get('db.port'),
    dialect: appConfig.get('db.dialect'),
    migrationStorageTableSchema: 'cqc',
    dialectOptions: {
      ssl: appConfig.get('db.ssl'),
    }
  }
}
