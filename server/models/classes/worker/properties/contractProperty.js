// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const CONTRACT_TYPE = ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'];
exports.WorkerContractProperty = class WorkerContractProperty extends ChangePropertyPrototype {
    constructor() {
        super('Contract');
        this._wdfTemporal = false;        
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
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return {
                contract: {
                    value: this.property,
                    updatedSinceWDFEffectiveDate: this._wdfTemporal ? this._savedAt > wdfEffectiveDate ? true : false : false
                }
            };
        }

        if (!withHistory) {
            // simple form
            return {
                contract: this.property
            };
        }
        
        return {
            contract : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};