// the National Insurance Number property is a type being JobId and Title
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

// database models
const models = require('../../../index');

exports.WorkerNationalInsuranceNumberProperty = class WorkerNationalInsuranceNumberProperty extends PropertyPrototype {
    constructor(niNumber) {
        super('NationalInsuranceNumber');
        super.property = niNumber;
    }

    // concrete implementations
    static async cloneFromJson(document) {
        if (document.nationalInsuranceNumber) {
            return new WorkerNationalInsuranceNumberProperty(document.nationalInsuranceNumber);
        }
    }
    static async cloneFromSequelize(document) {
        if (document.nationalInsuranceNumber) {
            return new WorkerNationalInsuranceNumberProperty(document.nationalInsuranceNumber);
        }
    }

    save() {
        return {
            nationalInsuranceNumber: this.property
        };    
    }

    toJSON() {
        return {
            nationalInsuranceNumber: this.property
        }
    }

    get valid() {
        // national insurance number format: AA 11 11 11 
        console.log("")
        const niRegex = /^(?!BG)(?!GB)(?!NK)(?!KN)(?!TN)(?!NT)(?!ZZ)(?:[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z])(?:\s*\d\s*){6}([A-D]|\s)$/;
        return this.property && this.property.length <= 13 && niRegex.test(this.property);
    }
};