// the contract property is an enumeration
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

const DISABILITY_TYPE = ['Yes', 'No', 'Undisclosed', "Don't know"];
exports.WorkerDisabilityProperty = class WorkerDisabilityProperty extends PropertyPrototype {
    constructor(contract) {
        super('Disability');
        super.property = contract;
    }

    // concrete implementations
    static async cloneFromJson(document) {
        if (document.disability) {
            return new WorkerDisabilityProperty(document.disability);
        } else {
            return null;
        }
    }
    static async cloneFromSequelize(document) {
        if (document.disability) {
            return new WorkerDisabilityProperty(document.disability);
        }
    }

    save() {
        return {
            disability: this.property
        }
    }

    toJSON() {
        return {
            disability: this.property
        }
    }

    get valid() {
        return this.property && DISABILITY_TYPE.includes(this.property);
    }
};