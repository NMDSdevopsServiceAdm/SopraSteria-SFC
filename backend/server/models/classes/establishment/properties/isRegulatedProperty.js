// the IsRegulated property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;
const values = [true, false];

exports.IsRegulatedProperty = class IsRegulatedProperty extends ChangePropertyPrototype {
    constructor() {
        super('IsRegulated');
    }

    static clone() {
        return new IsRegulatedProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (values.includes(document.isRegulated)) {
          this.property = document.isRegulated;
        }
    }

    restorePropertyFromSequelize(document) {
        return document.isRegulated;
    }
    savePropertyToSequelize() {
       return {
            isRegulated: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // employer type is a simple string
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                isRegulated: this.property
            };
        }

        return {
            isRegulated: {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
