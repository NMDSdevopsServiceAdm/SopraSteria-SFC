// the gender property is an enumeration
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

const GENDER_TYPE = ['Female', 'Male', 'Other', "Don't know"];
exports.WorkerGenderProperty = class WorkerGenderProperty extends PropertyPrototype {
    constructor(contract) {
        super('Gender');
        super.property = contract;
    }

    // concrete implementations
    static async cloneFromJson(document) {
        if (document.gender) {
            return new WorkerGenderProperty(document.gender);
        } else {
            return null;
        }
    }
    static async cloneFromSequelize(document) {
        if (document.gender) {
            return new WorkerGenderProperty(document.gender);
        }
    }

    save() {
        return {
            gender: this.property
        }
    }

    toJSON() {
        return {
            gender: this.property
        }
    }

    get valid() {
        return this.property && GENDER_TYPE.includes(this.property);
    }
};