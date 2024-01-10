// the Services property is a reflextion table that holds the set of 'Other Serices' referenced against the reference set of services
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const ServiceFormatters = require('../../../api/services');

const OTHER_MAX_LENGTH = 120;

const allowedValues = ['Yes', 'No'];

exports.ServicesProperty = class ServicesProperty extends ChangePropertyPrototype {
  constructor() {
    super('OtherServices');

    // other services needs reference to main service and All (Known for this Establishment) Services
    this._mainService = null;
    this._allServices = null;
    this._otherServices = null;
  }

  static clone() {
    return new ServicesProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    // typically, all services (this._allServices) for this `Other Service` property will be set when restoring the establishment and this property from the database
    //  but during bulk upload, the Establishment will be restored from JSON not database. In those situations, this._allServices will be null, and it
    //  will be necessary to populate this._allServices from the given JSON document. When restoring fully from JSON, then the
    //  all services as given fromt he JSON (load) document must take precedence over any stored.
    if (document.allMyServices && Array.isArray(document.allMyServices) && document.mainService) {
      // whilst serialising from JSON other services, make a note of main service and all "other" services
      //  - required in toJSON response and for validation
      this._allServices = this.removeMainService(document.allMyServices, document.mainService);

      if (document.mainService) this._mainService = document.mainService; // can be an empty array
    }
    // if restoring from an Establishment's full JSON presentation, rather than from the establishment/:eid/services endpoint, transform the set of "otherServices" into the required input set of "services"
    if (document.otherServices) {
      document.services = {
        value: document.otherServices.value,
        services: [],
      };
      if (document.otherServices.value === 'Yes') {
        document.otherServices.services.forEach((thisServiceCategory) => {
          thisServiceCategory.services.forEach((thisService) => {
            document.services.services.push({
              id: thisService.id,
            });
          });
        });
      }
    }

    if (document.services) {
      if (document.services.value === 'No' || document.services.value === null) {
        this.property = {
          value: document.services.value,
          services: [],
        };
        return;
      }

      if (
        document.services.value === 'Yes' &&
        Array.isArray(document.services.services) &&
        document.services.services.length > 0
      ) {
        const validatedServices = await this._validateServices(document.services.services);
        const validatedServicesValue = this._validateValue(document.services.value);

        const validatedProperty = {
          value: validatedServicesValue,
          services: validatedServices,
        };

        if (validatedServices && validatedServicesValue) {
          this.property = validatedProperty;
        } else {
          this.property = null;
        }
      }
    }
  }

  removeMainService(allServices, mainService) {
    return allServices ? allServices.filter((refService) => refService.id !== mainService.id) : [];
  }

  restorePropertyFromSequelize(document) {
    const otherServicesDocument = {
      value: document.otherServicesValue,
    };

    // whilst serialising from DB other services, make a note of main service and all "other" services
    //  - required in toJSON response
    this._allServices = this.removeMainService(document.allMyServices, document.mainService);
    this._mainService = document.mainService;

    if (document.otherServicesValue === 'Yes') {
      otherServicesDocument.services = document.otherServices.map((thisService) => {
        return {
          id: thisService.id,
          name: thisService.name,
          category: thisService.category,
          other: thisService.other ? thisService.other : undefined,
        };
      });
    }
    return otherServicesDocument;
  }

  savePropertyToSequelize() {
    const servicesDocument = {
      otherServicesValue: this.property.value,
    };

    // note - only the serviceId is required and that is mapped from the property.services.id; establishmentId will be provided by Establishment class
    if (this.property && Array.isArray(this.property.services)) {
      servicesDocument.additionalModels = {
        establishmentServices: this.property.services.map((thisService) => {
          return {
            serviceId: thisService.id,
            other: thisService.other ? thisService.other : null,
          };
        }),
      };
    }
    return servicesDocument;
  }

  isEqual(currentValue, newValue) {
    let arraysEqual;

    if (
      currentValue &&
      newValue &&
      currentValue.value === 'Yes' &&
      newValue.value === 'Yes' &&
      currentValue.services &&
      newValue.services
    ) {
      if (currentValue.services.length === newValue.services.length) {
        arraysEqual = currentValue.services.every((thisService) => {
          return newValue.services.find(
            (newService) =>
              newService.id === thisService.id &&
              ((thisService.other && newService.other && thisService.other === newService.other) ||
                (!thisService.other && !newService.other)),
          );
        });
      } else {
        arraysEqual = false;
      }
    }
    return currentValue && newValue && currentValue.value === newValue.value && arraysEqual;
  }

  formatOtherServicesResponse(mainService, otherServices, allServices) {
    return {
      mainService: mainService ? ServiceFormatters.singleService(mainService) : undefined,
      otherServices: {
        value: this.property.value ? this.property.value : null,
        services: otherServices.services
          ? ServiceFormatters.createServicesByCategoryJSON(otherServices.services, false, false, false)
          : undefined,
      },
      allOtherServices: allServices
        ? ServiceFormatters.createServicesByCategoryJSON(allServices, false, false, true)
        : undefined,
    };
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = false) {
    if (!withHistory) {
      return this.formatOtherServicesResponse(this._mainService, this.property, this._allServices);
    }

    const result = {
      otherServices: {
        value: this.property.value ? this.property.value : null,
      },
    };
    result.services = ServiceFormatters.createServicesByCategoryJSON(this.property.services, false, false, false);
    return result;
  }

  _valid(thisService) {
    if (!thisService) return false;

    // must exist a id or name
    if (!(thisService.id || thisService.name)) return false;

    // if id is given, it must be an integer
    return !(thisService.id && !Number.isInteger(thisService.id));
  }

  // returns false if service definitions are not valid, otherwise returns
  //  a well formed set of service definitions using data as given in services reference lookup
  async _validateServices(servicesDef) {
    const setOfValidatedServices = [];
    let setOfValidatedServicesInvalid = false;

    // need the set of all services defined and available
    if (this._allServices === null || !Array.isArray(this._allServices)) return false;

    for (let thisService of servicesDef) {
      if (!this._valid(thisService)) {
        // first check the given data structure
        setOfValidatedServicesInvalid = true;
        break;
      }
      // id overrides name, because id is indexed whereas name is not!
      let referenceService = null;
      if (thisService.id) {
        referenceService = this._allServices.find((thisAllService) => {
          return thisAllService.id === thisService.id;
        });
      } else {
        referenceService = this._allServices.find((thisAllService) => {
          return thisAllService.name === thisService.name;
        });
      }

      if (referenceService && referenceService.id) {
        // found a service match - prevent duplicates by checking if the reference service already exists
        if (!setOfValidatedServices.find((thisService) => thisService.id === referenceService.id)) {
          if (
            referenceService.other &&
            thisService.other &&
            thisService.other.length &&
            thisService.other.length > OTHER_MAX_LENGTH
          ) {
            setOfValidatedServicesInvalid = true;
          } else {
            setOfValidatedServices.push({
              id: referenceService.id,
              name: referenceService.name,
              category: referenceService.category,
              other: thisService.other && referenceService.other ? thisService.other : undefined,
            });
          }
        }
      } else {
        setOfValidatedServicesInvalid = true;
        break;
      }
    }

    // if having processed each service correctly, return the set of now validated services
    if (!setOfValidatedServicesInvalid) return setOfValidatedServices;

    return false;
  }

  _validateValue(value) {
    return allowedValues.includes(value) ? value : false;
  }
};
