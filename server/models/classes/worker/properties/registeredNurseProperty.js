const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const REGISTEREDNURSE_TYPE = ['Adult Nurse', 'Mental Health Nurse', 'Learning Disabilities Nurse', `Children's Nurse`, 'Enrolled Nurse'];

exports.RegisteredNurseProperty = class RegisteredNurseProperty extends ChangePropertyPrototype {
    constructor() {
        super('RegisteredNurse');
    }

    static clone() {
        return new RegisteredNurseProperty();
    }

    async restoreFromJson(document) {
        if (document.registeredNurse) {
            if (REGISTEREDNURSE_TYPE.includes(document.registeredNurse)) {
                this.property = document.registeredNurse;
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.RegisteredNurseValue;
    }

    savePropertyToSequelize() {
        return {
            RegisteredNurseValue: this.property
        };        
    }

    isEqual(currentValue, newValue) {
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            return {
                registeredNurse: this.property
            };
        }
        
        return {
            registeredNurse : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};