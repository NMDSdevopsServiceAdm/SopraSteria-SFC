// the Vacanies property is an enum and reflextion table that holds the set of 'Vacancies' referenced against the reference set of jobs
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const JobHelpers = require('./jobHelper');

exports.VacanciesProperty = class VacanciesProperty extends ChangePropertyPrototype {
    constructor() {
        super('Vacancies');

        this._wdfTemporal = true;
    }

    static clone() {
        return new VacanciesProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.vacancies) {
            const jobDeclaration = ["None", "Don't know"];
            // can be an empty array
            if (Array.isArray(document.vacancies)) {
                const validatedJobs = await JobHelpers.validateJobs(document.vacancies);

                if (validatedJobs) {
                    this.property = validatedJobs;

                } else {
                    this.property = null;
                }
            } else if (jobDeclaration.includes(document.vacancies)) {
                this.property = document.vacancies;
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
        if (currentValue && newValue &&
            Array.isArray(currentValue) && Array.isArray(newValue)) {
            // need to compare arrays
            let arraysEqual = true;

            if (currentValue.length == newValue.length) {
                // the preconditions are sets are equal in length; compare the array values themselves

                // we haven't got large arrays here; so simply iterate around every
                //  current value, and confirm it is in the the new data set.
                //  Array.every will drop out on the first iteration to return false
                arraysEqual = currentValue.every(thisJob => {
                    return newValue.find(thatJob => {
                        return  thatJob.jobId === thisJob.jobId && thatJob.total === thisJob.total;
                    });
                });
            } else {
                // if the arrays are lengths are not equal, then we know they're not equal
                arraysEqual = false;
            }

            return arraysEqual;

        } else if (currentValue && newValue && currentValue === newValue) {
            // else not arrays - just a value comparison
            return true;
        } else {
            return false;
        }
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true, wdfEffectiveDate = false) {       
        const jsonPresentation = JobHelpers.formatJSON(this.property, 'Vacancies', 'TotalVacencies');

        if (wdfEffectiveDate) {
            return this._wdfTemporal ? this._savedAt > wdfEffectiveDate ? true : false : false;
        }

        if (!withHistory) {
            // simple form - includes 
            return {
                vacancies: jsonPresentation.Vacancies,
                totalVacancies: jsonPresentation.TotalVacencies
            };
        }

        return {
            vacancies: {
                currentValue: jsonPresentation.Vacancies,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};