// the Ethncity property is a type being Ethnicity Id and Ethnicity
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

exports.WorkerEthnicityProperty = class WorkerEthnicityProperty extends ChangePropertyPrototype {
    constructor() {
        super('Ethnicity', 'EthnicityFk');
    }

    static clone() {
        return new WorkerEthnicityProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        // TODO: it's a little more than assuming the JSON representation
        if (document.ethnicity) {
            const validatedEthnicity = await this._validateEthnicity(document.ethnicity);
            if (validatedEthnicity) {
                this.property = validatedEthnicity;
            } else {
                this.property = null;
            }
        }
    }
    restorePropertyFromSequelize(document) {
        if (document.ethnicity) {
            return {
                ethnicityId: document.ethnicity.id,
                ethnicity: document.ethnicity.ethnicity
            };
        }
    }
    savePropertyToSequelize() {
        return {
            EthnicityFkValue: this.property.ethnicityId
        };
    }

    isEqual(currentValue, newValue) {
        // main job is an object where ethnicityId is the primary key
        return currentValue && newValue && currentValue.ethnicityId === newValue.ethnicityId;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                ethnicity: this.property
            };
        }
        
        return {
            ethnicity : {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }

    _valid(ethnicityDef) {
        // get reference set of jobs to validate against
        if (!ethnicityDef) return false;

        // must exist a jobId or title
        if (!(ethnicityDef.ethnicityId || ethnicityDef.ethnicity)) return false;

        // if ethnicityId is given, it must be an integer
        if (ethnicityDef.ethnicityId && !(Number.isInteger(ethnicityDef.ethnicityId))) return false;

        // gets here, and it's valid
        return true;
    }

    // returns false if ethnicity definition is not valid, otherwise returns
    //  a well formed job definition using data as given in ethnicity reference lookup
    async _validateEthnicity(ethnicityDef) {
        if (!this._valid(ethnicityDef)) return false;

        // ethnicityId overrides title, because ethnicityId is indexed whereas ethnicity is not!
        let referenceJob = null;
        if (ethnicityDef.ethnicityId) {
            referenceJob = await models.ethnicity.findOne({
                where: {
                    id: ethnicityDef.ethnicityId
                },
                attributes: ['id', 'ethnicity'],
            });
        } else {
            referenceJob = await models.ethnicity.findOne({
                where: {
                    ethnicity: ethnicityDef.ethnicity
                },
                attributes: ['id', 'ethnicity'],
            });
        }

        if (referenceJob && referenceJob.id) {
            // found a job match
            return {
                ethnicityId: referenceJob.id,
                ethnicity: referenceJob.ethnicity
            };
        } else {
            return false;
        }
    }
};