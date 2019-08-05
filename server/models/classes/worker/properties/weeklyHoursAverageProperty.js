// the Weekly Hours Average property is an enumeration and optional value; that value is an decimal being the number of hours rounded to the nearest 0.5
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const WEEKLY_HOURS_TYPE = ['Yes', 'No'];
exports.WorkerWeeklyHoursAverageProperty = class WorkerWeeklyHoursAverageProperty extends ChangePropertyPrototype {
    constructor() {
        super('WeeklyHoursAverage');
        this._wdfTemporal = false;         
    }

    static clone() {
        return new WorkerWeeklyHoursAverageProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        const MAXIMUM_HOURS=75;

        if (document.weeklyHoursAverage) {
            if (WEEKLY_HOURS_TYPE.includes(document.weeklyHoursAverage.value)) {
                if (document.weeklyHoursAverage.value === 'Yes') {
                    // needs to be to the nearest 0.5
                    // need to validate the days
                    // it has to be greater than or equal to 0 (0 meaning no sick days)
                    // it cannot be more than given value
                    if (document.weeklyHoursAverage.hasOwnProperty('hours') &&
                        !Number.isNaN(document.weeklyHoursAverage.hours) &&
                        document.weeklyHoursAverage.hours <= MAXIMUM_HOURS &&
                        document.weeklyHoursAverage.hours >= 0) {

                        this.property = {
                            value: document.weeklyHoursAverage.value,
                            hours: Math.round(document.weeklyHoursAverage.hours * 2)/2
                        }

                    } else {
                        // invalid hours
                        this.property = null;
                    }

                } else {
                    // simple weekly hours average property
                    this.property = {
                        value: document.weeklyHoursAverage.value
                    };
                }
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        const hoursDocument = {
            value: document.WeeklyHoursAverageValue
        };

        if (document.WeeklyHoursAverageValue === 'Yes') {
            hoursDocument.hours = parseFloat(document.WeeklyHoursAverageHours);
        }
        return hoursDocument;
    }
    savePropertyToSequelize() {
        const hoursDocument = {
            WeeklyHoursAverageValue: this.property.value,
            WeeklyHoursAverageHours: this.property.value === 'Yes' ? this.property.hours : null
        };
        
        return hoursDocument;
    }

    isEqual(currentValue, newValue) {
        // not a simple (enum'd) string compare; if "Yes", also need to compare the hours (just an number)
        let hoursEqual = false;
        if (currentValue && newValue && currentValue.value === 'Yes') {
            if (currentValue.hasOwnProperty('hours') && newValue.hasOwnProperty('hours') && currentValue.hours === newValue.hours) hoursEqual = true;
        } else {
            hoursEqual = true;
        }

        return currentValue && newValue && currentValue.value === newValue.value && hoursEqual;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._wdfTemporal ? this._savedAt > wdfEffectiveDate ? true : false : false;
        }

        if (!withHistory) {
            // simple form
            return {
                weeklyHoursAverage: this.property
            };
        }
        
        return {
            weeklyHoursAverage : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};