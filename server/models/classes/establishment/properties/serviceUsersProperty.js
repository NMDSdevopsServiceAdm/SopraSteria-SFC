// the Service Users property is a reflextion table that holds the set of known 'Service Users' referenced against the reference set of "Service Users"
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const ServiceFormatters = require('../../../api/services');

exports.ServiceUsersProperty = class ServiceUsersProperty extends ChangePropertyPrototype {
    constructor() {
        super('OtherServices');
    }

    static clone() {
        return new ServiceUsersProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.services) {
            // can be an empty array
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
            theseServices.forEach(thisService => {
                // find and update the corresponding service in allServices
                let foundService = allServices ? allServices.find(refService => refService.id === thisService.id) : null;
                if (foundService) {
                    foundService.isMyService = true;
                }
            });
        }

        // now remove the main service
        return allServices ? allServices.filter(refService => refService.id !== mainService.id) : [];
    };

    restorePropertyFromSequelize(document) {
        // whilst serialising from DB other services, make a note of main service and all "other" services
        //  - required in toJSON response
        this._allServices = this.mergeServices(
            document.allMyServices,
            document.otherServices,
            document.mainService,
        );
        this._mainService = document.mainService;

        if (document.otherServices) {
            return document.otherServices.map(thisService => {
                return {
                    id: thisService.id,
                    name: thisService.name,
                    category: thisService.category
                };
            });
        }
    }

    savePropertyToSequelize() {
        // when saving other services, there is no "Value" column to update - only reflexion records to delete/create
        const servicesDocument = {
        };

        // note - only the serviceId is required and that is mapped from the property.services.id; establishmentId will be provided by Establishment class
        if (this.property && Array.isArray(this.property)) {
            servicesDocument.additionalModels = {
                establishmentServices: this.property.map(thisService => {
                    return {
                        serviceId: thisService.id
                    };
                })
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
            arraysEqual = currentValue.every(thisService => {
                return newValue.find(newService => newService.id === thisService.id);
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
            otherServices: ServiceFormatters.createServicesByCategoryJSON(otherServices, false, false, false),
            allOtherServices: ServiceFormatters.createServicesByCategoryJSON(allServices, false, false, true),
        };
    }

    toJSON(withHistory = false, showPropertyHistoryOnly = true) {
        if (!withHistory) {
            // simple form
            return this.formatOtherServicesResponse(
                this._mainService,
                this.property,
                this._allServices,
            );
        }

        return {
            otherServices: {
                currentValue: ServiceFormatters.createServicesByCategoryJSON(this.property, false, false, false),
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }

    _valid(thisService) {
        if (!thisService) return false;

        // must exist a id or name
        if (!(thisService.id || thisService.name)) return false;

        // if id is given, it must be an integer
        if (thisService.id && !(Number.isInteger(thisService.id))) return false;

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
                referenceService = this._allServices.find(thisAllService => {
                    return thisAllService.id === thisService.id;
                });
            } else {
                referenceService = this._allServices.find(thisAllService => {
                    return thisAllService.name === thisService.name;
                });
            }

            if (referenceService && referenceService.id) {
                // found a service match - prevent duplicates by checking if the reference service already exists
                if (!setOfValidatedServices.find(thisService => thisService.id === referenceService.id)) {
                    setOfValidatedServices.push({
                        id: referenceService.id,
                        name: referenceService.name,
                        category: referenceService.category
                    });
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