// the Leavers property is an enum and reflextion table that holds the set of 'Leavers' referenced against the reference set of jobs
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const JobHelpers = require('./jobHelper');

exports.LeaversProperty = class LeaversProperty extends ChangePropertyPrototype {
    constructor() {
        super('Leavers');
    }

    static clone() {
        return new LeaversProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.leavers) {
            const jobDeclaration = ["None", "Don't know"];
            // can be an empty array
            if (Array.isArray(document.leavers)) {
                const validatedJobs = await JobHelpers.validateJobs(document.leavers);

                if (validatedJobs) {
                    this.property = validatedJobs;

                } else {
                    this.property = null;
                }
            } else if (jobDeclaration.includes(document.leavers)) {
                this.property = document.leavers;
            } else {
                // but it must at least be an array, or one of the known enums
                this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        if (document.LeaversValue && document.LeaversValue === 'With Jobs' && document.jobs) {
            // we're only interested in Leaver jobs
            const restoredProperty = document.jobs
                .filter(thisJob => thisJob.type === 'Leavers')
                .map(thisJob => {
                    return {
                        id:    thisJob.id,
                        jobId: thisJob.reference.id,
                        title: thisJob.reference.title,
                        total: thisJob.total,
                    };
                });
            return restoredProperty;
        } else if (document.LeaversValue) {
            return document.LeaversValue;
        }
    }

    savePropertyToSequelize() {
        // when saving Leavers, there is the "Value" column to update, in addition to the additional Leavers reflexion records
        const leaversDocument = {
            LeaversValue: Array.isArray(this.property) ? 'With Jobs' : this.property
        };

        // note - only the jobId and total are required
        if (this.property && Array.isArray(this.property)) {
            leaversDocument.additionalModels = {
                establishmentLeavers: this.property.map(thisJob => {
                    return {
                        jobId: thisJob.jobId,
                        type: 'Leavers',
                        total: thisJob.total,
                    };
                })
            };
        } else {
            // ensure all existing vacancies are deleted
            leaversDocument.additionalModels = {
                establishmentLeavers: []
            };
        }

        return leaversDocument;
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
        const jsonPresentation = JobHelpers.formatJSON(this.property, 'Leavers', 'TotalLeavers');

        if (wdfEffectiveDate) {
            return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
        }

        if (!withHistory) {
            // simple form - includes
            return {
                leavers: jsonPresentation.Leavers,
                totalLeavers: jsonPresentation.TotalLeavers
            };
        }

        return {
            leavers: {
                currentValue: jsonPresentation.Leavers,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};