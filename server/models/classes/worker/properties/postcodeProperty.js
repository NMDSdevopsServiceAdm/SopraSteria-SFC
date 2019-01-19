// the Postcode property is a type being JobId and Title
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.WorkerPostcodeProperty = class WorkerPostcodeProperty extends ChangePropertyPrototype {
    constructor() {
        super('Postcode');
    }

    static clone() {
        return new WorkerPostcodeProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
        // return this.property && ;
        if (document.postcode) {
            if (document.postcode.length <= 8 &&
                postcodeRegex.test(document.postcode)) {
                this.property = document.postcode;
            } else {
                this.property = null;
            }
        }
    }
    async restoreFromSequelize(document) {
        if (document.postcode) {
            this.property = document.postcode;
            this.reset();
        }
    }

    get isEqual() {
        // TODO
        return true;
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
};