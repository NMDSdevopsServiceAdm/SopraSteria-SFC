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

    restorePropertyFromSequelize(document) {
        return document.ApprovedMentalHealthWorkerValue;
    }
    savePropertyToSequelize() {
        return {
            ApprovedMentalHealthWorkerValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // simple (enum'd) string
        if (currentValue && newValue && currentValue === newValue) return true;
        else return false;
    }


    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                approvedMentalHealthWorker: this.property
            }
        } else {
            return {
                approvedMentalHealthWorker : {
                    currentValue: this.property,
                    ... this.changePropsToJSON(showPropertyHistoryOnly)
                }
            }
        }
    }
};