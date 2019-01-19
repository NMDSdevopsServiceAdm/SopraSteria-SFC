// the National Insurance Number property is a type being JobId and Title
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

exports.WorkerNationalInsuranceNumberProperty = class WorkerNationalInsuranceNumberProperty extends ChangePropertyPrototype {
    constructor() {
        super('NationalInsuranceNumber');
    }

    static clone() {
        return new WorkerNationalInsuranceNumberProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        const niRegex = /^(?!BG)(?!GB)(?!NK)(?!KN)(?!TN)(?!NT)(?!ZZ)(?:[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z])(?:\s*\d\s*){6}([A-D]|\s)$/;
            
        if (document.nationalInsuranceNumber) {
            if (document.nationalInsuranceNumber.length <= 13 &&
                niRegex.test(document.nationalInsuranceNumber)) {
                this.property = document.nationalInsuranceNumber;
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.NationalInsuranceNumberValue;
    }
    savePropertyToSequelize() {
        return {
            NationalInsuranceNumberValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // a simple string compare
        if (currentValue && newValue && currentValue === newValue) return true;
        else return false;
    }

    toJSON(withHistory=false) {
        if (!withHistory) {
            // simple form
            return {
                nationalInsuranceNumber: this.property
            }
        } else {
            return {
                nationalInsuranceNumber : {
                    currentValue: this.property,
                    ... this.changePropsToJSON()
                }
            }
        }
    }
};