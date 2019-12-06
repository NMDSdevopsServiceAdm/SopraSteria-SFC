const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;
const models = require('../../../index');

const OTHER_MAX_LENGTH=120;

exports.NurseSpecialismProperty = class NurseSpecialismProperty extends ChangePropertyPrototype {
    constructor() {
        super('NurseSpecialism', 'NurseSpecialismFK');
        this._allowNull = true;
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
                specialism: document.nurseSpecialism.specialism,
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

        if (thisSpecialism.id === null && thisSpecialism.specialism === null) return true;

        if (!(thisSpecialism.id || thisSpecialism.specialism)) return false;

        if (thisSpecialism.id && !(Number.isInteger(thisSpecialism.id))) return false;

        return true;
    }

    async _validateSpecialism(specialismDef) {
        if (!this._valid(specialismDef)) return false;

        let referenceSpecialism = null;
        if (specialismDef.id) {
            referenceSpecialism = await models.workerNurseSpecialism.findOne({
                where: {
                    id: specialismDef.id
                },
                attributes: ['id', 'specialism'],
            });
        } else {
            referenceSpecialism = await models.workerNurseSpecialism.findOne({
                where: {
                    specialism: specialismDef.specialism
                },
                attributes: ['id', 'specialism'],
            });
        }

        if (referenceSpecialism && referenceSpecialism.id) {
            return {
                id: referenceSpecialism.id,
                specialism: referenceSpecialism.specialism
            };
        }

        if (specialismDef.id === null) {
          return specialismDef;
        } else {
            return false;
        }
    }


};
