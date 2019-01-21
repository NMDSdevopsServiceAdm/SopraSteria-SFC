// the Main Job property is a type being JobId and Title
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

exports.WorkerMainJobProperty = class WorkerMainJobProperty extends ChangePropertyPrototype {
    constructor() {
        super('MainJob', 'MainJobFk');
    }

    static clone() {
        return new WorkerMainJobProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        // TODO: it's a little more than assuming the JSON representation
        if (document.mainJob) {
            const validatedJob = await this._validateJob(document.mainJob);
            if (validatedJob) {
                this.property = validatedJob;
            } else {
                this.property = null;
            }
        }
    }
    restorePropertyFromSequelize(document) {
        if (document.mainJob) {
            return {
                jobId: document.mainJob.id,
                title: document.mainJob.title
            };
        }
    }
    savePropertyToSequelize() {
        return {
            MainJobFkValue: this.property.jobId
        };
    }

    isEqual(currentValue, newValue) {
        // main job is an object where jobId is the primary key
        if (currentValue && newValue && currentValue.jobId === newValue.jobId) return true;
        else return false;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                mainJob: this.property
            }
        } else {
            return {
                mainJob : {
                    currentValue: this.property,
                    ... this.changePropsToJSON(showPropertyHistoryOnly)
                }
            }
        }
    }

    _valid(jobDef) {
        // get reference set of jobs to validate against
        if (!jobDef) return false;

        // must exist a jobId or title
        if (!(jobDef.jobId || jobDef.title)) return false;

        // if jobId is given, it must be an integer
        if (jobDef.jobId && !(Number.isInteger(jobDef.jobId))) return false;

        // gets here, and it's valid
        return true;
    }

    // returns false if job definition is not valid, otherwise returns
    //  a well formed job definition using data as given in jobs reference lookup
    async _validateJob(jobDef) {
        if (!this._valid(jobDef)) return false;

        // jobid overrides title, because jobId is indexed whereas title is not!
        let referenceJob = null;
        if (jobDef.jobId) {
            referenceJob = await models.job.findOne({
                where: {
                    id: jobDef.jobId
                },
                attributes: ['id', 'title'],
            });
        } else {
            referenceJob = await models.job.findOne({
                where: {
                    title: jobDef.title
                },
                attributes: ['id', 'title'],
            });
        }

        if (referenceJob && referenceJob.id) {
            // found a job match
            return {
                jobId: referenceJob.id,
                title: referenceJob.title
            };
        } else {
            return false;
        }
    }
};