// the Postcode property is a type being JobId and Title
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

// database models
const models = require('../../../index');

exports.WorkerPostcodeProperty = class WorkerPostcodeProperty extends PropertyPrototype {
    constructor(niNumber) {
        super('NationalInsuranceNumber');
        super.property = niNumber;
    }

    // concrete implementations
    static async cloneFromJson(document) {
        if (document.postcode) {
            return new WorkerPostcodeProperty(document.postcode);
        }
    }
    static async cloneFromSequelize(document) {
        if (document.postcode) {
            return new WorkerPostcodeProperty(document.postcode);
        }
    }

    save() {
        return {
            postcode: this.property
        };    
    }

    toJSON() {
        return {
            postcode: this.property
        }
    }

    get valid() {
        const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
        return this.property && postcodeRegex.test(this.property);
    }
};