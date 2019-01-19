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

    restorePropertyFromSequelize(document) {
        return document.GenderValue;
    }
    savePropertyToSequelize() {
        return {
            GenderValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // gender is a simple (enum'd) string
        if (currentValue && newValue && currentValue === newValue) return true;
        else return false;
    }

    toJSON(withHistory=false) {
        if (!withHistory) {
            // simple form
            return {
                gender: this.property
            }
        } else {
            return {
                gender : {
                    currentValue: this.property,
                    ... this.changePropsToJSON()
                }
            }
        }
    }
};