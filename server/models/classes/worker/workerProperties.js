// encapsulates all properties of a worker, by returning a PropertyManager
const Manager = require('../properties/manager');

// individual properties
const contractProperty = require('./properties/contractProperty').WorkerContractProperty;
const nameOrIdProperty = require('./properties/nameOfIdProperty').WorkerNameOrIdProperty;
const mainJobProperty = require('./properties/mainJobProperty').WorkerMainJobProperty;

const thisManager = new Manager.PropertyManager();

thisManager.registerProperty(contractProperty);
thisManager.registerProperty(nameOrIdProperty);
thisManager.registerProperty(mainJobProperty);

exports.manager = thisManager;
exports.SEQUELIZE_DOCUMENT = Manager.PropertyManager.SEQUELIZE_DOCUMENT;
exports.JSON_DOCUMENT = Manager.PropertyManager.JSON_DOCUMENT;