// the Main Job Start Date property is a a date
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;
const moment = require('moment');

// database models
const models = require('../../../index');

exports.WorkerMainJobStartDateProperty = class WorkerMainJobStartDateProperty extends ChangePropertyPrototype {
    constructor() {
        super('MainJobStartDate');
        this._allowNull = true;
    }

    static clone() {
        return new WorkerMainJobStartDateProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.mainJobStartDate || document.mainJobStartDate === null) {
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
            const expectedDate = moment.utc(document.mainJobStartDate, "YYYY-MM-DD");
            const thisDate = moment();

            // TODO - cross validatin checks with Date of Birth

            if (document.mainJobStartDate !== null &&
                document.mainJobStartDate.length === 10 &&
                expectedDate.isValid() &&
                expectedDate.isBefore(thisDate)) {
                // we have a valid date - normalise the date to a string (to ensure date only - no time)
                this.property = expectedDate.toJSON().slice(0,10);
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        // must be date only part (no time)
        return new moment(document.MainJobStartDateValue).toJSON().slice(0,10);
    }
    savePropertyToSequelize() {
        return {
            MainJobStartDateValue: this.property !== null ? new Date(this.property) : null
        };
    }

    isEqual(currentValue, newValue) {
        // a string normalised to date only component in ISO 8603 format
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

        if (!withHistory) {
            // simple form
            return {
                mainJobStartDate: this.property
            };
        }

        return {
            mainJobStartDate : {
                currentValue: this.property ? this.property : null,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
