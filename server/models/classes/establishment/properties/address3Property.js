// the Address3 property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.Address3Property = class Address3Property extends ChangePropertyPrototype {
    constructor() {
        super('Address3');
        this._allowNull = true;
    }

    static clone() {
        return new Address3Property();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.address3) {
          this.property = document.address3;
        }
    }

    restorePropertyFromSequelize(document) {
        return document.address3;
    }
    savePropertyToSequelize() {
        return {
            address3: this.property
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
                address3: this.property
            };
        }

        return {
            address3: {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
