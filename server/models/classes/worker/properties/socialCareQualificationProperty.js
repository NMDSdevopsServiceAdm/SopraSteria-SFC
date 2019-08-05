// the Social Care Qualification (property is a type being Qualification Id and Level
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

exports.WorkerSocialCareQualificationProperty = class WorkerSocialCareQualificationProperty extends ChangePropertyPrototype {
    constructor() {
        super('SocialCareQualification', 'SocialCareQualificationFk');
        this._wdfTemporal = false;         
    }

    static clone() {
        return new WorkerSocialCareQualificationProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        // TODO: it's a little more than assuming the JSON representation
        if (document.socialCareQualification) {
            const validatedQualification = await this._validateQualification(document.socialCareQualification);
            if (validatedQualification) {
                this.property = validatedQualification;
            } else {
                this.property = null;
            }
        }
    }
    restorePropertyFromSequelize(document) {
        if (document.socialCareQualification) {
            return {
                qualificationId: document.socialCareQualification.id,
                title: document.socialCareQualification.level
            };
        }
    }
    savePropertyToSequelize() {
        return {
            SocialCareQualificationFkValue: this.property.qualificationId
        };
    }

    isEqual(currentValue, newValue) {
        // qualification is an object where qualificationId is the primary key
        return currentValue && newValue && currentValue.qualificationId === newValue.qualificationId;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false ) {
        if (wdfEffectiveDate) {
            return {
                socialCareQualification: {
                    value: this.property,
                    updatedSinceWDFEffectiveDate: this._wdfTemporal ? this._savedAt > wdfEffectiveDate ? true : false : false
                }
            };
        }   

        if (!withHistory) {
            // simple form
            return {
                socialCareQualification: this.property
            };
        }
        
        return {
            socialCareQualification : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }

    _valid(qualificationDef) {
        if (!qualificationDef) return false;

        // must exist a qualificationId or title
        if (!(qualificationDef.qualificationId || qualificationDef.title)) return false;

        // if qualificationId is given, it must be an integer
        if (qualificationDef.qualificationId && !(Number.isInteger(qualificationDef.qualificationId))) return false;

        // gets here, and it's valid
        return true;
    }

    // returns false if qualification definition is not valid, otherwise returns
    //  a well formed qualification definition using data as given in qualification reference lookup
    async _validateQualification(qualificationDef) {
        if (!this._valid(qualificationDef)) return false;

        // qualificationId overrides title, because qualificationId is indexed whereas title is not!
        let referencedQualification = null;
        if (qualificationDef.qualificationId) {
            referencedQualification = await models.qualification.findOne({
                where: {
                    id: qualificationDef.qualificationId
                },
                attributes: ['id', 'level'],
            });
        } else {
            referencedQualification = await models.qualification.findOne({
                where: {
                    level: qualificationDef.title
                },
                attributes: ['id', 'level'],
            });
        }

        if (referencedQualification && referencedQualification.id) {
            // found a qualification match
            return {
                qualificationId: referencedQualification.id,
                title: referencedQualification.level
            };
        } else {
            return false;
        }
    }
};