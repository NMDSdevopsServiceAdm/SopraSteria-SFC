// the contract property is an enumeration
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

const CONTRACT_TYPE = ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'];
exports.WorkerContractProperty = class WorkerContractProperty extends PropertyPrototype {
    constructor(contract) {
        super('Contract');
        super.property = contract;
    }

    // concrete implementations
    static async cloneFromJson(document) {
        console.log("WA DEBUG: Cloning from JSON: document: ", document)
        if (document.contract) {
            return new WorkerContractProperty(document.contract);
        } else {
            return null;
        }
    }
    static async cloneFromSequelize(document) {
        if (document.contract) {
            return new WorkerContractProperty(document.contract);
        }
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

    get valid() {
        return this.property && CONTRACT_TYPE.includes(this.property);
    }
};