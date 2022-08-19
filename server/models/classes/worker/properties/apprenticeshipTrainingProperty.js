// the apprenticeship training property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const APPRENTICESHIP_TYPE = ['Yes', 'No', 'Don\'t know'];
exports.WorkerApprenticeshipTrainingProperty = class WorkerApprenticeshipTrainingProperty extends ChangePropertyPrototype {
    constructor() {
        super('ApprenticeshipTraining');
        this._allowNull = true;
    }

    static clone() {
        return new WorkerApprenticeshipTrainingProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.apprenticeshipTraining || document.apprenticeshipTraining === null) {
            if (APPRENTICESHIP_TYPE.includes(document.apprenticeshipTraining)) {
                this.property = document.apprenticeshipTraining;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.ApprenticeshipTrainingValue;
    }
    savePropertyToSequelize() {
        return {
            ApprenticeshipTrainingValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // Apprenticeship Training is a simple (enum'd) string
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                apprenticeshipTraining: this.property
            };
        }

        return {
            apprenticeshipTraining : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
