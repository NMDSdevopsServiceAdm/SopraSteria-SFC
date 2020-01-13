// the County property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.CountyProperty = class CountyProperty extends ChangePropertyPrototype {
    constructor() {
        super('County');
    }

    static clone() {
        return new CountyProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.county) {
          this.property = document.county;
        }
    }

    restorePropertyFromSequelize(document) {
        return document.county;
    }
    savePropertyToSequelize() {
        return {
            county: this.property
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
                county: this.property
            };
        }

        return {
            county: {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
