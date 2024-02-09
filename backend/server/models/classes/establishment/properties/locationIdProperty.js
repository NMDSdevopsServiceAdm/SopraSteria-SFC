// the LocationId property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.LocationIdProperty = class LocationIdProperty extends ChangePropertyPrototype {
    constructor() {
        super('LocationId');
        this._allowNull = true;
    }

    static clone() {
        return new LocationIdProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.locationId) {
            const MAX_LENGTH=120;
            if (document.locationId.length <= MAX_LENGTH) {
                this.property = document.locationId;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.locationId;
    }
    savePropertyToSequelize() {
        return {
            locationId: this.property
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
                locationId: this.property
            };
        }

        return {
            locationId: {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
