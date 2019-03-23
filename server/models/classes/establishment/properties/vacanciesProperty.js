// the Vacanies property is an enum and reflextion table that holds the set of 'Vacancies' referenced against the reference set of jobs
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

const JobFormatters = require('../../../api/jobs');

exports.VacanciesProperty = class VacanciesProperty extends ChangePropertyPrototype {
    constructor() {
        super('Vacancies');
    }

    static clone() {
        return new VacanciesProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.jobs.vacancies) {
            const jobDeclaration = ["None", "Don't know"];
            // can be an empty array
            if (Array.isArray(document.jobs.vacancies)) {
                const validatedJobs = await this._validateJobs(document.jobs.vacancies);

                if (validatedJobs) {
                    this.property = validatedJobs;

                } else {
                    this.property = null;
                }
            } else if (jobDeclaration.includes(document.jobs.vacancies)) {
                this.property = document.jobs.vacancies;
            } else {
                // but it must at least be an array, or one of the known enums
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        if (document.VacanciesValue && document.VacanciesValue === 'With Jobs' && document.jobs) {
            //console.log("WA DEBUG - all establishment jobs: ", document.jobs)
            // we're only interested in Vacancy jobs
            const restoredProperty = document.jobs
                .filter(thisJob => thisJob.type === 'Vacancies')
                .map(thisJob => {
                    return {
                        id:    thisJob.id,
                        jobId: thisJob.reference.id,
                        title: thisJob.reference.title,
                        total: thisJob.total,
                    };
                });
            return restoredProperty;
        } else if (document.VacanciesValue) {
            return document.VacanciesValue;
        }
    }

    savePropertyToSequelize() {
        // when saving Vacancies, there is the "Value" column to update, in addition to the additional Vacancies reflexion records
        const vacanciesDocument = {
            VacanciesValue: Array.isArray(this.property) ? 'With Jobs' : this.property
        };

        // note - only the jobId and total are required
        if (this.property && Array.isArray(this.property)) {
            vacanciesDocument.additionalModels = {
                establishmentVacancies: this.property.map(thisJob => {
                    return {
                        jobId: thisJob.jobId,
                        type: 'Vacancies',
                        total: thisJob.total,
                    };
                })
            };
        } else {
            // ensure all existing vacancies are deleted
            vacanciesDocument.additionalModels = {
                establishmentVacancies: []
            };
        }

        return vacanciesDocument;
    }

    isEqual(currentValue, newValue) {
        // need to compare arrays
        let arraysEqual = true;

        if (currentValue && newValue &&
            Array.isArray(currentValue) && Array.isArray(newValue) &&
            currentValue.length == newValue.length) {
            // the preconditions are sets are equal in length; compare the array values themselves

            // we haven't got large arrays here; so simply iterate around every
            //  current value, and confirm it is in the the new data set.
            //  Array.every will drop out on the first iteration to return false
            arraysEqual = currentValue.every(thisJob => {
                return newValue.find(thatJob =>
                    thatJob.jobId === thisJob.jobId &&
                    thatJob.total === thisJob.total
                );
            });
        } else {
            // if the arrays are lengths are not equal, then we know they're not equal
            arraysEqual = false;
        }

        return arraysEqual;
    }

    formatJSON(jobs) {
        let jobTotal=0;
        const jsonResponse = {
            
        };
        if (Array.isArray(jobs)) {
            jsonResponse.Vacancies = jobs.map(thisJob => {
                jobTotal += thisJob.total;
                return {
                    id: thisJob.id,
                    jobId: thisJob.jobId,
                    title: thisJob.title,
                    total: thisJob.total
                };
           });
           jsonResponse.TotalVacencies = jobTotal;
        } else {
            jsonResponse.Vacancies = jobs;
            jsonResponse.TotalVacencies = 0;
        }
        
        return jsonResponse;
    }

    toJSON(withHistory = false, showPropertyHistoryOnly = true) {
        if (!withHistory) {
            // simple form
            return {
                jobs: this.formatJSON(this.property)
            };
        }

        return {
            localAuthorities: {
                currentValue: this.formatJSON(this.property),
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }

    _valid(thisJob) {
        if (!thisJob) return false;

        // must exist a jobId or title (job title)
        if (!(thisJob.jobId || thisJob.title)) return false;

        // if job idis given, it must be an integer
        if (thisJob.jobId && !(Number.isInteger(thisJob.jobId))) return false;

        // must also exist a total and it must be an integer
        if (!(Number.isInteger(thisJob.total))) return false;

        // total must be between 0 and 999
        const MIN_JOB_TOTAL=0; const MAX_JOB_TOTAL=999;
        if (thisJob.total < MIN_JOB_TOTAL ||
            thisJob.total > MAX_JOB_TOTAL) return false;

        // gets here, and it's valid
        return true;
    }

    // returns false if job definitions are not valid, otherwise returns
    //  a well formed set of job definitions using data as given in jobs reference lookup
    async _validateJobs(jobDefs) {
        const setOfValidatedJobs = [];
        let setOfValidatedJobsInvalid = false;

        // need a set of LAs (CSSRs) to validate against
        const allJobs =  await models.job.findAll({
            attributes: ['id']
        });
        if (!allJobs) {
            console.error('vacanciesProperty::_validateJobs - unable to retrieve all known jobs');
            return false;
        }

        for (let thisJob of jobDefs) {
            if (!this._valid(thisJob)) {
                // first check the given data structure
                setOfValidatedJobsInvalid = true;
                break;
            }

            // jobId overrides title, because jobId is indexed whereas title is not!
            let referenceJob = null;
            if (thisJob.jobId) {
                referenceJob = allJobs.find(thisKnownjob => {
                    return thisKnownjob.id === thisJob.jobId;
                });
            } else {
                referenceJob = allLAs.find(thisKnownjob => {
                    return thisKnownjob.title === thisJob.title;
                });
            }

            if (referenceJob && referenceJob.id) {
                // found a job  match - prevent duplicates by checking if the reference job already exists
                if (!setOfValidatedJobs.find(thisExistingJob => thisExistingJob.jobId === referenceJob.id)) {
                    setOfValidatedJobs.push({
                        jobId: referenceJob.id,
                        title: referenceJob.title,
                        total: thisJob.total
                    });
                }
            } else {
                setOfValidatedJobsInvalid = true;
                break;
            }

        }

        // if having processed each service correctly, return the set of now validated services
        if (!setOfValidatedJobsInvalid) return setOfValidatedJobs;

        return false;
    }

};