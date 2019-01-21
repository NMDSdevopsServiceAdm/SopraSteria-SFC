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
                // we have a valid date - but use the rich moment Date as the property value
                this.property = expectedDate;
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return new moment(document.DateOfBirthValue);
    }
    savePropertyToSequelize() {
        return {
            DateOfBirthValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // a moment date
        if (currentValue && newValue && currentValue.isSame(newValue, 'day')) return true;
        else return false;
    }


    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                dateOfBirth: this.property.toJSON().slice(0,10)
            }
        } else {
            return {
                dateOfBirth : {
                    currentValue: this.property.toJSON().slice(0,10),
                    ... this.changePropsToJSON(showPropertyHistoryOnly)
                }
            }
        }
    }
};