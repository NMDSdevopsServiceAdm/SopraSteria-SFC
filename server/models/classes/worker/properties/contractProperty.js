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
    async restoreFromSequelize(document) {
        if (document.contract) {
            this.property = document.contract;
            this.reset();
        }
    }

    get isEqual() {
        // gender is simply a string
        console.log("WA DEBUG: WorkerContractProperty current/previous values: ", this.property, this.previousProperty)
        //if (this.property)
        return true;
    }

    save() {
        return {
            contract: this.property
        }
    }

    toJSON() {
        return {
            contract: this.property
        }
    }
};