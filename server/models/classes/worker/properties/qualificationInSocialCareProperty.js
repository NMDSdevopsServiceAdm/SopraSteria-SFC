// the Qualificatoin In Social Care property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const SOCIAL_CARE_QUALIFICATION_TYPE = ['Yes', 'No', 'Don\'t know'];
exports.WorkerQualificationInSocialCareProperty = class WorkerQualificationInSocialCareProperty extends ChangePropertyPrototype {
    constructor() {
        super('QualificationInSocialCare');
    }

    static clone() {
        return new WorkerQualificationInSocialCareProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.qualificationInSocialCare) {
            if (SOCIAL_CARE_QUALIFICATION_TYPE.includes(document.qualificationInSocialCare)) {
                this.property = document.qualificationInSocialCare;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.QualificationInSocialCareValue;
    }
    savePropertyToSequelize() {
        return {
            QualificationInSocialCareValue: this.property
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
                qualificationInSocialCare: this.property
            };
        }

        return {
            qualificationInSocialCare : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};