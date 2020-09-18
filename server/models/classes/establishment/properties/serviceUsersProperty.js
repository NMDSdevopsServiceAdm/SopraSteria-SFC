// the Service Users property is a reflextion table that holds the set of known 'Service Users' referenced against the reference set of "Service Users"
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const models = require('../../../index');

exports.ServiceUsersProperty = class ServiceUsersProperty extends ChangePropertyPrototype {
  constructor() {
    super('ServiceUsers');
  }

  static clone() {
    return new ServiceUsersProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.serviceUsers) {
      // can be an empty array
      if (Array.isArray(document.serviceUsers)) {
        const validatedServices = await this._validateServices(document.serviceUsers);

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

  restorePropertyFromSequelize(document) {
    if (document.ServiceUsersSavedAt !== null && document.serviceUsers) {
      const restoredRecords = document.serviceUsers.map((thisService) => {
        return {
          id: thisService.id,
          service: thisService.service,
          group: thisService.group,
          other: thisService.other ? thisService.other : undefined,
        };
      });
      return restoredRecords;
    }
  }

  savePropertyToSequelize() {
    // when saving service users, there is no "Value" column to update - only reflexion records to delete/create
    const servicesDocument = {};

    // note - only the serviceId is required and that is mapped from the property.services.id; establishmentId will be provided by Establishment class
    if (this.property && Array.isArray(this.property)) {
      servicesDocument.additionalModels = {
        establishmentServiceUsers: this.property.map((thisService) => {
          return {
            serviceUserId: thisService.id,
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

  formatServiceUsersResponse(allServices) {
    return this.property.map((thisService) => {
      return {
        id: thisService.id,
        group: thisService.group,
        service: thisService.service,
        other: thisService.other ? thisService.other : undefined,
      };
    });
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = false) {
    if (wdfEffectiveDate) {
      return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
    }

    if (!this.property) return null;

    if (!withHistory) {
      // simple form
      return {
        serviceUsers: this.formatServiceUsersResponse(this.property),
      };
    }

    return {
      serviceUsers: {
        currentValue: this.formatServiceUsersResponse(this.property),
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }

  _valid(thisService) {
    if (!thisService) return false;

    // must exist a id or service
    if (!(thisService.id || thisService.service)) return false;

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

    // need the set of all services available
    let results = await models.serviceUsers.findAll({
      order: [['seq', 'ASC']],
    });

    if (!results && !Array.isArray(results)) return false;

    for (let thisService of servicesDef) {
      if (!this._valid(thisService)) {
        // first check the given data structure
        setOfValidatedServicesInvalid = true;
        break;
      }

      // id overrides service, because id is indexed whereas service is not!
      let referenceService = null;
      if (thisService.id) {
        referenceService = results.find((thisAllService) => {
          return thisAllService.id === thisService.id;
        });
      } else {
        referenceService = results.find((thisAllService) => {
          return thisAllService.service === thisService.service;
        });
      }

      const OTHER_MAX_LENGTH = 120;
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
              service: referenceService.service,
              group: referenceService.group,
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
