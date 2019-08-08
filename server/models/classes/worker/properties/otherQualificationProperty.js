// the Other Qualifications property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const OTHER_QUALIFICATION_TYPE = ['Yes', 'No', 'Don\'t know'];
exports.WorkerOtherQualificationProperty = class WorkerOtherQualificationProperty extends ChangePropertyPrototype {
    constructor() {
        super('OtherQualifications');
    }

    static clone() {
        return new WorkerOtherQualificationProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.otherQualification) {
            if (OTHER_QUALIFICATION_TYPE.includes(document.otherQualification)) {
                this.property = document.otherQualification;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.OtherQualificationsValue;
    }
    savePropertyToSequelize() {
        return {
            OtherQualificationsValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

        if (!withHistory) {
            // simple form
            return {
                otherQualification: this.property
            };
        }

        return {
            otherQualification : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};