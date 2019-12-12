// the Other Jobs property is an enumeration, but in addition a reflextion table that holds the set of 'Other Jobs' referenced against the reference set of jobs
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');
const OTHER_MAX_LENGTH=120;

exports.WorkerOtherJobsProperty = class WorkerOtherJobsProperty extends ChangePropertyPrototype {
    constructor() {
        super('OtherJobs');
    }

    static clone() {
        return new WorkerOtherJobsProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.otherJobs) {
            if (Array.isArray(document.otherJobs.jobs) && document.otherJobs.jobs.length > 0 && document.otherJobs.value === 'Yes') {
                const validatedJobs = await this._validateJobs(document.otherJobs.jobs);

                if (validatedJobs) {
                    this.property = {
                        ...document.otherJobs
                    };

                } else {
                    this.property = null;
                }

            } else if (Array.isArray(document.otherJobs) && document.otherJobs.value === 'No') {
                // other jobs property needs to be an array of
                this.property = {
                    value: 'No'
                };
            } else {
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        const otherJobsDocument = {
            value: document.OtherJobsValue,
        };

        if (document.OtherJobsValue === 'Yes') {
            otherJobsDocument.jobs = document.otherJobs.map(thisJob => {
                return {
                    jobId: thisJob.workerJobs.jobFk,
                    title: thisJob.title,
                    other: thisJob.workerJobs.other ? thisJob.workerJobs.other : undefined
                };
            });
        }

        return otherJobsDocument;
    }
    savePropertyToSequelize() {
        const otherJobsDocument = {
            OtherJobsValue: this.property.value
        };

        // note - only the jobFk is required and that is mapped from the otherJobs.jobId; workerFk will be provided by Worker class
        if (this.property.value === 'Yes') {
            otherJobsDocument.additionalModels = {
                workerJobs : this.property.jobs.map(thisJob => {
                    return {
                        jobFk : thisJob.jobId,
                        other: thisJob.other ? thisJob.other : null
                    };
                })
            };
        } else {
            // need to reset any old WorkerJob records to empty (this forcing a delete of any old jobs that may be hanging around)
            otherJobsDocument.additionalModels = {
                workerJobs: []
            };
        }
        console.log(otherJobsDocument);
        return otherJobsDocument;
    }

    isEqual(currentValue, newValue) {
        // a simple (enum'd) string compare, but more so, if the current and new values are both yes, then
        //   need also to ensure the arrays are equal (equal in value)
        let arraysEqual = true;

        if (currentValue && newValue && currentValue.value === 'Yes' && newValue.value === 'Yes' &&
            currentValue.jobs && newValue.jobs) {
                if (currentValue.jobs.length == newValue.jobs.length) {
                    // the preconditions are set to want to compare the array values themselves

                    // we haven't got large arrays here; so simply iterate around every
                    //  current value, and confirm it is in the the new data set.
                    //  Array.every will drop out on the first iteration to return false
                    arraysEqual = currentValue.jobs.every(thisJob => {
                        return newValue.jobs.find(newJob => newJob.jobId === thisJob.jobId
                            && ((newJob.other === thisJob.other) || (!newJob.other && !thisJob.other)) );
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
                otherJobs: {
                  value: this.property.value ? this.property.value : null,
                  jobs: this.property.jobs ? this.property.jobs : [],
                }
            };
        }

        return {
            otherJobs : {
                value: this.property.value ? this.property.value : null,
                jobs: this.property.jobs ? this.property.jobs : [],
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }

    _valid(thisJob) {
        // get reference set of jobs to validate against
        if (!thisJob) return false;

        // must exist a jobId or title
        if (!(thisJob.jobId || thisJob.title)) return false;

        // if jobId is given, it must be an integer
        if (thisJob.jobId && !(Number.isInteger(thisJob.jobId))) return false;

        // gets here, and it's valid
        return true;
    }

    // returns false if job definitions are not valid, otherwise returns
    //  a well formed set of job definitions using data as given in jobs reference lookup
    async _validateJobs(jobsDef) {
        const setOfValidatedJobs = [];
        let setOfValidatedJobsInvalid = false;

        // now need to iterate around each job; but we need to bail out if any one of the given job definitions is not valid
        for (let thisJob of jobsDef) {
            if (!this._valid(thisJob)) {
                // first check the given data structure
                setOfValidatedJobsInvalid = true;
                break;
            }

            // jobid overrides title, because jobId is indexed whereas title is not!
            let referenceJob = null;
            if (thisJob.jobId) {
                referenceJob = await models.job.findOne({
                    where: {
                        id: thisJob.jobId
                    },
                    attributes: ['id', 'title', 'other'],
                });
            } else {
                referenceJob = await models.job.findOne({
                    where: {
                        title: thisJob.title
                    },
                    attributes: ['id', 'title', 'other'],
                });
            }

            if (referenceJob && referenceJob.id) {
                // found a job match - prevent duplicates by checking if the reference job already exists
                if (!setOfValidatedJobs.find(thisJob => thisJob.jobId === referenceJob.id)) {
                    if (!referenceJob.other || referenceJob.other === undefined || !thisJob.other ||
                        (referenceJob.other && thisJob.other && thisJob.other.length <= OTHER_MAX_LENGTH )) {
                        setOfValidatedJobs.push({
                            jobId: referenceJob.id,
                            title: referenceJob.title,
                            other: (referenceJob.other && thisJob.other) ? thisJob.other : undefined
                        });
                    } else {
                        setOfValidatedJobsInvalid = true;
                        break;
                    }
                }
            } else {
                setOfValidatedJobsInvalid = true;
                break;
            }
        }

        // if having processed each job correctly, return the set of now validated jobs
        if (!setOfValidatedJobsInvalid) return setOfValidatedJobs;

        return false;

    }

};
