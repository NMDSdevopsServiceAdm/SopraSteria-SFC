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
    async restoreFromSequelize(document) {
        if (document.nationalInsuranceNumber) {
            this.property = document.nationalInsuranceNumber;
            this.reset();
        }
    }

    isEqual(currentValue, newValue) {
        // TODO
        return true;
    }

    save(username) {
        return {
            nationalInsuranceNumber: this.property
        };    
    }

    toJSON(withHistory=false) {
        return {
            nationalInsuranceNumber: this.property
        }
    }
};