'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;

// allow override of any config value from environment variable
config.host = process.env.DB_HOST ?  process.env.DB_HOST : config.host;
config.port = process.env.DB_PORT ?  process.env.DB_PORT : config.port;
config.database = process.env.DB_NAME ?  process.env.DB_NAME : config.database;
config.username = process.env.DB_USER ?  process.env.DB_USER : config.username;
config.password = process.env.DB_PASS ?  process.env.DB_PASS : config.password;
config.password = process.env.DB_PASS ?  process.env.DB_PASS : config.password;
if (config.dialectOptions) {
  config.dialectOptions.ssl = process.env.DB_SSL && parseInt(process.env.DB_SSL) === 1 ?  true : false;
} else {
  config.dialectOptions = {
    ssl: process.env.DB_SSL && parseInt(process.env.DB_SSL) === 1 ?  true : false
  }
}

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
