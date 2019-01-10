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
        this._job = null;

        // change properties
        this._isNew = false;
        this._chgNameId = false;
        this._chgContract = false;
        this._chgJob = false;
        
        // default logging level - errors only
        this._logLevel = Worker.LOG_ERROR;
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
                    attributes: ['id'],
                });

                const sanitisedResults = creation.get({plain: true});

                console.log("WA DEBUG: creation results: ", sanitisedResults)
                console.log("WA DEBUG: creation result fields: ", sanitisedResults.ID, creation.updated)
    
                this._id = sanitisedResults.ID;
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
    // Can throw "WorkerRestoreException"
    restore(uid, establishmentId) {
        throw new Error('Not implemented');
    };

    // deletes this Worker from DB
    // Can throw "WorkerDeleteException"
    delete() {
        throw new Error('Not implemented');
    };

    // returns a set of Workers based on given filter criteria (all if no filters defined) - restricted to the given Establishment
    static fetch(establishmentId, filters) {

    };

    // returns a Javascript object which can be used to present as JSON
    toJSON() {
        return {

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
    get job() {
        return this._job;
    }
    set job(job) {
        this._job = job;
        return this.job;
    }
    get contract() {
        return this._contract;
    }
    set contract(contract) {
        this._contract = contract;
        return this.contract;
    }

};

module.exports.Worker = Worker;

// sub types
module.exports.WorkerContract = WorkerContract;
module.exports.WorkerExceptions = WorkerExceptions;