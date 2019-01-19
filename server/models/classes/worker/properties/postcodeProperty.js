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

    restorePropertyFromSequelize(document) {
        return document.PostcodeValue;
    }
    savePropertyToSequelize() {
        return {
            PostcodeValue: this.property
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
                postcode: this.property
            }
        } else {
            return {
                postcode : {
                    currentValue: this.property,
                    ... this.changePropsToJSON()
                }
            }
        }
    }
};