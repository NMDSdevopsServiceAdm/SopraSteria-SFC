'use strict';
const appConfig = require('../config/config');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

let sequelize;
const config = {};

// allow override of any config value from environment variable
config.host = appConfig.get('db.host');
config.port = appConfig.get('db.port');
config.database = appConfig.get('db.database');
config.username = appConfig.get('db.username');
config.password = appConfig.get('db.password');
config.dialect = appConfig.get('db.dialect');
config.dialectOptions = {
  ssl: appConfig.get('db.ssl')
};

if (appConfig.get('db.client_ssl.status')) {
  config.dialectOptions.ssl = {
    rejectUnauthorized : false,
    ca   : fs.readFileSync(appConfig.get('db.client_ssl.ca')).toString(),
    key  : fs.readFileSync(appConfig.get('db.client_ssl.key')).toString(),
    cert : fs.readFileSync(appConfig.get('db.client_ssl.certificate')).toString(),
  };
}

// setup connection pool
config.pool = {
  max: appConfig.get('db.pool'),
  min: appConfig.get('db.pool'),
  //idle: 10000,
};

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
