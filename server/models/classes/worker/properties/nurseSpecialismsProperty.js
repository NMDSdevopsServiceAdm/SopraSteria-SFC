const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');
const OTHER_MAX_LENGTH=120;

exports.WorkerNurseSpecialismsProperty = class WorkerNurseSpecialismsProperty extends ChangePropertyPrototype {
    constructor() {
        super('NurseSpecialisms');
    }

    static clone() {
        return new WorkerNurseSpecialismsProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.nurseSpecialisms) {
            if (Array.isArray(document.nurseSpecialisms.specialisms) && document.nurseSpecialisms.specialisms.length > 0 && document.nurseSpecialisms.value === 'Yes') {
                const validatedNurseSpecialisms = await this._validateNurseSpecialisms(document.nurseSpecialisms.specialisms);

                if (validatedNurseSpecialisms) {
                    this.property = {
                        value: document.nurseSpecialisms.value,
                        specialisms: validatedNurseSpecialisms
                    };

                } else {
                    this.property = null;
                }

            } else if (document.nurseSpecialisms.value === 'No' || document.nurseSpecialisms.value === `Don't know`) {
                this.property = {
                    value: document.nurseSpecialisms.value
                };
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
      const nurseSpecialismsDocument = {
        value: document.NurseSpecialismsValue,
      };

      if (document.NurseSpecialismsValue === 'Yes') {
        nurseSpecialismsDocument.specialisms = document.nurseSpecialisms.map(thisSpecialism => {
          return {
            id: thisSpecialism.id,
            specialism: thisSpecialism.specialism,
            other: thisSpecialism.other ? thisSpecialism.other : undefined,
          };
        });
      }

      return nurseSpecialismsDocument;
    }

    savePropertyToSequelize() {
        const nurseSpecialismsDocument = {
          NurseSpecialismsValue: this.property.value
        };

        if (this.property.value === 'Yes') {
          nurseSpecialismsDocument.additionalModels = {
            workerNurseSpecialisms : this.property.specialisms.map(thisSpecialism => {
                return {
                  nurseSpecialismFk: thisSpecialism.id,
                  other: thisSpecialism.other ? thisSpecialism.other : undefined,
                };
            })
          };
        } else {
            nurseSpecialismsDocument.additionalModels = {
              workerNurseSpecialisms: []
            };
        }
        return nurseSpecialismsDocument;
    }

    isEqual(currentValue, newValue) {
        // a simple (enum'd) string compare, but more so, if the current and new values are both yes, then
        //   need also to ensure the arrays are equal (equal in value)
        let arraysEqual = true;

        if (currentValue && newValue && currentValue.value === 'Yes' && newValue.value === 'Yes' &&
            currentValue.specialisms && newValue.specialisms) {
                if (currentValue.specialisms.length == newValue.specialisms.length) {
                    // the preconditions are set to want to compare the array values themselves

                    // we haven't got large arrays here; so simply iterate around every
                    //  current value, and confirm it is in the the new data set.
                    //  Array.every will drop out on the first iteration to return false
                    arraysEqual = currentValue.specialisms.every(thisNurseSpecialism => {
                        return newValue.specialisms.find(newNurseSpecialism => newNurseSpecialism.id === thisNurseSpecialism.id
                            && ((newNurseSpecialism.other === thisNurseSpecialism.other) || (!newNurseSpecialism.other && !thisNurseSpecialism.other)) );
                    });
                } else {
                    // if the arrays are lengths are not equal, then we know they're not equal
                    arraysEqual = false;
                }
        }

        const returnVal = currentValue && newValue && currentValue.value === newValue.value && arraysEqual;
        return returnVal;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
      if (!withHistory) {
        // simple form
        return {
          nurseSpecialisms: {
            value: this.property.value ? this.property.value : null,
            specialisms: this.property.specialisms ? this.property.specialisms : [],
          }
        };
      }

      return {
        nurseSpecialisms: {
          value: this.property.value ? this.property.value : null,
          specialisms: this.property.specialisms ? this.property.specialisms : [],
          ... this.changePropsToJSON(showPropertyHistoryOnly)
        }
      };
    }

    _valid(thisNurseSpecialism) {
        if (!thisNurseSpecialism) return false;

        if (!(thisNurseSpecialism.id || thisNurseSpecialism.specialism)) return false;

        if (thisNurseSpecialism.id && !(Number.isInteger(thisNurseSpecialism.id))) return false;

        return true;
    }

    async _validateNurseSpecialisms(nurseSpecialismsDef) {
        const setOfValidatedNurseSpecialisms = [];
        let setOfValidatedNurseSpecialismsInvalid = false;

        for (let thisNurseSpecialism of nurseSpecialismsDef) {
            if (!this._valid(thisNurseSpecialism)) {
                // first check the given data structure
                setOfValidatedNurseSpecialismsInvalid = true;
                break;
            }

            let referenceNurseSpecialism = null;
            if (thisNurseSpecialism.id) {
              referenceNurseSpecialism = await models.workerNurseSpecialism.findOne({
                    where: {
                        id: thisNurseSpecialism.id
                    },
                    attributes: ['id', 'specialism', 'other'],
                });
            } else {
              referenceNurseSpecialism = await models.workerNurseSpecialism.findOne({
                    where: {
                      specialism: thisNurseSpecialism.specialism
                    },
                    attributes: ['id', 'specialism', 'other'],
                });
            }

            if (referenceNurseSpecialism && referenceNurseSpecialism.id) {
              if (!setOfValidatedNurseSpecialisms.find(thisNurseSpecialism => thisNurseSpecialism.id === referenceNurseSpecialism.id)) {
                    if (!referenceNurseSpecialism.other || referenceNurseSpecialism.other === undefined || !thisNurseSpecialism.other ||
                        (referenceNurseSpecialism.other && thisNurseSpecialism.other && thisNurseSpecialism.other.length <= OTHER_MAX_LENGTH )) {
                          setOfValidatedNurseSpecialisms.push({
                            id: referenceNurseSpecialism.id,
                            specialism: referenceNurseSpecialism.specialism,
                            other: (referenceNurseSpecialism.other && thisNurseSpecialism.other) ? thisNurseSpecialism.other : undefined
                        });
                    } else {
                      setOfValidatedNurseSpecialismsInvalid = true;
                        break;
                    }
                }
            } else {
              setOfValidatedNurseSpecialismsInvalid = true;
                break;
            }
        }

        if (!setOfValidatedNurseSpecialismsInvalid) return setOfValidatedNurseSpecialisms;

        return false;
    }
};
