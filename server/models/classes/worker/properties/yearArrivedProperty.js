// the Year Arrived property is an enumeration and optional value; that value is a date, moreso, just the year part
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const YEAR_ARRIVED_TYPE = ['Yes', 'No'];
exports.WorkerYearArrivedProperty = class WorkerYearArrivedProperty extends ChangePropertyPrototype {
    constructor() {
        super('YearArrived');
        this._allowNull = true;
    }

    static clone() {
        return new WorkerYearArrivedProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        const MAXIMUM_AGE=100;

        if (document.yearArrived) {
            if (YEAR_ARRIVED_TYPE.includes(document.yearArrived.value)) {
                if (document.yearArrived.value === 'Yes') {
                    const thisYear = new Date().getFullYear();

                    // need to validate the year - it's only four character integer - YYYY
                    // it has to be less than equal to this year
                    // it cannot be less than MAXIMUM AGE
                    if (document.yearArrived.year &&
                        Number.isInteger(document.yearArrived.year) &&
                        document.yearArrived.year <= thisYear &&
                        document.yearArrived.year >= (thisYear - MAXIMUM_AGE)) {

                        this.property = {
                            value: document.yearArrived.value,
                            year: document.yearArrived.year
                        }

                    } else {
                        // invalid year of arrival
                        this.property = null;
                    }

                } else {
                    // simple year arrived property
                    this.property = {
                        value: document.yearArrived.value
                    };
                }
            } else if (document.yearArrived.value === null) {
              this.property = {
                value: document.yearArrived.value,
                year: document.yearArrived.year
              };
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        const yearArrivedDocument = {
            value: document.YearArrivedValue
        };

        if (document.YearArrivedValue === 'Yes' && document.YearArrivedYear) {
            yearArrivedDocument.year = document.YearArrivedYear;
        }
        return yearArrivedDocument;
    }
    savePropertyToSequelize() {
        return {
            YearArrivedValue: this.property.value,
            YearArrivedYear: this.property.value === 'Yes' ? this.property.year : null
        };
    }

    isEqual(currentValue, newValue) {
        // not a simple (enum'd) string compare; if "Yes", also need to compare the year (just an integer)
        let yearEqual = false;
        if (currentValue && newValue && currentValue.value === 'Yes') {
            if (currentValue.year && newValue.year && currentValue.year === newValue.year) yearEqual = true;
        } else {
            yearEqual = true;
        }

        return currentValue && newValue && currentValue.value === newValue.value && yearEqual;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                yearArrived: this.property
            };
        }

        return {
            yearArrived : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
