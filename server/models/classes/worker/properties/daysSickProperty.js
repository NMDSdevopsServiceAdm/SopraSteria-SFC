// the Days Sick property is an enumeration and optional value; that value is an decimal being the number of days sick (rounded to the nearest 0.5)
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const DAYS_SICK_TYPE = ['Yes', 'No'];
exports.WorkerDaysSickProperty = class WorkerDaysSickProperty extends ChangePropertyPrototype {
    constructor() {
        super('DaysSick');
        this._allowNull = true;
    }

    static clone() {
        return new WorkerDaysSickProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        const MAXIMUM_DAYS_SICK=366;    // allowing for leap year

        if (document.daysSick) {
            if (DAYS_SICK_TYPE.includes(document.daysSick.value)) {
                if (document.daysSick.value === 'Yes') {
                    // needs to be to the nearest 0.5
                    // need to validate the days
                    // it has to be greater than or equal to 0 (0 meaning no sick days)
                    // it cannot be more than a year
                    if (document.daysSick.hasOwnProperty('days') &&
                        !Number.isNaN(document.daysSick.days) &&
                        document.daysSick.days <= MAXIMUM_DAYS_SICK &&
                        document.daysSick.days >= 0) {

                        this.property = {
                            value: document.daysSick.value,
                            days: Math.round(document.daysSick.days * 2)/2
                        }

                    } else {
                        // invalid number of days sick
                        this.property = null;
                    }

                } else {
                    // simple days sick property
                    this.property = {
                        value: document.daysSick.value
                    };
                }
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        const daysSickDocument = {
            value: document.DaysSickValue
        };

        if (document.DaysSickValue === 'Yes') {
            daysSickDocument.days = parseFloat(document.DaysSickDays);
        }
        return daysSickDocument;
    }

    savePropertyToSequelize() {
        const daysSickDocument = {
            DaysSickValue: null,
            DaysSickDays: null
        };

        if (this.property) {
            daysSickDocument.DaysSickValue = this.property.value;
            daysSickDocument.DaysSickDays = this.property.value === 'Yes' ? this.property.days : null
        }

        return daysSickDocument;
    }

    isEqual(currentValue, newValue) {
        // not a simple (enum'd) string compare; if "Yes", also need to compare the days (just an number)
        let daysEqual = false;
        if (currentValue && newValue && currentValue.value === 'Yes') {
            if (currentValue.hasOwnProperty('days') && newValue.hasOwnProperty('days') && currentValue.days === newValue.days) daysEqual = true;
        } else {
            daysEqual = true;
        }

        return currentValue && newValue && currentValue.value === newValue.value && daysEqual;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

        if (!withHistory) {
            // simple form
            return {
                daysSick: this.property
            };
        }

        return {
            daysSick : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
