// the Main Job property is a type being JobId and Title
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

// database models
const models = require('../../../index');

exports.WorkerMainJobProperty = class WorkerMainJobProperty extends PropertyPrototype {
    constructor(mainJob) {
        super('MainJob');
        super.property = mainJob;
    }

    // concrete implementations
    static async cloneFromJson(document) {
        // TODO: it's a little more than assuming the JSON representation
        if (document.mainJob) {
            const validatedJob = await WorkerMainJobProperty._validateJob(document.mainJob);
            if (validatedJob) {
                return new WorkerMainJobProperty(validatedJob);
            } else {
                // we are expecting to restore a main job property, but it is invalid
                return new WorkerMainJobProperty(null);
            }
        }
    }
    static async cloneFromSequelize(document) {
        if (document.mainJobFk &&
            Number.isInteger(document.mainJobFk) &&
            document.mainJob) {
            return new WorkerMainJobProperty({
                jobId: document.mainJob.id,
                title: document.mainJob.title
            });
        }
    }

    save() {
        if (this.valid) {
            return {
                mainJobFk: this.property.jobId
            };    
        }

        throw new Error('MainJob property is not valid for saving');
    }

    toJSON() {
        return {
            mainJob: this.property
        }
    }

    get valid() {
        return WorkerMainJobProperty._valid(this.property);
    }

    static _valid(jobDef) {
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
    static async _validateJob(jobDef) {
        if (!WorkerMainJobProperty._valid(jobDef)) return false;

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