// AppConfig is an emitter wrapper around Convict "config" and is used to notify when
//  application configuration is ready, which, when introducing AWS Secrets Manager
//  is not necessarily immediately on startup.
const EventEmitter = require('events');

class ConfigEmitter extends EventEmitter {
  constructor() {
    super();
    this._ready = false;
  };

  get READY_EVENT() {
    return 'Ready';
  };

  get ready() {
    return this._ready;
  }

  set ready(status) {
    this._ready = status;
  }
};
const AppConfig = new ConfigEmitter();

module.exports = AppConfig;
