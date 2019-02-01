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

const WorkerExceptions = require('./worker/workerExceptions');

// Worker properties
const WorkerProperties = require('./worker/workerProperties').WorkerPropertyManager;
const JSON_DOCUMENT_TYPE = require('./worker/workerProperties').JSON_DOCUMENT;
const SEQUELIZE_DOCUMENT_TYPE = require('./worker/workerProperties').SEQUELIZE_DOCUMENT;

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
        this._updatedBy = null;
        this._auditEvents = null;

        // abstracted properties
        const thisWorkerManager = new WorkerProperties();
        this._properties = thisWorkerManager.manager;

        // change properties
        this._isNew = false;
        
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

    // takes the given JSON document and creates a Worker's set of extendable properties
    // Returns true if the resulting Worker is valid; otherwise false
    async load(document) {
        try {
            await this._properties.restore(document, JSON_DOCUMENT_TYPE);
        } catch (err) {
            this._log(Worker.LOG_ERROR, `Woker::load - failed: ${err}`);
            throw new WorkerExceptions.WorkerJsonException(
                err,
                null,
                'Failed to load Worker from JSON');
        }
        return this.isValid();
    }

    // returns true if Worker is valid, otherwise false
    isValid() {
        // the property manager returns a list of all properties that are invalid; or true
        const thisWorkerIsValid = this._properties.isValid;
        if (thisWorkerIsValid === true) {
            return true;
        } else {
            this._log(Worker.LOG_ERROR, `Worker invalid properties: ${thisWorkerIsValid.toString()}`);
            return false;
        }
    }

    // saves the Worker to DB. Returns true if saved; false is not.
    // Throws "WorkerSaveException" on error
    async save(savedBy) {
        let mustSave = this._initialise();

        if (!this.uid) {
            this._log(Worker.LOG_ERROR, 'Not able to save an unknown uid');
            throw new WorkerExceptions.WorkerSaveException(null,
                this.uid,
                nameId ? nameId.property : null,
                'Not able to save an unknown uid',
                'Worker does not exist');
        }

        if (mustSave && this._isNew) {
            // create new Worker
            try {
                const creationDocument = {
                    establishmentFk: this._establishmentId,
                    uid: this.uid,
                    updatedBy: savedBy,
                    attributes: ['id', 'created', 'updated'],
                };

                // need to create the Worker record and the Worker Audit event
                //  in one transaction
                await models.sequelize.transaction(async t => {
                    // now append the extendable properties.
                    // Note - although the POST (create) has a default
                    //   set of mandatory properties, there is no reason
                    //   why we cannot create a Worker record with more properties
                    const modifedCreationDocument = this._properties.save(savedBy, creationDocument);

                    // now save the document
                    let creation = await models.worker.create(modifedCreationDocument);

                    const sanitisedResults = creation.get({plain: true});

                    this._id = sanitisedResults.ID;
                    this._created = sanitisedResults.created;
                    this._updated = sanitisedResults.updated;
                    this._updatedBy = savedBy;
                    this._isNew = false;

                    // having the worker id we can now create the audit record; inserting the workerFk
                    const allAuditEvents = [{
                        workerFk: this._id,
                        username: savedBy,
                        type: 'created'}].concat(this._properties.auditEvents.map(thisEvent => {
                            return {
                                ...thisEvent,
                                workerFk: this._id
                            };
                        }));
                    await models.workerAudit.bulkCreate(allAuditEvents);

                    this._log(Worker.LOG_INFO, `Created Worker with uid (${this._uid}) and id (${this._id})`);
                });
                
            } catch (err) {
                // if the name/Id property is known, use it in the error message
                const nameId = this._properties.get('NameOrId');
                throw new WorkerExceptions.WorkerSaveException(null,
                                                               this.uid,
                                                               nameId ? nameId.property : null,
                                                               err,
                                                               null);
            }
        } else {
            // we are updating an existing worker
            try {
                const updatedTimestamp = new Date();

                // need to update the existing Worker record and add an
                //  updated audit event within a single transaction
                await models.sequelize.transaction(async t => {
                    // now append the extendable properties
                    const modifedUpdateDocument = this._properties.save(savedBy, {});

                    const updateDocument = {
                        ...modifedUpdateDocument,
                        updated: updatedTimestamp,
                        updatedBy: savedBy
                    };

                    // now save the document
                    let [updatedRecordCount, updatedRows] =
                        await models.worker.update(updateDocument,
                                                {
                                                        returning: true,
                                                        where: {
                                                            uid: this.uid
                                                        },
                                                        attributes: ['id', 'updated'],
                                                });

                    if (updatedRecordCount === 1) {
                        const updatedRecord = updatedRows[0].get({plain: true});

                        this._updated = updatedRecord.updated;
                        this._updatedBy = savedBy;
                        this._id = updatedRecord.ID;

                        const allAuditEvents = [{
                            workerFk: this._id,
                            username: savedBy,
                            type: 'updated'}].concat(this._properties.auditEvents.map(thisEvent => {
                                return {
                                    ...thisEvent,
                                    workerFk: this._id
                                };
                            }));
                            // having updated the record, create the audit event
                        await models.workerAudit.bulkCreate(allAuditEvents);

                        // now - work through any additional models having processed all properties (first delete and then re-create)
                        const additionalModels = this._properties.additionalModels;
                        const additionalModelsByname = Object.keys(additionalModels);
                        const deleteMmodelPromises = [];
                        additionalModelsByname.forEach(async thisModelByName => {
                            deleteMmodelPromises.push(
                                models[thisModelByName].destroy({
                                    where: {
                                      workerFk: this._id
                                    }
                                  })
                            );
                        });
                        await Promise.all(deleteMmodelPromises);
                        const createMmodelPromises = [];
                        additionalModelsByname.forEach(async thisModelByName => {
                            const thisModelData = additionalModels[thisModelByName];
                            createMmodelPromises.push(
                                models[thisModelByName].bulkCreate(thisModelData.map(thisRecord => {
                                    return {
                                        ...thisRecord,
                                        workerFk: this._id
                                    };
                                }))
                            );
                        });
                        await Promise.all(createMmodelPromises);

                        this._log(Worker.LOG_INFO, `Updated Worker with uid (${this._uid}) and id (${this._id})`);

                    } else {
                        const nameId = this._properties.get('NameOrId');
                        throw new WorkerExceptions.WorkerSaveException(null,
                                                                    this.uid,
                                                                    nameId ? nameId.property : null,
                                                                    err,
                                                                    `Failed to update resulting worker record with uid: ${this._uid}`);
                    }


                });
                
            } catch (err) {
                // if the name/Id property is known, use it in the error message
                const nameId = this._properties.get('NameOrId');
                throw new WorkerExceptions.WorkerSaveException(null,
                                                               this.uid,
                                                               nameId ? nameId.property : null,
                                                               err,
                                                               `Failed to update worker record with uid: ${this._uid}`);
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
    async restore(workerUid, showHistory=false) {
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
            const fetchQuery = {
                where: {
                    establishmentFk: this._establishmentId,
                    uid: workerUid
                },
                include: [
                    {
                        model: models.job,
                        as: 'mainJob',
                        attributes: ['id', 'title']
                    },
                    {
                        model: models.ethnicity,
                        as: 'ethnicity',
                        attributes: ['id', 'ethnicity']
                    },
                    {
                        model: models.nationality,
                        as: 'nationality',
                        attributes: ['id', 'nationality']
                    },
                    {
                        model: models.qualification,
                        as: 'socialCareQualification',
                        attributes: ['id', 'level']
                    },
                    {
                        model: models.qualification,
                        as: 'highestQualification',
                        attributes: ['id', 'level']
                    },
                    {
                        model: models.country,
                        as: 'countryOfBirth',
                        attributes: ['id', 'country']
                    },
                    {
                        model: models.recruitedFrom,
                        as: 'recruitedFrom',
                        attributes: ['id', 'from']
                    },
                    {
                        model: models.job,
                        as: 'otherJobs',
                        attributes: ['id', 'title']
                    }

                ]
            };

            // if history of the Worker is also required; attach the association
            //  and order in reverse chronological - note, order on id (not when)
            //  because ID is primay key and hence indexed
            if (showHistory) {
                fetchQuery.include.push({
                    model: models.workerAudit,
                    as: 'auditEvents'
                });
                fetchQuery.order = [
                    [
                        {
                            model: models.workerAudit,
                            as: 'auditEvents'
                        },
                        'id',
                        'DESC'
                    ]
                ];
            }

            const fetchResults = await models.worker.findOne(fetchQuery);
            if (fetchResults && fetchResults.id && Number.isInteger(fetchResults.id)) {
                // update self - don't use setters because they modify the change state
                this._isNew = false;
                this._uid = workerUid;
                this._created = fetchResults.created;
                this._updated = fetchResults.updated;
                this._updatedBy = fetchResults.updatedBy;

                if (fetchResults.auditEvents) {
                    this._auditEvents = fetchResults.auditEvents;
                }

                // load extendable properties
                await this._properties.restore(fetchResults, SEQUELIZE_DOCUMENT_TYPE);

                return true;
            }

            return false;

        } catch (err) {
            // typically errors when making changes to model or database schema!
            this._log(Worker.LOG_ERROR, err);

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
            attributes: ['uid', 'NameOrIdValue', 'ContractValue', "created", "updated", "updatedBy"],
            order: [
                ['updated', 'DESC']
            ]           
        });

        if (fetchResults) {
            fetchResults.forEach(thisWorker => {
                allWorkers.push({
                    uid: thisWorker.uid,
                    nameOrId: thisWorker.NameOrIdValue,
                    contract: thisWorker.ContractValue,
                    mainJob: {
                        jobId: thisWorker.mainJob.id,
                        title: thisWorker.mainJob.title
                    },
                    created:  thisWorker.created.toJSON(),
                    updated: thisWorker.updated.toJSON(),
                    updatedBy: thisWorker.updatedBy
                })
            });
        }

        return allWorkers;
    };

    // helper returns a set 'json ready' objects for representing a Worker's overall
    //  change history, from a given set of audit events (those events being created
    //  or updated only)
    formatWorkerHistoryEvents(auditEvents) {
        if (auditEvents) {
            return auditEvents.filter(thisEvent => ['created', 'updated'].includes(thisEvent.type))
                               .map(thisEvent => {
                                    return {
                                        when: thisEvent.when,
                                        username: thisEvent.username,
                                        event: thisEvent.type
                                    };
                               });
        } else {
            return null;
        }
    };

    // helper returns a set 'json ready' objects for representing a Worker's audit
    //  history, from a the given set of audit events including those of individual
    //  worker properties)
    formatWorkerHistory(auditEvents) {
        if (auditEvents) {
            return auditEvents.map(thisEvent => {
                                    return {
                                        when: thisEvent.when,
                                        username: thisEvent.username,
                                        event: thisEvent.type,
                                        property: thisEvent.property,
                                        change: thisEvent.event
                                    };
                               });
        } else {
            return null;
        }
    };


    // returns a Javascript object which can be used to present as JSON
    //  showHistory appends the historical account of changes at Worker and individual property level
    //  showHistoryTimeline just returns the history set of audit events for the given Worker
    toJSON(showHistory=false, showPropertyHistoryOnly=true, showHistoryTimeline=false) {
        if (!showHistoryTimeline) {
            // JSON representation of extendable properties
            const myJSON = this._properties.toJSON(showHistory, showPropertyHistoryOnly);

            // add worker default properties
            const myDefaultJSON = {
                uid:  this.uid
            };

            myDefaultJSON.created = this.created.toJSON();
            myDefaultJSON.updated = this.updated.toJSON();
            myDefaultJSON.updatedBy = this.updatedBy;

            // TODO: JSON schema validation
            let workerHistory = null;
            if (showHistory && !showPropertyHistoryOnly) {
                return {
                    ...myDefaultJSON,
                    ...myJSON,
                    history: this.formatWorkerHistoryEvents(this._auditEvents)
                };
            } else {
                return {
                    ...myDefaultJSON,
                    ...myJSON
                };
            }
        } else {
            return {
                uid:  this.uid,
                created: this.created.toJSON(),
                updated: this.updated.toJSON(),
                updatedBy: this.updatedBy,
                history: this.formatWorkerHistory(this._auditEvents)
            };
        }
    }


    /*
     * attributes
     */
    get uid() {
        return this._uid;
    };
    get created() {
        return this._created;
    }
    get updated() {
        return this._updated;
    }
    get updatedBy() {
        return this._updatedBy;
    }


    // HELPERS
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

    
    // returns true if all mandatory properties for a Worker exist and are valid
    get hasMandatoryProperties() {
        let allExistAndValid = true;    // assume all exist until proven otherwise
        try {
            const nameIdProperty = this._properties.get('NameOrId');
            if (!(nameIdProperty && nameIdProperty.isInitialised && nameIdProperty.valid)) {
                allExistAndValid = false;
                this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid name or id property');
            }
    
            const mainJobProperty = this._properties.get('MainJob');
            if (!(mainJobProperty && mainJobProperty.isInitialised && mainJobProperty.valid)) {
                allExistAndValid = false;
                this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid main job property');
            }
    
            const contractProperty = this._properties.get('Contract');
            if (!(contractProperty && contractProperty.isInitialised && contractProperty.valid)) {
                allExistAndValid = false;
                this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid contract property');
            }
    
        } catch (err) {
            console.error(err)
        }


        return allExistAndValid;
    }


};

module.exports.Worker = Worker;

// sub types
module.exports.WorkerExceptions = WorkerExceptions;