// the Annual Weekly Pay property is an enumeration and optional value; that value is an decimal (2 deicimal places) being either their annual or hourly rate
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const PAY_TYPE = ['Hourly', 'Annually', 'Don\'t know'];
exports.WorkerAnnualHourlyPayProperty = class WorkerAnnualHourlyPayProperty extends ChangePropertyPrototype {
    constructor() {
        super('AnnualHourlyPay');
    }

    static clone() {
        return new WorkerAnnualHourlyPayProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        const MAXIMUM_HOURLY_PAY=200;
        const MAXIMUM_ANNUAL_PAY=200000;
        const MINIMUM_HOURLY_PAY=2.5;
        const MINIMUM_ANNUAL_PAY=500;

        if (document.annualHourlyPay) {
            if (PAY_TYPE.includes(document.annualHourlyPay.value)) {
                if (document.annualHourlyPay.value === 'Hourly') {
                    // need to validate the hourly rate
                    if (document.annualHourlyPay.rate &&
                        !Number.isNaN(document.annualHourlyPay.rate) &&
                        document.annualHourlyPay.rate <= MAXIMUM_HOURLY_PAY &&
                        document.annualHourlyPay.rate >= MINIMUM_HOURLY_PAY) {

                        this.property = {
                            value: document.annualHourlyPay.value,
                            rate: Math.round(document.annualHourlyPay.rate * 100)/100      // round to two decimal places (0.01)
                        }

                    } else {
                        // invalid hourly rate
                        this.property = null;
                    }

                } else if (document.annualHourlyPay.value === 'Annually') {
                    // need to validate the annual rate
                    if (document.annualHourlyPay.rate &&
                        !Number.isNaN(document.annualHourlyPay.rate) &&
                        document.annualHourlyPay.rate <= MAXIMUM_ANNUAL_PAY &&
                        document.annualHourlyPay.rate >= MINIMUM_ANNUAL_PAY) {

                        this.property = {
                            value: document.annualHourlyPay.value,
                            rate: Math.round(document.annualHourlyPay.rate)      // round to zero nearest pound
                        }

                    } else {
                        // invalid annual rate
                        this.property = null;
                    }

                }
                else {
                    // simple annual/weekly property
                    this.property = {
                        value: document.annualHourlyPay.value
                    };
                }
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        const payDocument = {
            value: document.AnnualHourlyPayValue
        };

        if (document.AnnualHourlyPayValue !== "Don't know") {
            payDocument.rate = parseFloat(document.AnnualHourlyPayRate);
        }

        return payDocument;
    }
    savePropertyToSequelize() {
        const payDocument = {
            AnnualHourlyPayValue: this.property.value,
            AnnualHourlyPayRate: this.property.value !== "Don't know" ? this.property.rate : null
        };

        return payDocument;
    }

    isEqual(currentValue, newValue) {
        // not a simple (enum'd) string compare; if "Yes", also need to compare the rate (just an number)
        let rateEqual = false;
        if (currentValue && newValue && currentValue.value !== "Don't know") {
            if (currentValue.rate && newValue.rate && currentValue.rate === newValue.rate) rateEqual = true;
        } else {
            rateEqual = true;
        }

        return currentValue && newValue && currentValue.value === newValue.value && rateEqual;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

        if (!withHistory) {
            // simple form
            return {
                annualHourlyPay: this.property
            };
        }

        return {
            annualHourlyPay : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};