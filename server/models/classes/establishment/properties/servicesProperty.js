// the Services property is a reflextion table that holds the set of 'Other Serices' referenced against the reference set of services
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const ServiceFormatters = require('../../../api/services');

const OTHER_MAX_LENGTH = 120;

exports.ServicesProperty = class ServicesProperty extends ChangePropertyPrototype {
  constructor() {
    super('OtherServices');

    // other services needs reference to main service and All (Known for this Establishment) Services
    this._mainService = null;
    this._allServices = null;
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
      this._allServices = this.mergeServices(document.allMyServices, document.otherServices, document.mainService);

      if (document.mainService) this._mainService = document.mainService; // can be an empty array
    }

    // if restoring from an Establishment's full JSON presentation, rather than from the establishment/:eid/services endpoint, transform the set of "otherServices" into the required input set of "services"
    if (document.otherServices) {
      if (Array.isArray(document.otherServices)) {
        document.services = [];
        document.otherServices.forEach((thisServiceCategory) => {
          thisServiceCategory.services.forEach((thisService) => {
            document.services.push({
              id: thisService.id,
            });
          });
        });
      }
    }

    if (document.services) {
      if (Array.isArray(document.services)) {
        const validatedServices = await this._validateServices(document.services);

        if (validatedServices) {
          this.property = validatedServices;
        } else {
          this.property = null;
        }
      } else {
        this.property = null;
      }
    }
  }

  // this method takes all services available to this given establishment and merges those services already registered
  //  against this Establishment, whilst also removing the main service
  mergeServices(allServices, theseServices, mainService) {
    // its a simple case of working through each of "theseServices", and setting the "isMyService"
    if (theseServices && Array.isArray(theseServices)) {
      theseServices.forEach((thisService) => {
        // find and update the corresponding service in allServices
        let foundService = allServices ? allServices.find((refService) => refService.id === thisService.id) : null;
        if (foundService) {
          foundService.isMyService = true;
        }
      });
    }

    // now remove the main service
    return allServices ? allServices.filter((refService) => refService.id !== mainService.id) : [];
  }

  restorePropertyFromSequelize(document) {
    // whilst serialising from DB other services, make a note of main service and all "other" services
    //  - required in toJSON response
    this._allServices = this.mergeServices(document.allMyServices, document.otherServices, document.mainService);
    this._mainService = document.mainService;

    if (document.OtherServicesSavedAt && document.otherServices) {
      return document.otherServices.map((thisService) => {
        return {
          id: thisService.id,
          name: thisService.name,
          category: thisService.category,
          other: thisService.other ? thisService.other : undefined,
        };
      });
    }
  }

  savePropertyToSequelize() {
    // when saving other services, there is no "Value" column to update - only reflexion records to delete/create
    const servicesDocument = {};

    // note - only the serviceId is required and that is mapped from the property.services.id; establishmentId will be provided by Establishment class
    if (this.property && Array.isArray(this.property)) {
      servicesDocument.additionalModels = {
        establishmentServices: this.property.map((thisService) => {
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
    // need to compare arrays
    let arraysEqual = true;

    if (currentValue && newValue && currentValue.length == newValue.length) {
      // the preconditions are sets are equal in length; compare the array values themselves

      // we haven't got large arrays here; so simply iterate around every
      //  current value, and confirm it is in the the new data set.
      //  Array.every will drop out on the first iteration to return false
      arraysEqual = currentValue.every((thisService) => {
        return newValue.find(
          (newService) =>
            newService.id === thisService.id &&
            ((thisService.other && newService.other && thisService.other === newService.other) ||
              (!thisService.other && !newService.other)),
        );
      });
    } else {
      // if the arrays are lengths are not equal, then we know they're not equal
      arraysEqual = false;
    }

    return arraysEqual;
  }

  formatOtherServicesResponse(mainService, otherServices, allServices) {
    return {
      mainService: ServiceFormatters.singleService(mainService),
      otherServices: otherServices
        ? ServiceFormatters.createServicesByCategoryJSON(otherServices, false, false, false)
        : undefined,
      allOtherServices: ServiceFormatters.createServicesByCategoryJSON(allServices, false, false, true),
    };
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = false) {
    if (!withHistory) {
      // simple form
      return this.formatOtherServicesResponse(this._mainService, this.property, this._allServices);
    }

    return {
      otherServices: {
        currentValue: ServiceFormatters.createServicesByCategoryJSON(this.property, false, false, false),
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
};
