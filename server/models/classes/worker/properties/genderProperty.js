// the gender property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const GENDER_TYPE = ['Female', 'Male', 'Other', "Don't know"];
exports.WorkerGenderProperty = class WorkerGenderProperty extends ChangePropertyPrototype {
    constructor() {
        super('Gender');
    }

    static clone() {
        return new WorkerGenderProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.gender) {
            if (GENDER_TYPE.includes(document.gender)) {
                this.property = document.gender;
            } else {
                this.property = null;
            }
        }
    }
    async restoreFromSequelize(document) {
        if (document.gender) {
            this.property = document.gender;
            this.reset();
        }
    }

    get isEqual() {
        // TODO
        return true;
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
};