// the zero contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const ZERO_CONTRACT_TYPE = ['Yes', 'No', 'Don\'t know'];
exports.WorkerZeroContractProperty = class WorkerZeroContractProperty extends ChangePropertyPrototype {
    constructor() {
        super('ZeroHoursContract');
        this._wdfTemporal = false;        
    }

    static clone() {
        return new WorkerZeroContractProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.zeroHoursContract) {
            if (ZERO_CONTRACT_TYPE.includes(document.zeroHoursContract)) {
                this.property = document.zeroHoursContract;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.ZeroHoursContractValue;
    }
    savePropertyToSequelize() {
        return {
            ZeroHoursContractValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // contract is a simple (enum'd) string
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._wdfTemporal ? this._savedAt > wdfEffectiveDate ? true : false : false;
        }

        if (!withHistory) {
            // simple form
            return {
                zeroHoursContract: this.property
            };
        }
        
        return {
            zeroHoursContract : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};