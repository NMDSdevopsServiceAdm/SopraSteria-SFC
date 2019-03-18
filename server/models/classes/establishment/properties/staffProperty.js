// the staff property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.StaffProperty = class StaffProperty extends ChangePropertyPrototype {
    constructor() {
        super('NumberOfStaff');
    }

    static clone() {
        return new StaffProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        console.log("WA DEBUG - serailising from JSON: ", document)
        if (document.numberOfStaff) {
            const givenStaff = parseInt(document.numberOfStaff, 10);
            const MAX_STAFF=999;
            const MIN_STAFF=0;
            if (givenStaff >= MIN_STAFF &&
                givenStaff <= MAX_STAFF) {
                this.property = givenStaff;
            } else {
               this.property = null;
            }

            console.log("WA DEBUG: mnumber of staff property: ", givenStaff, MIN_STAFF, MAX_STAFF, this.property)

        }
    }

    restorePropertyFromSequelize(document) {
        return document.NumberOfStaffValue;
    }
    savePropertyToSequelize() {
        return {
            NumberOfStaffValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // staff is a simple Number - but 0 is valid
        return currentValue !== null && newValue !== null && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                numberOfStaff: this.property
            };
        }
        
        return {
            numberOfStaff: {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};