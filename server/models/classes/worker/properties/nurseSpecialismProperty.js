const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.NurseSpecialismProperty = class NurseSpecialismProperty extends ChangePropertyPrototype {
    constructor() {
        super('NurseSpecialismFK');
    }

    static clone() {
        return new NurseSpecialismProperty();
    }

    async restoreFromJson(document) {
        if (document.nurseSpecialism) {
            const validatedSpecialism = await this._validateSpecialism(document.nurseSpecialism);
            if (validatedSpecialism) {
                this.property = validatedSpecialism;
            } else {
               this.property = null;
            }
        }        
    }

    restorePropertyFromSequelize(document) {
        if (document.nurseSpecialism) {
            return {
                id: document.nurseSpecialism.id,
                name: document.nurseSpecialism.name,
                other: document.nurseSpecialism.other ? document.nurseSpecialism.other : undefined,
            }
        }
    }

    savePropertyToSequelize() {
        return {
            NurseSpecialismFKValue: this.property.id,
            NurseSpecialismFKOther: this.property.other ? this.property.other : null,
        };                
    }
    
    isEqual(currentValue, newValue) {
        return (currentValue && newValue && currentValue.id === newValue.id) && (
            (currentValue.other && newValue.other && currentValue.other === newValue.other) ||
            (!currentValue.other && !newValue.other));
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            return {
                nurseSpecialism: this.property
            };
        }
        
        return {
            nurseSpecialism : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }

    _valid(thisSpecialism) {
        if (!thisSpecialism) return false;

        if (!(thisSpecialism.id || thisSpecialism.name)) return false;

        if (thisSpecialism.id && !(Number.isInteger(thisSpecialism.id))) return false;

        return true;
    }

    async _validateSpecialism(specialismDef) {
        let results = await models.workerNurseSpecialism.findAll({
            order: [
                ["id", "ASC"]
            ]
        });

        if (!results && !Array.isArray(results)) return false;

        if (!this._valid(specialismDef)) {
            return false;
        }

        let referenceSpecialism = null;
        if (specialismDef.id) {
            referenceSpecialism = results.find(thisAllSpecialism => {
                return thisAllSpecialism.id === specialismDef.id;
            });
        } else {
            referenceSpecialism = results.find(thisAllSpecialism => {
                return thisAllSpecialism.name === specialismDef.name;
            });
        }

        if (referenceSpecialism && referenceSpecialism.id) {
            if (referenceSpecialism.other && specialismDef.other && specialismDef.other.length && specialismDef.other.length > OTHER_MAX_LENGTH) {
                return false;
            } else {
                return {
                    id: referenceSpecialism.id,
                    name: referenceSpecialism.name,
                    other: (specialismDef.other && referenceSpecialism.other) ? specialismDef.other : undefined,
                };
            }

        } else {
            return false;
        }
    }


};