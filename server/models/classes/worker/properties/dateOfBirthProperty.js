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
        const MINIMUM_AGE=14;
        const MAXIMUM_AGE=100;
        if (document.dateOfBirth) {
            // mimics main job start date property by ensuring date is a valid date
            //  based on leap year/days in month and that date of birth is more than
            //  sixteen years ago.
            const expectedDate = moment.utc(document.dateOfBirth, "YYYY-MM-DD");
            const maxDate = moment().subtract(MINIMUM_AGE, 'y');
            const minDate = moment().subtract(MAXIMUM_AGE, 'y');

            // TODO - cross validation checks against Social Care Start Date
            //        and main job start date

            if (document.dateOfBirth.length === 10 &&
                expectedDate.isValid() &&
                expectedDate.isBefore(maxDate) &&
                expectedDate.isAfter(minDate)) {
                // we have a valid date - but store property as a normalised string with date only part
                this.property = expectedDate.toJSON().slice(0,10);
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return moment(document.DateOfBirthValue).toJSON().slice(0,10);
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


    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

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