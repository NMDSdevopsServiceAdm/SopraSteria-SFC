// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const FLU_JAB_TYPE = ['Yes', 'No', "Don't know"];
exports.WorkerFluJabProperty = class WorkerFluJabProperty extends ChangePropertyPrototype {
    constructor() {
        super('FluJab');
    }

    static clone() {
        return new WorkerFluJabProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.fluJab) {
            if (FLU_JAB_TYPE.includes(document.fluJab)) {
                this.property = document.fluJab;
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.FluJabValue;
    }
    savePropertyToSequelize() {
        return {
            FluJabValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // a simple (enum'd) string compare
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                fluJab: this.property
            };
        }

        return {
            fluJab : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
