// the DOB (Date of Birth) property is a a date
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;
const moment = require('moment');

// database models
const models = require('../../../index');

exports.WorkerDateOfBirthProperty = class WorkerDateOfBirthProperty extends PropertyPrototype {
    constructor(dateOfBirth) {
        super('DateofBirth');
        super.property = dateOfBirth;
    }

    // concrete implementations
    static async cloneFromJson(document) {
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
                return new WorkerDateOfBirthProperty(expectedDate);
            } else {
                return new WorkerDateOfBirthProperty(null);
            }

        }
    }
    static async cloneFromSequelize(document) {
        // Note - sequelize will serialise a Javascript Date type from the given Worker sequelize model
        if (document.dateOfBirth) {
            return new WorkerDateOfBirthProperty(document.dateOfBirth);
        }
    }

    save() {
        if (this.valid) {
            return {
                dateOfBirth: this.property
            };
        }
    }

    toJSON() {
        return {
            dateOfBirth: this.property
        }
    }

    get valid() {
        return this.property && this.property.isValid();
    }
};