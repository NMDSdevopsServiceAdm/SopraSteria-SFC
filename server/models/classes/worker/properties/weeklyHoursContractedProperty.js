// the Weekly Hours Contracted property is an enumeration and optional value; that value is an decimal being the number of hours rounded to the nearest 0.5
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const WEEKLY_HOURS_TYPE = ['Yes', 'No'];
exports.WorkerWeeklyHoursContractedProperty = class WorkerWeeklyHoursContractedProperty extends ChangePropertyPrototype {
    constructor() {
        super('WeeklyHoursContracted');
        this._wdfTemporal = false;         
    }

    static clone() {
        return new WorkerWeeklyHoursContractedProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        const MAXIMUM_HOURS=75;

        if (document.weeklyHoursContracted) {
            if (WEEKLY_HOURS_TYPE.includes(document.weeklyHoursContracted.value)) {
                if (document.weeklyHoursContracted.value === 'Yes') {
                    // needs to be to the nearest 0.5
                    // need to validate the days
                    // it has to be greater than or equal to 0 (0 meaning no sick days)
                    // it cannot be more than given value
                    if (document.weeklyHoursContracted.hasOwnProperty('hours') &&
                        !Number.isNaN(document.weeklyHoursContracted.hours) &&
                        document.weeklyHoursContracted.hours <= MAXIMUM_HOURS &&
                        document.weeklyHoursContracted.hours >= 0) {

                        this.property = {
                            value: document.weeklyHoursContracted.value,
                            hours: Math.round(document.weeklyHoursContracted.hours * 2)/2
                        }

                    } else {
                        // invalid hours
                        this.property = null;
                    }

                } else {
                    // simple weekly hours average property
                    this.property = {
                        value: document.weeklyHoursContracted.value
                    };
                }
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        const hoursDocument = {
            value: document.WeeklyHoursContractedValue
        };

        if (document.WeeklyHoursContractedValue === 'Yes') {
            hoursDocument.hours = parseFloat(document.WeeklyHoursContractedHours);
        }
        return hoursDocument;
    }
    savePropertyToSequelize() {
        const hoursDocument = {
            WeeklyHoursContractedValue: this.property.value,
            WeeklyHoursContractedHours: this.property.value === 'Yes' ? this.property.hours : null
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
            return {
                weeklyHoursContracted: {
                    value: this.property,
                    updatedSinceWDFEffectiveDate: this._wdfTemporal ? this._savedAt > wdfEffectiveDate ? true : false : false
                }
            };
        }

        if (!withHistory) {
            // simple form
            return {
                weeklyHoursContracted: this.property
            };
        }
        
        return {
            weeklyHoursContracted : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};