// the Completed property is a simple boolean
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.WorkerCompletedProperty = class WorkerCompletedProperty extends ChangePropertyPrototype {
    constructor() {
        super('Completed');
    }

    static clone() {
        return new WorkerCompletedProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        // a false here is a valid value - storing the property as a string, because all existing logic to check if property is updated/changed/valid et al
        if (document.completed || document.completed === false) {
            if (typeof document.completed === 'boolean') {
                this.property = document.completed ? 'true' : 'false';
            } else if (['true', 'false'].includes(document.completed .toLowerCase())) {
                this.property = document.completedtoLowerCase() === 'true' ? true : 'false';
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.CompletedValue === true ? 'true' : 'false';
    }
    savePropertyToSequelize() {
        return {
            CompletedValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // a simple boolean (value) compare - but the property is stored as a string
        const myResult = currentValue && newValue && currentValue === newValue;
        return myResult;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                completed: this.property === 'true' ? true : false
            };
        }
        
        return {
            completed : {
                currentValue: this.property === 'true' ? true : false,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};