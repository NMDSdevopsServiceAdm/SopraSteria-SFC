// the Approved Mental Health Worker property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const HEALTH_WORKER_TYPE = ['Yes', 'No', "Don't know"];
exports.WorkerApprovedMentalHealthWorkerProperty = class WorkerApprovedMentalHealthWorkerProperty extends ChangePropertyPrototype {
    constructor() {
        super('ApprovedMentalHealthWorker');
    }

    static clone() {
        return new WorkerApprovedMentalHealthWorkerProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.approvedMentalHealthWorker) {
            if (HEALTH_WORKER_TYPE.includes(document.approvedMentalHealthWorker)) {
                this.property = document.approvedMentalHealthWorker;
            } else {
                this.property = null;
            }
        }
    }
    async restoreFromSequelize(document) {
        if (document.approvedMentalHealthWorker) {
            this.property = document.approvedMentalHealthWorker;
            this.reset();
        }
    }

    get isEqual() {
        // TODO
        return true;
    }

    save() {
        return {
            approvedMentalHealthWorker: this.property
        }
    }

    toJSON() {
        return {
            approvedMentalHealthWorker: this.property
        }
    }
};