// the Main Job Start Date property is a a date
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;
const moment = require('moment');

// database models
const models = require('../../../index');

exports.WorkerMainJobStartDateProperty = class WorkerMainJobStartDateProperty extends ChangePropertyPrototype {
    constructor() {
        super('MainJobStartDate');
    }

    static clone() {
        return new WorkerMainJobStartDateProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.mainJobStartDate) {
            // this is a little more than simply assuming the date as given. JSON
            //  has no specific Date type (JSON Schema supports a date type through
            //  string pattern matching).

            // As presented from JSON here, the date is little more than a string,
            //  but we want to ensure the date is indeed a valid date and in the
            //  format as expected ISO 8601 (as typical of JSON [and XML] documents)

            // we are only expecting the date form, not date & time or time; viz.:
            //  YYYY-MM-DD

            // note also, it is not enough to simply inspect the format, as it is
            //  easy enough to represent an incorrect date, e.g. 20190229 (2019 is
            //  not a leap year)

            // the easier way to validate a date is to use the Javascript Date object,
            //  but 2019-02-29 is automatically rounded up to 2019-03-01 by Javascript Date
            //  therefore using the impressive "moment" library
            const expectedDate = moment(document.mainJobStartDate, "YYYY-MM-DD");
            const thisDate = moment();

            if (document.mainJobStartDate.length === 10 &&
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
        return new moment(document.MainJobStartDateValue);
    }
    savePropertyToSequelize() {
        return {
            MainJobStartDateValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // a moment date
        return currentValue && newValue && currentValue.isSame(newValue, 'day');
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                mainJobStartDate: this.property.toJSON().slice(0,10)
            };
        }
        
        return {
            mainJobStartDate : {
                currentValue: this.property ? this.property.toJSON().slice(0,10) : null,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};