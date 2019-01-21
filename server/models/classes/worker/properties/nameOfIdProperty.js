// the nameOrId property is a simple string
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.WorkerNameOrIdProperty = class WorkerNameOrIdProperty extends ChangePropertyPrototype {
    constructor() {
        super('NameOrId');
    }

    static clone() {
        return new WorkerNameOrIdProperty();
    }

    async restoreFromJson(document) {
        if (document.nameOrId) {
            if (document.nameOrId.length <= 50) {
                this.property = document.nameOrId;
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.NameOrIdValue;
    }
    savePropertyToSequelize() {
        return {
            NameOrIdValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // name or ID is a simple tring
        if (currentValue && newValue && currentValue === newValue) return true;
        else return false;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                nameOrId: this.property
            }
        } else {
            return {
                nameOrId : {
                    currentValue: this.property,
                    ... this.changePropsToJSON(showPropertyHistoryOnly)
                }
            };
        }
    }
};