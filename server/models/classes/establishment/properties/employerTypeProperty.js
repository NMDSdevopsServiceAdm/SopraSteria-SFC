// the employertype  property is a value (enum) property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.EmployerTypeProperty = class EmployerTypeProperty extends ChangePropertyPrototype {
    constructor() {
        super('EmployerType');
    }

    static clone() {
        return new EmployerTypeProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.employerType) {
            const ALLOWED_EMPLOYER_TYPES=['Private Sector', 'Voluntary / Charity', 'Other', 'Local Authority (generic/other)', 'Local Authority (adult services)'];

            if (ALLOWED_EMPLOYER_TYPES.includes(document.employerType)) {
                this.property = document.employerType;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.EmployerTypeValue;
    }
    savePropertyToSequelize() {
        return {
            EmployerTypeValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // employer type is a simple (enum) string
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                employerType: this.property
            };
        }
        
        return {
            employerType: {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};