'use strict';
const EventEmitter = require('events');
const AppConfig = require('../config/appConfig');
const appConfig = require('../config/config');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

class DBEmitter extends EventEmitter {
  constructor() {
    super();
    this._ready = false;
  }

  get READY_EVENT() {
    return 'Ready';
  }

  get ready() {
    return this._ready;
  }

  set ready(status) {
    this._ready = status;
  }
}
db.status = new DBEmitter();

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
  ssl: appConfig.get('db.ssl'),
};
config.logging = appConfig.get('log.sequelize');

// setup connection pool
config.pool = {
  max: appConfig.get('db.pool.max'),
  min: appConfig.get('db.pool.min'),
  acquire: appConfig.get('db.pool.acquire'),
  idle: appConfig.get('db.pool.idle'),
  //idle: 10000,
};

sequelize = new Sequelize(config.database, config.username, config.password, config);

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

if (AppConfig.ready) {
  // the config is ready, so the config properties are true and thus the database is ready to use
  db.status.ready = true;
} else {
  // the config is not ready yet; database password/host may yet change, so wait for confirmation
  //   the config is ready

  AppConfig.on(AppConfig.READY_EVENT, () => {
    // rebind sensitive database connections
    sequelize.connectionManager.config.host = appConfig.get('db.host');
    sequelize.connectionManager.config.password = appConfig.get('db.password');

    sequelize.connectionManager.pool.destroyAllNow();

    // now the database is ready
    db.status.ready = true;
    db.status.emit(db.status.READY_EVENT);
  });
}

module.exports = db;
