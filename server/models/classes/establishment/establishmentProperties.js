// encapsulates all properties of a user, by returning a PropertyManager
const Manager = require('../properties/manager');

// individual properties
const employerTypeProperty = require('./properties/employerTypeProperty').EmployerTypeProperty;
const staffProperty = require('./properties/staffProperty').StaffProperty;
const otherServicesProperty = require('./properties/servicesProperty').ServicesProperty;
const capacityServicesProperty = require('./properties/capacityProperties').CapacityProperty;
const shareWithProperty = require('./properties/shareWithProperty').ShareWithProperty;
const vacanciesProperty = require('./properties/vacanciesProperty').VacanciesProperty;
const startersProperty = require('./properties/startersProperty').StartersProperty;
const leaversProperty = require('./properties/leaversProperty').LeaversProperty;
const serviceUsersProperty = require('./properties/serviceUsersProperty').ServiceUsersProperty;
const nameProperty = require('./properties/nameProperty').NameProperty;
const mainServiceProperty = require('./properties/mainServiceProperty').MainServiceProperty;
const localIdentifierProperty = require('./properties/localIdentifierProperty').LocalIdentifierProperty;
const locationIdProperty = require('./properties/locationIdProperty').LocationIdProperty;
const address1Property = require('./properties/address1Property').Address1Property;
const address2Property = require('./properties/address2Property').Address2Property;
const address3Property = require('./properties/address3Property').Address3Property;
const townProperty = require('./properties/townProperty').TownProperty;
const countyProperty = require('./properties/countyProperty').CountyProperty;
const postcodeProperty = require('./properties/postcodeProperty').PostcodeProperty;
const latitudeProperty = require('./properties/latitudeProperty').LatitudeProperty;
const longitudeProperty = require('./properties/longitudeProperty').LongitudeProperty;
const isRegulatedProperty = require('./properties/isRegulatedProperty').IsRegulatedProperty;

class EstablishmentPropertyManager {
  constructor() {
    this._thisManager = new Manager.PropertyManager();

    this._thisManager.registerProperty(nameProperty);
    this._thisManager.registerProperty(mainServiceProperty);
    this._thisManager.registerProperty(employerTypeProperty);
    this._thisManager.registerProperty(staffProperty);
    this._thisManager.registerProperty(otherServicesProperty);
    this._thisManager.registerProperty(serviceUsersProperty);
    this._thisManager.registerProperty(capacityServicesProperty);
    this._thisManager.registerProperty(shareWithProperty);
    this._thisManager.registerProperty(vacanciesProperty);
    this._thisManager.registerProperty(startersProperty);
    this._thisManager.registerProperty(leaversProperty);
    this._thisManager.registerProperty(localIdentifierProperty);
    this._thisManager.registerProperty(locationIdProperty);
    this._thisManager.registerProperty(address1Property);
    this._thisManager.registerProperty(address2Property);
    this._thisManager.registerProperty(address3Property);
    this._thisManager.registerProperty(townProperty);
    this._thisManager.registerProperty(countyProperty);
    this._thisManager.registerProperty(postcodeProperty);
    this._thisManager.registerProperty(latitudeProperty);
    this._thisManager.registerProperty(longitudeProperty);
    this._thisManager.registerProperty(isRegulatedProperty);
  }

  get manager() {
    return this._thisManager;
  }
}

exports.EstablishmentPropertyManager = EstablishmentPropertyManager;
exports.SEQUELIZE_DOCUMENT = Manager.PropertyManager.SEQUELIZE_DOCUMENT;
exports.JSON_DOCUMENT = Manager.PropertyManager.JSON_DOCUMENT;
