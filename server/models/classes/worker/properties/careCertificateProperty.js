// the care certificate property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const CARE_CERTIFICATE_TYPE = ['Yes, completed', 'Yes, in progress or partially completed', 'No'];
exports.WorkerCareCertificateProperty = class WorkerCareCertificateProperty extends ChangePropertyPrototype {
    constructor() {
        super('CareCertificate');
    }

    static clone() {
        return new WorkerCareCertificateProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.careCertificate) {
            if (CARE_CERTIFICATE_TYPE.includes(document.careCertificate)) {
                this.property = document.careCertificate;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.CareCertificateValue;
    }
    savePropertyToSequelize() {
        return {
            CareCertificateValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // Care Certificate is a simple (enum'd) string
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

        if (!withHistory) {
            // simple form
            return {
                careCertificate: this.property
            };
        }

        return {
            careCertificate : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};