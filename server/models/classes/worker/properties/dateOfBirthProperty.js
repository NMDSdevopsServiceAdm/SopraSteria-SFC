// the DOB (Date of Birth) property is a a date
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;
const moment = require('moment');

exports.WorkerDateOfBirthProperty = class WorkerDateOfBirthProperty extends ChangePropertyPrototype {
    constructor() {
        super('DateOfBirth');
    }

    static clone() {
        return new WorkerDateOfBirthProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        const MINIMUM_AGE=15;
        if (document.dateOfBirth) {
            // mimics main job start date property by ensuring date is a valid date
            //  based on leap year/days in month and that date of birth is more than
            //  sixteen years ago.
            const expectedDate = moment(document.dateOfBirth, "YYYY-MM-DD");
            const thisDate = moment().subtract(MINIMUM_AGE, 'y');

            if (document.dateOfBirth.length === 10 &&
                expectedDate.isValid() &&
                expectedDate.isBefore(thisDate)) {
                // we have a valid date - but store property as a normalised string with date only part
                this.property = expectedDate.toJSON().slice(0,10);
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return new moment(document.DateOfBirthValue).toJSON().slice(0,10);
    }
    savePropertyToSequelize() {
        return {
            DateOfBirthValue: new Date(this.property)
        };
    }

    isEqual(currentValue, newValue) {
        // a normalised date only as a string in ISO 8306 format
        return currentValue && newValue && currentValue === newValue;
    }


    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form

            return {
                dateOfBirth: this.property
            };
        }
        
        return {
            dateOfBirth : {
                currentValue: this.property ? this.property : null,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};