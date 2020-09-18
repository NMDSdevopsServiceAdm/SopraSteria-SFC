// encapsulates all properties of a user, by returning a PropertyManager
const Manager = require('../properties/manager');

// individual properties
const fullnameProperty = require('./properties/fullnameProperty').UserFullnameProperty;
const jobTitleProperty = require('./properties/jobTitleProperty').UserJobTitleProperty;
const emailProperty = require('./properties/emailProperty').UserEmailProperty;
const phoneProperty = require('./properties/phoneProperty').UserPhoneProperty;
const securityQuestionProperty = require('./properties/securityQuestionProperty').UserSecurityQuestionProperty;
const securityQuestionAnswerProperty = require('./properties/securityQuestionAnswerProperty')
  .UserSecurityQuestionAnswerProperty;
const roleProperty = require('./properties/roleProperty').UserRoleProperty;

class UserPropertyManager {
  constructor() {
    this._thisManager = new Manager.PropertyManager();

    this._thisManager.registerProperty(fullnameProperty);
    this._thisManager.registerProperty(jobTitleProperty);
    this._thisManager.registerProperty(emailProperty);
    this._thisManager.registerProperty(phoneProperty);
    this._thisManager.registerProperty(roleProperty);
    this._thisManager.registerProperty(securityQuestionProperty);
    this._thisManager.registerProperty(securityQuestionAnswerProperty);
  }

  get manager() {
    return this._thisManager;
  }
}

exports.UserPropertyManager = UserPropertyManager;
exports.SEQUELIZE_DOCUMENT = Manager.PropertyManager.SEQUELIZE_DOCUMENT;
exports.JSON_DOCUMENT = Manager.PropertyManager.JSON_DOCUMENT;
