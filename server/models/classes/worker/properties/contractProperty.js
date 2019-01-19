// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const CONTRACT_TYPE = ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'];
exports.WorkerContractProperty = class WorkerContractProperty extends ChangePropertyPrototype {
    constructor() {
        super('Contract');
    }

    static clone() {
        return new WorkerContractProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.contract) {
            if (CONTRACT_TYPE.includes(document.contract)) {
                this.property = document.contract;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.ContractValue;
    }
    savePropertyToSequelize() {
        return {
            ContractValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // contract is a simple (enum'd) string
        if (currentValue === newValue) return true;
        else return false;
    }

    toJSON(withHistory=false) {
        if (!withHistory) {
            // simple form
            return {
                contract: this.property
            }
        } else {
            return {
                contract : {
                    currentValue: this.property,
                    ... this.changePropsToJSON()
                }
            }
        }
    }
};