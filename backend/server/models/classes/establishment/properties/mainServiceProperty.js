// the main service property is an FK value property only, that needs validation
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;
const models = require('../../../index');
const OTHER_MAX_LENGTH = 120;

exports.MainServiceProperty = class MainServiceProperty extends ChangePropertyPrototype {
  constructor() {
    super('MainServiceFK');
  }

  static clone() {
    return new MainServiceProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.mainService) {
      const validatedService = await this._validateService(document.mainService);
      if (validatedService) {
        this.property = validatedService;
      } else {
        // main service if defined must be valid
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    if (document.mainService) {
      return {
        id: document.mainService.id,
        name: document.mainService.name,
        other: document.mainService.other ? document.mainService.other : undefined,
      };
    }
  }

  savePropertyToSequelize() {
    // as an FK property, we only store the id
    return {
      MainServiceFKValue: this.property.id,
      MainServiceFkOther: this.property.other ? this.property.other : null,
    };
  }

  isEqual(currentValue, newValue) {
    // employer type is a simple string
    return (
      currentValue &&
      newValue &&
      currentValue.id === newValue.id &&
      ((currentValue.other && newValue.other && currentValue.other === newValue.other) ||
        (!currentValue.other && !newValue.other))
    );
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = false) {
    if (wdfEffectiveDate) {
      return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
    }

    if (!withHistory) {
      // simple form
      return {
        mainService: this.property,
      };
    }

    return {
      mainService: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }

  _valid(thisService) {
    if (!thisService) return false;

    // must exist a id or name
    if (!(thisService.id || thisService.name)) return false;

    // if id is given, it must be an integer
    if (thisService.id && !Number.isInteger(thisService.id)) return false;

    // gets here, and it's valid
    return true;
  }

  // returns false if service definition is not valid, otherwise returns
  //  a well formed service definition using data as given in services reference lookup
  async _validateService(serviceDef) {
    // need the set of all services available
    let results = await models.services.findAll({
      order: [['id', 'ASC']],
    });

    if (!results && !Array.isArray(results)) return false;

    if (!this._valid(serviceDef)) {
      // first check the given data structure
      return false;
    }

    // id overrides service, because id is indexed whereas service is not!
    let referenceService = null;
    if (serviceDef.id) {
      referenceService = results.find((thisAllService) => {
        return thisAllService.id === serviceDef.id;
      });
    } else {
      referenceService = results.find((thisAllService) => {
        return thisAllService.name === serviceDef.name;
      });
    }

    if (referenceService && referenceService.id) {
      // found a service match
      if (
        referenceService.other &&
        serviceDef.other &&
        serviceDef.other.length &&
        serviceDef.other.length > OTHER_MAX_LENGTH
      ) {
        return false;
      } else {
        return {
          id: referenceService.id,
          name: referenceService.name,
          other: serviceDef.other && referenceService.other ? serviceDef.other : undefined,
        };
      }
    } else {
      return false;
    }
  }
};
