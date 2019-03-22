// the Vacanies property is an enum and reflextion table that holds the set of 'Vacancies' referenced against the reference set of jobs
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

exports.VacanciesProperty = class VacanciesProperty extends ChangePropertyPrototype {
    constructor() {
        super('Vacancies');
    }

    static clone() {
        return new VacanciesProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.vacancies) {
            const jobDeclaration = ["None", "Don't know"];
            // can be an empty array
            if (Array.isArray(document.vacancies)) {
                const validatedJobs = await this._validateJobs(document.vacancies);

                if (validatedJobs) {
                    this.property = validatedJobs;

                } else {
                    this.property = null;
                }
            } else if (jobDeclaration.includes(document.vacancies)) {
                this.property = document.vacancies;
            } else {
                // but it must at least be an array, or one of the known enums
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {

        if (document.jobs) {
            // we're only interested in Vacancy jobs
            const restoredProperty = document.localAuthorities.map(thisAuthority => {
                return {
                    id: thisAuthority.id,
                    cssrId: thisAuthority.cssrId,
                    name: thisAuthority.cssr
                };
            });
            return restoredProperty;
        }
    }

    savePropertyToSequelize() {
        // when saving local authorities, there is no "Value" column to update - only reflexion records to delete/create
        const LAsDocument = {
        };

        // note - only the CSSR id (custodian code) and CSSR name (name) is required
        if (this.property && Array.isArray(this.property)) {
            LAsDocument.additionalModels = {
                establishmentLocalAuthority: this.property.map(thisAuthority => {
                    return {
                        cssrId: thisAuthority.cssrId,
                        cssr: thisAuthority.name
                    };
                })
            };
        }

        return LAsDocument;
    }

    isEqual(currentValue, newValue) {
        // need to compare arrays
        let arraysEqual = true;

        if (currentValue && newValue && currentValue.length == newValue.length) {
            // the preconditions are sets are equal in length; compare the array values themselves

            // we haven't got large arrays here; so simply iterate around every
            //  current value, and confirm it is in the the new data set.
            //  Array.every will drop out on the first iteration to return false
            arraysEqual = currentValue.every(thisAuthority => {
                return newValue.find(thatAuthority => thatAuthority.custodianCode === thisAuthority.custodianCode);
            });
        } else {
            // if the arrays are lengths are not equal, then we know they're not equal
            arraysEqual = false;
        }

        return arraysEqual;
    }

    formatLAResponse(localAuthorities, primaryAuthority=null) {
        const response = {
          localAuthorities: LaFormatters.listOfLAsJSON(localAuthorities,
                                                       primaryAuthority && primaryAuthority.id ? primaryAuthority.id : null)
        };
      
        if (primaryAuthority) {
          response.primaryAuthority = {
            custodianCode: parseInt(primaryAuthority.id),
            name: primaryAuthority.name
          }
        }
      
        return response;
    }

    toJSON(withHistory = false, showPropertyHistoryOnly = true) {
        if (!withHistory) {
            // simple form
            return this.formatLAResponse(this.property, this._primaryAutority);
        }

        return {
            localAuthorities: {
                currentValue: LaFormatters.listOfLAsJSON(this.property,
                    this._primaryAuthority && this._primaryAuthority.id ? this._primaryAuthority.id : null),
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }

    _valid(thisLA) {
        if (!thisLA) return false;

        // must exist a custodian or name
        if (!(thisLA.custodianCode || thisLA.name)) return false;

        // if custodian code is given, it must be an integer
        if (thisLA.custodianCode && !(Number.isInteger(thisLA.custodianCode))) return false;

        // gets here, and it's valid
        return true;
    }

    // returns false if service definitions are not valid, otherwise returns
    //  a well formed set of service definitions using data as given in services reference lookup
    async _validateLAs(laDefs) {
        const setOfValidatedLAs = [];
        let setOfValidatedLAsInvalid = false;

        // need a set of LAs (CSSRs) to validate against
        const allLAs =  await models.cssr.findAll({
            attributes: ['id', 'name'],
            group: ['id', 'name'],
            order: [
              ['name', 'ASC']
            ]
        });
        if (!allLAs) {
            console.error('shareWithLAProperty::_validateLAs - unable to retrieve all known local authorities');
            return false;
        }

        for (let thisLA of laDefs) {
            if (!this._valid(thisLA)) {
                // first check the given data structure
                setOfValidatedLAsInvalid = true;
                break;
            }

            // custodian code overrides name, because custodian code is indexed whereas name is not!
            let referenceLA = null;
            if (thisLA.custodianCode) {
                referenceLA = allLAs.find(thisla => {
                    return thisla.id === thisLA.custodianCode;
                });
            } else {
                referenceLA = allLAs.find(thisla => {
                    return thisla.name === thisLA.name;
                });
            }

            if (referenceLA && referenceLA.id) {
                // found a service match - prevent duplicates by checking if the reference service already exists
                if (!setOfValidatedLAs.find(thisLA => thisLA.custodianCode === referenceLA.id)) {
                    setOfValidatedLAs.push({
                        cssrId: referenceLA.id,
                        name: referenceLA.name
                    });
                }
            } else {
                setOfValidatedLAsInvalid = true;
                break;
            }

        }

        // if having processed each service correctly, return the set of now validated services
        if (!setOfValidatedLAsInvalid) return setOfValidatedLAs;

        return false;
    }

};