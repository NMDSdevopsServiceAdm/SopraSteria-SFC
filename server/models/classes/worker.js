/*
 * worker.js
 *
 * The encapsulation of a Worker, including all properties, all specific validation (not API, but object validation),
 * saving & restoring of data to database (via sequelize model), construction and deletion.
 * 
 * Also includes representation as JSON, in one or more presentations.
 */

const uuid = require('uuid');

// database models
const models = require('../index');

const WorkerContract = require( './worker/workerContract');
const WorkerExceptions = require('./worker/workerExceptions');

class Worker {
    constructor(establishmentId) {
        this._establishmentId = establishmentId;
        this._id = null;
        this._uid = null;
        this._contract = null;
        this._nameId = null;
        this._mainJob = null;
        this._created = null;
        this._updated = null;

        // change properties
        this._isNew = false;
        this._chgNameId = false;
        this._chgContract = false;
        this._chgMainJob = false;
        
        // default logging level - errors only
        // TODO: INFO logging on Worker; change to LOG_ERROR only
        this._logLevel = Worker.LOG_INFO;
    }

    // returns true if valid establishment id
    get _isEstablishmentIdValid() {
        if ((this._establishmentId &&
             Number.isInteger(this._establishmentId) &&
             this._establishmentId > 0)
            ) {
                return true;
            } else {
                return false;
            }
    }

    // private logging
    static get LOG_ERROR() { return 100; }
    static get LOG_WARN() { return 200; }
    static get LOG_INFO() { return 300; }
    static get LOG_TRACE() { return 400; }
    static get LOG_DEBUG() { return 500; }

    set logLevel(logLevel) {
        this._logLevel = logLevel;
    }

    _log(level, msg) {
        if (this._logLevel >= level) {
            console.log(`TODO: (${level}) - Worker class: `, msg);
        }
    }

    // used by save to initialise a new Worker; returns true if having initialised this worker
    _initialise() {
        if (this._uid === null) {
            this._isNew = true;
            this._uid = uuid.v4();

            if (!this._isEstablishmentIdValid)
                throw new WorkerExceptions.WorkerSaveException(null,
                                                               this._uid,
                                                               this._nameId,
                                                               `Unexpected Establishment Id (${this._establishmentId})`,
                                                               'Unknown Establishment');

            // note, do not initialise the id as this will be returned by database
            return true;
        } else {
            return false;
        }
    }

    // saves the Worker to DB. Returns true if saved; false is not.
    // Throws "WorkerSaveException" on error
    async save() {
        let mustSave = this._initialise();

        if (mustSave && this._isNew) {
            // create new Worker
            try {
                let creation = await models.worker.create({
                    establishmentFk: this._establishmentId,
                    uid: this.uid,
                    nameId: this.nameId,
                    contract: this.contract,
                    mainJobFk: this.mainJob.jobId,
                    attributes: ['id', 'created', 'updated'],
                });

                const sanitisedResults = creation.get({plain: true});

                this._id = sanitisedResults.ID;
                this._created = sanitisedResults.created;
                this._updated = sanitisedResults.updated;
                this._isNew = false;
                this._log(Worker.LOG_INFO, `Created Worker with uid (${this._uid}) and id (${this._id})`);    
                
            } catch (err) {
                throw new WorkerExceptions.WorkerSaveException(null,
                                                               this.uid,
                                                               this.nameId,
                                                               err,
                                                               null);
            }
        }

        if (mustSave && !this._isNew) {
            // update Worker - update timestamp!

        }

        // on successful completion of save, reset all change properties
        if (mustSave) {
            this._chgNameId = false;
            this._chgContract = false;
            this._chgJob = false;
        }

        return mustSave;
    };

    // loads the Worker (with given id) from DB, but only if it belongs to the given Establishment
    // returns true on success; false if no Worker
    // Can throw WorkerRestoreException exception.
    async restore(workerUid) {
        if (!workerUid) {
            throw new WorkerExceptions.WorkerRestoreException(null,
                null,
                null,
                'Worker::restore failed: Missing uid',
                null,
                'Unexpected Error');
        }

        try {
            // by including the establishment id in the
            //  fetch, we are sure to only fetch those
            //  worker records associated to the given
            //   establishment
            const fetchResults = await models.worker.findOne({
                where: {
                    establishmentFk: this._establishmentId,
                    uid: workerUid
                },
                include: [
                    {
                        model: models.job,
                        as: 'mainJob',
                        attributes: ['id', 'title']
                    }
                ]
            });

            if (fetchResults && fetchResults.id && Number.isInteger(fetchResults.id)) {
                // update self - don't use setters because they modify the change state
                this._isNew = false;
                this._uid = workerUid;
                this._nameId = fetchResults.nameId;
                this._contract = fetchResults.contract;
                this._mainJob = {
                    jobId: fetchResults.mainJob.id,
                    title: fetchResults.mainJob.title
                };
                this._created = fetchResults.created;
                this._updated = fetchResults.updated;

                return true;
            }

            return false;

        } catch (err) {
            throw new WorkerExceptions.WorkerRestoreException(null,
                this.uid,
                null,
                err,
                null);
        }
    };

    // deletes this Worker from DB
    // Can throw "WorkerDeleteException"
    async delete() {
        throw new Error('Not implemented');
    };

    // returns a set of Workers based on given filter criteria (all if no filters defined) - restricted to the given Establishment
    static async fetch(establishmentId, filters=null) {
        const allWorkers = [];
        const fetchResults = await models.worker.findAll({
            where: {
                establishmentFk: establishmentId
            },
            include: [
                {
                    model: models.job,
                    as: 'mainJob',
                    attributes: ['id', 'title']
                  }
            ],
            attributes: ['uid', 'nameId', 'contract'],
            order: [
                ['updated', 'DESC']
            ]           
        });

        if (fetchResults) {
            fetchResults.forEach(thisWorker => {
                allWorkers.push({
                    uid: thisWorker.uid,
                    nameOrId: thisWorker.nameId,
                    contract: thisWorker.contract,
                    mainJob: {
                        jobId: thisWorker.mainJob.id,
                        title: thisWorker.mainJob.title
                    }
                })
            });
        }

        return allWorkers;
    };

    // returns a Javascript object which can be used to present as JSON
    toJSON() {
        return {
            uid: this.uid,
            nameOrId: this.nameId,
            contract: this.contract,
            mainJob: this.mainJob,
            created: this.created,
            updated: this.updated
        };
    }


    /*
     * attributes
     */
    get uid() {
        return this._uid;
    };
    get nameId() {
        return this._nameId;
    };
    set nameId(nameId) {
        this._nameId = nameId;
        this._chgNameId = true;
        return this.nameId;
    }
    get mainJob() {
        return this._mainJob;
    }
    set mainJob(job) {
        this._mainJob = job;
        this._chgMainJob = true;
        return this.mainJob;
    }
    get contract() {
        return this._contract;
    }
    set contract(contract) {
        this._contract = contract;
        this._chgContract = true;
        return this.contract;
    }
    get created() {
        return this._created;
    }
    get updated() {
        return this._updated;
    }


    // HELPERS
    // returns false if job definition is not valid, otherwise returns
    //  a well formed job definition using data as given in jobs reference lookup
    static async validateJob(jobDef) {
        // get reference set of jobs to validate against
        if (!jobDef) return false;
        
        // must exist a jobId or title
        if (!(jobDef.jobId || jobDef.title)) return false;

        // if jobId is given, it must be an integer
        if (jobDef.jobId && !(Number.isInteger(jobDef.jobId))) return false;
        
        // jobid overrides title, because jobId is indexed whereas title is not!
        let referenceJob = null;
        try {
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
            }
    
        } catch (err) {
            console.err(err);
        }

        // failed to find reference job
        return false;
    }

    // returns false if establishment is not valid, otherwise returns
    //  the establishment id
    static async validateEstablishment(establishmentId) {
        if (!establishmentId) return false;

        if (!Number.isInteger(establishmentId)) return false;

        if (establishmentId <= 0) return false;

        let referenceEstablishment;
        try {
            referenceEstablishment = await models.establishment.findOne({
                where: {
                    id: establishmentId
                },
                attributes: ['id'],
            });
            if (referenceEstablishment && referenceEstablishment.id && referenceEstablishment.id === establishmentId) return true;
    
        } catch (err) {
            console.error(err);
        }
        return false;
    }

};

module.exports.Worker = Worker;

// sub types
module.exports.WorkerContract = WorkerContract;
module.exports.WorkerExceptions = WorkerExceptions;