// the Nationality property is a type being both a local value and a lookup on 'other' having Nationality Id and Nationality
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

const KNOWN_NATIONALITIES = ['British', 'Other', "Don't know"];
exports.WorkerNationalityProperty = class WorkerNationalityProperty extends ChangePropertyPrototype {
    constructor() {
        super('Nationality');
    }

    static clone() {
        return new WorkerNationalityProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        // it's a little more than assuming the JSON representation
        // There is the Worker value, and an additional lookup against Nationality if the local value is "other"
        if (document.nationality) {
            if (KNOWN_NATIONALITIES.includes(document.nationality.value)) {
                // if the given nationality is other, then need to resolve on the given nationality
                if (document.nationality.value === 'Other') {

                    // https://trello.com/c/CqgkWzya - nationalitty "other" value is optional
                    if (document.nationality.other) {
                        const validatedNationality = await this._validateNationality(document.nationality.other);
                        if (validatedNationality) {
                            this.property = {
                                value: document.nationality.value,
                                other: {
                                    nationalityId: validatedNationality.nationalityId,
                                    nationality: validatedNationality.nationality
                                }
                            };
                        } else {
                            // invalid other nationality defintion - fails
                            this.property = null;
                        }
                    } else {
                        this.property = {
                            value: document.nationality.value
                        };
                    }
                } else {
                    this.property = {
                        value: document.nationality.value
                    };
                }
            } else {
                this.property = null;
            }
        }
    }
    restorePropertyFromSequelize(document) {
        // There is the Worker value, and an additional lookup against Nationality if the local value is "other"
        if (document.NationalityValue) {
            const nationality = {
                value: document.NationalityValue,
            };

            if (document.NationalityValue === 'Other' && document.nationality) {
                nationality.other = {
                    nationalityId: document.nationality.id,
                    nationality: document.nationality.nationality
                };
            }
            return nationality;
        }
    }
    savePropertyToSequelize() {
        // Nationality is more than just a value or an fk; it can be both, if the value is 'other'
        const nationalityRecord = {
            NationalityValue: this.property.value
        };

        if (this.property.value === 'Other' && this.property.other) {
            nationalityRecord.NationalityOtherFK = this.property.other.nationalityId;
        } else {
            // reset other nationality lookup if not Other
            nationalityRecord.NationalityOtherFK = null;
        }
        return nationalityRecord;
    }

    isEqual(currentValue, newValue) {
        // nationality is an object having value and optional nationality lookup (by id)
        let nationalityEqual = false;
        if (currentValue && newValue && currentValue.value === 'Other') {
            if (!currentValue.other && !newValue.other && currentValue.value === newValue.value) {
                // if neither current and new "other" value don't exist and both current and new values are both other, then they are equal
                nationalityEqual = true;
            } else if (currentValue.other && newValue.other && currentValue.other.nationalityId == newValue.other.nationalityId) {
                nationalityEqual = true;
            }
        } else {
            nationalityEqual = true;
        }

        return currentValue && newValue && currentValue.value === newValue.value && nationalityEqual;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

        if (!withHistory) {
            // simple form
            return {
                nationality: this.property
            };
        }

        return {
            nationality : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }

    _valid(nationalityDef) {
        if (!nationalityDef) return false;

        // must exist a nationalityId or nationality
        if (!(nationalityDef.nationalityId || nationalityDef.nationality)) return false;

        // if nationalityId is given, it must be an integer
        if (nationalityDef.nationalityId && !(Number.isInteger(nationalityDef.nationalityId))) return false;

        // gets here, and it's valid
        return true;
    }

    // returns false if nationality definition is not valid, otherwise returns
    //  a well formed nationality definition using data as given in nationality reference lookup
    async _validateNationality(nationalityDef) {
        if (!this._valid(nationalityDef)) return false;

        // nationalityId overrides nationality, because nationalityId is indexed whereas nationality is not!
        let referenceNationality = null;
        if (nationalityDef.nationalityId) {
            referenceNationality = await models.nationality.findOne({
                where: {
                    id: nationalityDef.nationalityId
                },
                attributes: ['id', 'nationality'],
            });
        } else {
            referenceNationality = await models.nationality.findOne({
                where: {
                    nationality: nationalityDef.nationality
                },
                attributes: ['id', 'nationality'],
            });
        }

        if (referenceNationality && referenceNationality.id) {
            // found a nationality match
            return {
                nationalityId: referenceNationality.id,
                nationality: referenceNationality.nationality
            };
        } else {
            return false;
        }
    }
};