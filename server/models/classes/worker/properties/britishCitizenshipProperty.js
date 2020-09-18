// the British Citizenship property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const CITIZENSHIP_TYPE = ['Yes', 'No', "Don't know"];
exports.WorkerBritishCitizenshipProperty = class WorkerBritishCitizenshipProperty extends ChangePropertyPrototype {
  constructor() {
    super('BritishCitizenship');
    this._allowNull = true;
  }

  static clone() {
    return new WorkerBritishCitizenshipProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.britishCitizenship || document.britishCitizenship === null) {
      if (CITIZENSHIP_TYPE.includes(document.britishCitizenship)) {
        this.property = document.britishCitizenship;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.BritishCitizenshipValue;
  }
  savePropertyToSequelize() {
    return {
      BritishCitizenshipValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // a simple (enum'd) string compare
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        britishCitizenship: this.property,
      };
    }

    return {
      britishCitizenship: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
