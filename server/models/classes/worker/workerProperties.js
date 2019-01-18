// encapsulates all properties of a worker, by returning a PropertyManager
const Manager = require('../properties/manager');

// individual properties
const contractProperty = require('./properties/contractProperty').WorkerContractProperty;
const nameOrIdProperty = require('./properties/nameOfIdProperty').WorkerNameOrIdProperty;
const mainJobProperty = require('./properties/mainJobProperty').WorkerMainJobProperty;
const approvedMentalHealthWorkerProperty = require('./properties/approvedMentalHealthWorkerProperty').WorkerApprovedMentalHealthWorkerProperty;
const mainJobStartDateProperty = require('./properties/mainJobStartDateProperty').WorkerMainJobStartDateProperty;
const nationalInsuranceProperty = require('./properties/nationalInsuranceProperty').WorkerNationalInsuranceNumberProperty;
const postcodeProperty = require('./properties/postcodeProperty').WorkerPostcodeProperty;
const dateOfBirthProperty = require('./properties/dateOfBirthProperty').WorkerDateOfBirthProperty;
const genderProperty = require('./properties/genderProperty').WorkerGenderProperty;
const disabilityProperty = require('./properties/disabilityProperty').WorkerDisabilityProperty;

const thisManager = new Manager.PropertyManager();

thisManager.registerProperty(contractProperty);
thisManager.registerProperty(nameOrIdProperty);
thisManager.registerProperty(mainJobProperty);
thisManager.registerProperty(approvedMentalHealthWorkerProperty);
thisManager.registerProperty(mainJobStartDateProperty);
thisManager.registerProperty(nationalInsuranceProperty);
thisManager.registerProperty(postcodeProperty);
thisManager.registerProperty(dateOfBirthProperty);
thisManager.registerProperty(genderProperty);
thisManager.registerProperty(disabilityProperty);

exports.manager = thisManager;
exports.SEQUELIZE_DOCUMENT = Manager.PropertyManager.SEQUELIZE_DOCUMENT;
exports.JSON_DOCUMENT = Manager.PropertyManager.JSON_DOCUMENT;