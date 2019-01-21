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

class WorkerPropertyManager {
    constructor() {
        this._thisManager = new Manager.PropertyManager();

        this._thisManager.registerProperty(contractProperty);
        this._thisManager.registerProperty(nameOrIdProperty);
        this._thisManager.registerProperty(mainJobProperty);
        this._thisManager.registerProperty(approvedMentalHealthWorkerProperty);
        this._thisManager.registerProperty(mainJobStartDateProperty);
        this._thisManager.registerProperty(nationalInsuranceProperty);
        this._thisManager.registerProperty(postcodeProperty);
        this._thisManager.registerProperty(dateOfBirthProperty);
        this._thisManager.registerProperty(genderProperty);
        this._thisManager.registerProperty(disabilityProperty);
    }

    get manager() {
        return this._thisManager;
    }

}

exports.WorkerPropertyManager = WorkerPropertyManager;
exports.SEQUELIZE_DOCUMENT = Manager.PropertyManager.SEQUELIZE_DOCUMENT;
exports.JSON_DOCUMENT = Manager.PropertyManager.JSON_DOCUMENT;