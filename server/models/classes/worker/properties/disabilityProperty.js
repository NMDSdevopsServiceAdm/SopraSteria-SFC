// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const DISABILITY_TYPE = ['Yes', 'No', 'Undisclosed', "Don't know"];
exports.WorkerDisabilityProperty = class WorkerDisabilityProperty extends ChangePropertyPrototype {
    constructor() {
        super('Disability');
    }

    static clone() {
        return new WorkerDisabilityProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.disability) {
            if (DISABILITY_TYPE.includes(document.disability)) {
                this.property = document.disability;
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.DisabilityValue;
    }
    savePropertyToSequelize() {
        return {
            DisabilityValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // a simple (enum'd) string compare
        if (currentValue && newValue && currentValue === newValue) return true;
        else return false;
    }

    toJSON(withHistory=false) {
        if (!withHistory) {
            // simple form
            return {
                disability: this.property
            }
        } else {
            return {
                disability : {
                    currentValue: this.property,
                    ... this.changePropsToJSON()
                }
            }
        }
    }
};