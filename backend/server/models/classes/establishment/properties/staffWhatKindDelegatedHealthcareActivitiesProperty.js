const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const models = require('../../../index');

const [YES, DONT_KNOW, NULL] = ['Yes', "Don't know", null];

exports.StaffWhatKindDelegatedHealthcareActivitiesProperty = class StaffWhatKindDelegatedHealthcareActivitiesProperty extends (
  ChangePropertyPrototype
) {
  constructor() {
    super('StaffWhatKindDelegatedHealthcareActivities');
    this._allowNull = true;
    this._isValid;
  }

  static clone() {
    return new StaffWhatKindDelegatedHealthcareActivitiesProperty();
  }

  async restoreFromJson(document) {
    const propertyInDocument = document.staffWhatKindDelegatedHealthcareActivities;

    if (!propertyInDocument) {
      return;
    }

    if (propertyInDocument.whatDelegateHealthcareActivities === YES) {
      const activities = await this._validateActivities(propertyInDocument.activities);

      this.property = {
        whatDelegateHealthcareActivities: YES,
        activities,
      };
      return;
    } else if (
      propertyInDocument.whatDelegateHealthcareActivities === DONT_KNOW ||
      propertyInDocument.whatDelegateHealthcareActivities === NULL
    ) {
      this.property = {
        whatDelegateHealthcareActivities: propertyInDocument.whatDelegateHealthcareActivities,
        activities: null,
      };
      return;
    }

    this.property = null;
    this._isValid = false;
    return;
  }

  get valid() {
    if (!super.valid) {
      return false;
    }
    return this._isValid ?? true;
  }

  async _validateActivities(activities) {
    if (!activities || !Array.isArray(activities) || activities.length < 1) {
      return null;
    }
    const activitiesIds = activities.map((activitiy) => activitiy.id);

    const validActivitiesFound = await models.delegatedHealthcareActivities.findAll({
      attributes: ['id', 'title', 'description'],
      where: { id: activitiesIds },
      order: [['seq', 'ASC']],
      raw: true,
    });

    if (validActivitiesFound.length !== activities.length) {
      this._isValid = false;
      return null;
    }

    return validActivitiesFound;
  }

  savePropertyToSequelize() {
    if (!this.property) {
      return {
        staffWhatKindDelegatedHealthcareActivities: this.property,
        additionalModels: { EstablishmentDHActivities: [] },
      };
    }

    const { whatDelegateHealthcareActivities, activities } = this.property;

    if (whatDelegateHealthcareActivities === DONT_KNOW || !Array.isArray(activities)) {
      return {
        staffWhatKindDelegatedHealthcareActivities: whatDelegateHealthcareActivities,
        additionalModels: { EstablishmentDHActivities: [] },
      };
    }

    const dHActivities = activities.map((activity) => {
      return {
        delegatedHealthcareActivitiesID: activity.id,
      };
    });

    return {
      staffWhatKindDelegatedHealthcareActivities: whatDelegateHealthcareActivities,
      additionalModels: { EstablishmentDHActivities: dHActivities },
    };
  }

  isEqual(currentValue, newValue) {
    if (!currentValue?.whatDelegateHealthcareActivities || !newValue?.whatDelegateHealthcareActivities) {
      return currentValue === newValue;
    }

    switch (currentValue.whatDelegateHealthcareActivities) {
      case DONT_KNOW: {
        return currentValue.whatDelegateHealthcareActivities === newValue.whatDelegateHealthcareActivities;
      }

      case YES: {
        if (currentValue.whatDelegateHealthcareActivities !== newValue.whatDelegateHealthcareActivities) {
          return false;
        }

        return this._compareActivities(currentValue.activities, newValue.activities);
      }

      default: {
        return false;
      }
    }
  }

  _compareActivities(currentActivities, newActivities) {
    if (!Array.isArray(currentActivities) || !Array.isArray(newActivities)) {
      return currentActivities === newActivities;
    }

    if (currentActivities.length !== newActivities.length) {
      return false;
    }

    const allActivitiesMatches = newActivities.every((newValueActivity) => {
      return currentActivities.some((currentValueActivity) => newValueActivity.id === currentValueActivity.id);
    });

    return allActivitiesMatches;
  }

  toJSON(withHistory = false) {
    if (!withHistory) {
      return {
        staffWhatKindDelegatedHealthcareActivities: this.property,
      };
    }

    return {
      staffWhatKindDelegatedHealthcareActivities: {
        currentValue: this.property,
      },
    };
  }

  restorePropertyFromSequelize(document) {
    const staffWhatKindDHA = document.staffWhatKindDelegatedHealthcareActivities;

    if (staffWhatKindDHA === YES) {
      return {
        whatDelegateHealthcareActivities: 'Yes',
        activities: document.delegatedHealthcareActivities?.length ? document.delegatedHealthcareActivities : null,
      };
    } else if (staffWhatKindDHA === DONT_KNOW) {
      return {
        whatDelegateHealthcareActivities: "Don't know",
        activities: null,
      };
    } else if (!staffWhatKindDHA) {
      return null;
    }
  }
};
