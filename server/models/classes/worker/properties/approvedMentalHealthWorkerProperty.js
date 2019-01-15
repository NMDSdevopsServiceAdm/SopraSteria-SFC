// the Approved Mental Health Worker property is an enumeration
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

const HEALTH_WORKER_TYPE = ['Yes', 'No', "Don't know"];
exports.WorkerApprovedMentalHealthWorkerProperty = class WorkerApprovedMentalHealthWorkerProperty extends PropertyPrototype {
    constructor(value) {
        super('ApprovedMentalHealthWorker');
        super.property = value;
    }

    // concrete implementations
    static async cloneFromJson(document) {
        if (document.approvedMentalHealthWorker) {
            return new WorkerApprovedMentalHealthWorkerProperty(document.approvedMentalHealthWorker);
        } else {
            return null;
        }
    }
    static async cloneFromSequelize(document) {
        if (document.approvedMentalHealthProfessional) {
            return new WorkerApprovedMentalHealthWorkerProperty(document.approvedMentalHealthProfessional);
        }
    }

    save() {
        return {
            approvedMentalHealthProfessional: this.property
        }
    }

    toJSON() {
        return {
            approvedMentalHealthWorker: this.property
        }
    }

    get valid() {
        return this.property && HEALTH_WORKER_TYPE.includes(this.property);
    }
};