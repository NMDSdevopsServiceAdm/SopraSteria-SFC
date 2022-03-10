const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const LONG_TERM_ABSENCE_REASONS = ['Maternity leave', 'Paternity leave', 'Illness', 'Injury', 'Other'];
exports.LongTermAbsenceProperty = class LongTermAbsenceProperty extends ChangePropertyPrototype {
    constructor() {
        super('LongTermAbsence');
        this._allowNull = true;
    }

    static clone() {
        return new LongTermAbsenceProperty();
    }

    async restoreFromJson(document) {
        if (document.longTermAbsence) {
            if (LONG_TERM_ABSENCE_REASONS.includes(document.longTermAbsence)) {
                this.property = document.longTermAbsence;
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.LongTermAbsence;
    }
    savePropertyToSequelize() {
        return {
            LongTermAbsence: this.property
        };
    }

    isEqual(currentValue, newValue) {
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

        if (!withHistory) {
            // simple form
            return {
                longTermAbsence: this.property
            };
        }

        return {
            longTermAbsence : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};
