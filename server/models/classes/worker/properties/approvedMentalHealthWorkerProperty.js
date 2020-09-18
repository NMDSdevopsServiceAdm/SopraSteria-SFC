// the Approved Mental Health Worker property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const HEALTH_WORKER_TYPE = ['Yes', 'No', "Don't know"];
exports.WorkerApprovedMentalHealthWorkerProperty = class WorkerApprovedMentalHealthWorkerProperty extends ChangePropertyPrototype {
  constructor() {
    super('ApprovedMentalHealthWorker');
    this._allowNull = true;
  }

  static clone() {
    return new WorkerApprovedMentalHealthWorkerProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.approvedMentalHealthWorker || document.approvedMentalHealthWorker === null) {
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
      ApprovedMentalHealthWorkerValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // simple (enum'd) string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        approvedMentalHealthWorker: this.property,
      };
    }

    return {
      approvedMentalHealthWorker: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
