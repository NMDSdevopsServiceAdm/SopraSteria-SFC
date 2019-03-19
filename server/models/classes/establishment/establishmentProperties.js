// encapsulates all properties of a user, by returning a PropertyManager
const Manager = require('../properties/manager');

// individual properties
const employerTypeProperty = require('./properties/employerTypeProperty').EmployerTypeProperty;
const staffProperty = require('./properties/staffProperty').StaffProperty;
const otherServices = require("./properties/servicesProperty").ServicesProperty;

class EstablishmentPropertyManager {
    constructor() {
        this._thisManager = new Manager.PropertyManager();

        this._thisManager.registerProperty(employerTypeProperty);
        this._thisManager.registerProperty(staffProperty);
        this._thisManager.registerProperty(otherServices);
    }

    get manager() {
        return this._thisManager;
    }
}

exports.EstablishmentPropertyManager = EstablishmentPropertyManager;
exports.SEQUELIZE_DOCUMENT = Manager.PropertyManager.SEQUELIZE_DOCUMENT;
exports.JSON_DOCUMENT = Manager.PropertyManager.JSON_DOCUMENT;