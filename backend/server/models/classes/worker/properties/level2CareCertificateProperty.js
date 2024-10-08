// the level 2 care certificate property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const LEVEL_2_CARE_CERTIFICATE_TYPE = ['Yes, completed', 'Yes, started', 'No'];
exports.WorkerLevel2CareCertificateProperty = class WorkerLevel2CareCertificateProperty extends (
  ChangePropertyPrototype
) {
  constructor() {
    super('Level2CareCertificate');
    this._allowNull = true;
  }

  static clone() {
    return new WorkerLevel2CareCertificateProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    const completedInYearSinceLevel2CareCertIntroduced = (year) => {
      const yearLevel2CareCertificateIntroduced = 2024;
      const thisYear = new Date().getFullYear();
      return year >= yearLevel2CareCertificateIntroduced && document.level2CareCertificate.year <= thisYear
        ? true
        : false;
    };

    if (document.level2CareCertificate) {
      if (
        [LEVEL_2_CARE_CERTIFICATE_TYPE[1], LEVEL_2_CARE_CERTIFICATE_TYPE[2]].includes(
          document.level2CareCertificate.value,
        )
      ) {
        this.property = {
          value: document.level2CareCertificate.value,
          year: null,
        };
        return;
      }

      if (document.level2CareCertificate.value === LEVEL_2_CARE_CERTIFICATE_TYPE[0]) {
        if (
          document.level2CareCertificate.year &&
          Number.isInteger(document.level2CareCertificate.year) &&
          completedInYearSinceLevel2CareCertIntroduced(document.level2CareCertificate.year)
        ) {
          this.property = {
            value: document.level2CareCertificate.value,
            year: document.level2CareCertificate.year,
          };
        } else {
          this.property = {
            value: document.level2CareCertificate.value,
            year: null,
          };
        }
        return;
      }
      this.property = null;
    }
  }

  restorePropertyFromSequelize(document) {
    let level2CareCertificate = {
      value: document.Level2CareCertificateValue,
      year: document.Level2CareCertificateYear,
    };
    return level2CareCertificate;
  }

  savePropertyToSequelize() {
    return {
      Level2CareCertificateValue: this.property.value,
      Level2CareCertificateYear:
        this.property.value === 'Yes, completed' && this.property.year ? this.property.year : null,
    };
  }

  isEqual(currentValue, newValue) {
    // not a simple (enum'd) string compare; if "Yes, completed", also need to compare the year (just an integer)

    if (currentValue && newValue && currentValue.value === 'Yes, completed') {
      if (currentValue.year === newValue.year) {
        return currentValue.value === newValue.value;
      }
      return false;
    }

    return currentValue && newValue && currentValue.value === newValue.value;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        level2CareCertificate: this.property,
      };
    }

    return {
      level2CareCertificate: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
