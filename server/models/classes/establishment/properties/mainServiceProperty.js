// the main service property is an FK value property only, that needs validation
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;
const models = require('../../../index');

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
            console.log("WA restoring from JSON: ", document.mainService)
            const validatedService = await this._validateService(document.mainService);

            console.log("WA DEBUG - validated main service: ", validatedService)

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
            };
        }
    }
    savePropertyToSequelize() {
        // as an FK property, we only store the id
        return {
            MainServiceFKValue: this.property.id
        };
    }

    isEqual(currentValue, newValue) {
        // employer type is a simple string
        return currentValue && newValue && currentValue.id === newValue.id;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                mainService: this.property
            };
        }
        
        return {
            mainService: {
                currentValue: this.property,
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

    // returns false if service definition is not valid, otherwise returns
    //  a well formed service definition using data as given in services reference lookup
    async _validateService(serviceDef) {
        const validatedService = null;

        // need the set of all services available
        let results = await models.services.findAll({
            order: [
                ["id", "ASC"]
            ]
        });

        if (!results && !Array.isArray(results)) return false;

        if (!this._valid(serviceDef)) {
            // first check the given data structure
            return false;
        }

        // id overrides service, because id is indexed whereas service is not!
        let referenceService = null;
        if (serviceDef.id) {
            referenceService = results.find(thisAllService => {
                return thisAllService.id === serviceDef.id;
            });
        } else {
            referenceService = results.find(thisAllService => {
                return thisAllService.name === serviceDef.name;
            });
        }

        if (referenceService && referenceService.id) {
            // found a service match
            return {
                id: referenceService.id,
                name: referenceService.name,
            };
        } else {
            return false;
        }
    }
};