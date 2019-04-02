/*
 * training.js
 *
 * The encapsulation of a Worker's Training record, including all properties, all specific validation (not API, but object validation),
 * saving & restoring of data to database (via sequelize model), construction and deletion.
 * 
 * Also includes representation as JSON, in one or more presentations.
 *
 * TO NOTE - Training is a simplified representation of User, Worker and Establishment; it does not have any managed properties or auditing.
 */
const uuid = require('uuid');
const moment = require('moment');

// database models
const models = require('../index');

class Training {
    constructor(establishmentId, workerUid) {
        this._establishmentId = establishmentId;
        this._workerUid = workerUid;
        this._id = null;
        this._uid = null;
        this._created = null;
        this._updated = null;
        this._updatedBy = null;

        // localised attributes - optional on load
        this._category = null;
        this._title = null;
        this._accredited = null;
        this._completed = null;
        this._expires = null;
        this._notes = null;

        // lifecycle properties
        this._isNew = false;

        // UUID validator
        this.uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
        
        // default logging level - errors only
        // TODO: INFO logging on Training; change to LOG_ERROR only
        this._logLevel = Training.LOG_INFO;
    }

    // returns true if valid worker uid
    get _isWorkerUidValid() {
        if (this._workerUid &&
            this._establishmentId &&
            this.uuidV4Regex.test(this._workerUid)
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
            console.log(`TODO: (${level}) - Training class: `, msg);
        }
    }

    //
    // attributes
    //
    get id() {
        return this._id;
    }
    get uid() {
        return this._uid;
    }
    get workerUid() {
        return this._workerUid;
    }

    get created() {
        return this._created;
    }
    get updated() {
        return this._updated;
    }
    get updatedBy() {
        return this._updatedBy;
    }

    get category() {
        return this._category;
    };
    get title() {
        return unescape(this._title);
    };
    get accredited() {
        return this._accredited;
    };
    get completed() {
        return this._completed;
    };
    get expires() {
        return this._expires;
    };
    get notes() {
        if (this._notes === null) return null;
        return unescape(this._notes);
    };
    set category(category) {
        this._category = category;
    };
    set title(title) {
        this._title = escape(title);
    };
    set accredited(accredited) {
        this._accredited = accredited;
    };
    set completed(completed) {
        this._completed = completed;
    };
    set expires(expires) {
        this._expires = expires;
    };
    set notes(notes) {
        this._notes = escape(notes);
    };

    // used by save to initialise a new Trainign Record; returns true if having initialised this Training Record
    _initialise() {
        if (this._uid === null) {
            this._isNew = true;
            this._uid = uuid.v4();
            
            if (!this._isWorkerUidValid)
                throw new Error('Training initialisation error');

            // note, do not initialise the id as this will be returned by database
            return true;
        } else {
            return false;
        }
    }

    // validates a given training record; returns the training record if valid
    async validateTrainingRecord(document) {
        // to validate a training record, need the list of available training categories
        const trainingCategories = await models.workerTrainingCategories.findAll({
            order: [
              ["seq", "ASC"]
            ]
        });

        if (!trainingCategories || !Array.isArray(trainingCategories)) {
            this._log(Training.LOG_ERROR, 'Failed to get all training categories');
            return false;
        }

        // training category
        const validatedTrainingRecord = {};
        if (document.trainingCategory) {
            // validate category
            if (!(document.trainingCategory.id || document.trainingCategory.category)) {
                this._log(Training.LOG_ERROR, 'category failed validation: trainingCategory.id or trainingCategory.category must exist');
                return false;
            }

            if (document.trainingCategory.id && !Number.isInteger(document.trainingCategory.id)) {
                this._log(Training.LOG_ERROR, 'category failed validation: trainingCategory.id must be an integer');
                return false;
            }

            let foundCategory = null;
            if (document.trainingCategory.id) {
                foundCategory = trainingCategories.find(thisCategory => thisCategory.id === document.trainingCategory.id);
            } else {
                foundCategory = trainingCategories.find(thisCategory => {
                    return thisCategory.category === document.trainingCategory.category
                });
            }
            if (foundCategory === null) {
                this._log(Training.LOG_ERROR, 'category failed validation: trainingCategory.id or trainingCategory.category must exist');
                return false;
            } else {
                validatedTrainingRecord.trainingCategory = {
                    id: foundCategory.id,
                    category: foundCategory.category
                };
            }
        }

        // title
        if (document.title) {
            // validate title
            const MAX_LENGTH=120;
            const MIN_LENGTH=3;
            if (document.title.length < MIN_LENGTH ||
                document.title.length > MAX_LENGTH) {
                this._log(Training.LOG_ERROR, 'title failed validation: MIN/MAX length');
                return false;
            }

            validatedTrainingRecord.title = document.title;
        }

        // accredited - boolean value (or string equivalent of true/false)!
        if (document.accredited !== null) {
            // validate accredited - JSON only allows true/false
            const ALLOWED_TRUE_VALUES = ["true", "yes"];
            const ALLOWED_FALSE_VALUES = ["false", "no"];
            if (typeof document.accredited !== 'boolean' &&
                !(ALLOWED_TRUE_VALUES.includes(document.accredited.toLowerCase()) || ALLOWED_FALSE_VALUES.includes(document.accredited.toLowerCase()))) {
                this._log(Training.LOG_ERROR, 'accredited failed validation: wrong type');
                return false;
            }

            if (typeof document.accredited === 'boolean') validatedTrainingRecord.accredited = document.accredited;

            if (typeof document.accredited !== 'boolean') {
                if (ALLOWED_TRUE_VALUES.includes(document.accredited.toLowerCase())) validatedTrainingRecord.accredited = true;
                if (ALLOWED_FALSE_VALUES.includes(document.accredited.toLowerCase())) validatedTrainingRecord.accredited = false;
            }
        }

        // completed
        if (document.completed) {
            // validate completed - must be a valid date
            const expectedDate = moment.utc(document.completed);
            if (!expectedDate.isValid()) {
                this._log(Training.LOG_ERROR, 'completed failed validation: incorrect date');
                return false;
            }
            if (!expectedDate.isBefore(moment(), 'day')) {
                this._log(Training.LOG_ERROR, 'completed failed validation: must be before today');
                return false;
            }

            validatedTrainingRecord.completed = expectedDate;
        }

        // expires
        if (document.expires) {
            // validate expires - must be a valid date
            const expectedDate = moment.utc(document.expires);
            if (!expectedDate.isValid()) {
                this._log(Training.LOG_ERROR, 'expires failed validation: incorrect date');
                return false;
            }

            if (!expectedDate.isAfter(validatedTrainingRecord.completed, 'day')) {
                this._log(Training.LOG_ERROR, 'expires failed validation: must expire after completed');
                return false;
            }

            validatedTrainingRecord.expires = expectedDate;
        }

        // notes
        if (document.notes) {
            // validate title
            const MAX_LENGTH=500;
            if (document.notes.length > MAX_LENGTH) {
                this._log(Training.LOG_ERROR, 'notes failed validation: MAX length');
                return false;
            }

            validatedTrainingRecord.notes = document.notes;
        }

        return validatedTrainingRecord;
    }

    // takes the given JSON document and updates self (internal properties)
    // Thows "Error" on error.
    async load(document) {
        try {
            const validatedTrainingRecord = await this.validateTrainingRecord(document);

            if (validatedTrainingRecord !== false) {
                this.category = validatedTrainingRecord.trainingCategory;
                this.title = validatedTrainingRecord.title;
                this.accredited = validatedTrainingRecord.accredited;
                this.completed = validatedTrainingRecord.completed.toDate();
                this.expires = validatedTrainingRecord.expires ? validatedTrainingRecord.expires.toDate() : null;
                this.notes = validatedTrainingRecord.notes;
            } else {
                this._log(Training.LOG_ERROR, `Training::load - failed`);
                throw new Error('Failed Validation');
            }
        } catch (err) {
            this._log(Training.LOG_ERROR, `Training::load - failed: ${err}`);
            throw new Error('Failed Validation');
        }
        return this.isValid();
    }

    // returns true if Training is valid, otherwise false
    isValid() {
        if (this.hasMandatoryProperties === true) {
            return true;
        } else {
            this._log(Training.LOG_ERROR, `Invalid properties`);
            return false;
        }
    }

    // saves the Training record to DB. Returns true if saved; false is not.
    // Throws "Error" on error
    async save(savedBy, ttl=0, externalTransaction=null) {
        let mustSave = this._initialise();

        if (!this.uid) {
            this._log(Training.LOG_ERROR, 'Not able to save an unknown training uid');
            throw Error('Invalid Training UID');
        }

        if (mustSave && this._isNew) {
            // create new Training Record
            try {
                // must validate the Worker record
                const workerRecord = await models.worker.findOne({
                    where: {
                        establishmentFk: this._establishmentId,
                        uid: this._workerUid,
                        archived: false
                    },
                    attributes: ['id']
                });

                if (workerRecord && workerRecord.id) {
                    const now = new Date();
                    const creationDocument = {
                        workerFk: workerRecord.id,
                        uid: this._uid,
                        created: now,
                        updated: now,
                        updatedBy: savedBy,
                        categoryFk: this._category.id,
                        title: this._title,
                        accredited: this._accredited,
                        completed: this._completed,
                        expires: this._expires,
                        notes: this._notes,
                        attributes: ['uid', 'created', 'updated'],
                    };

                    //console.log("WA DEBUG creation document: ", creationDocument)
    
                    // need to create the Training record only
                    //  in one transaction
                    await models.sequelize.transaction(async t => {
                        // the saving of an Training record can be initiated within
                        //  an external transaction
                        const thisTransaction = externalTransaction ? externalTransaction : t;
    
                        // now save the document
                        let creation = await models.workerTraining.create(creationDocument, {transaction: thisTransaction});
    
                        const sanitisedResults = creation.get({plain: true});
    
                        this._id = sanitisedResults.ID;
                        this._created = sanitisedResults.created;
                        this._updated = sanitisedResults.updated;
                        this._updatedBy = savedBy;
                        this._isNew = false;
    
                        this._log(Training.LOG_INFO, `Created Training Record with uid (${this.uid})`);
                    });
                } else {
                    throw new Error('Worker record not found');
                }
                
            } catch (err) {
                this._log(Training.LOG_ERROR, `Failed to save new training record: ${err}`);
                throw new Error('Failed to save new Training record');
            }
        } else {
            // we are updating an existing Training Record
            try {
                const updatedTimestamp = new Date();

                // need to update the existing Training record only within a single transaction
                await models.sequelize.transaction(async t => {
                    // the saving of an Training record can be initiated within
                    //  an external transaction
                    const thisTransaction = externalTransaction ? externalTransaction : t;

                    const updateDocument = {
                        categoryFk: this._category.id,
                        title: this._title,
                        accredited: this._accredited,
                        completed: this._completed,
                        expires: this._expires,
                        notes: this._notes,
                        updated: updatedTimestamp,
                        updatedBy: savedBy
                    };

                    // now save the document
                    let [updatedRecordCount, updatedRows] =
                        await models.workerTraining.update(updateDocument,
                                                           {
                                                                returning: true,
                                                                where: {
                                                                    uid: this.uid
                                                                },
                                                                attributes: ['id', 'updated'],
                                                                transaction: thisTransaction,
                                                           }
                                                          );

                    if (updatedRecordCount === 1) {
                        const updatedRecord = updatedRows[0].get({plain: true});

                        this._updated = updatedRecord.updated;
                        this._updatedBy = savedBy;
                        this._id = updatedRecord.ID;

                        this._log(Training.LOG_INFO, `Updated Training record with uid (${this.uid})`);

                    } else {
                        this._log(Training.LOG_ERROR, `Failed to update resulting Training record with id (${this._id})`);
                        throw new Error('Failed to update Training record');
                    }

                });
                
            } catch (err) {
                this._log(Training.LOG_ERROR, `Failed to update Training record with id (${this._id})`);
                throw new Error('Failed to update Training record');
            }

        }

        return mustSave;
    };

    // loads the Training record (with given uid) from DB, but only if it belongs to the given Worker
    // returns true on success; false if no Training Record
    // Can throw Error exception.
    async restore(uid) {

        if (!this.uuidV4Regex.test(uid)) {
            this._log(Training.LOG_ERROR, 'Failed to restore Training record with invalid UID');
            throw new Error('Failed to restore');
        }

        if (!this._establishmentId ||
            !this._workerUid) {
            this._log(Training.LOG_ERROR, 'Failed to restore Training record with unknown worker id and establishment id');
            throw new Error('Failed to restore');
        }

        try {
            // by including the worker id in the fetch, we are sure to only fetch those
            //  Training records associated to the given Worker   
            const fetchQuery = {
                where: {
                    uid: uid,
                },
                include: [
                    {
                        model: models.worker,
                        as: 'worker',
                        attributes: ['id', 'uid'],
                        where: {
                            uid: this._workerUid
                        }
                    },
                    {
                        model: models.workerTrainingCategories,
                        as: 'category',
                    }
                ]
            };

            const fetchResults = await models.workerTraining.findOne(fetchQuery);
            if (fetchResults && fetchResults.id && Number.isInteger(fetchResults.id)) {
                // update self - don't use setters because they modify the change state
                this._isNew = false;
                this._id = fetchResults.id;
                this._uid = fetchResults.uid;

                this._category = {
                    id: fetchResults.categoryFk,
                    category: fetchResults.category.category
                };
                this._title = fetchResults.title;
                this._accredited = fetchResults.accredited;
                this._completed = new Date(fetchResults.completed);
                this._expires = fetchResults.expires !== null ? new Date(fetchResults.expires) : null;
                this._notes = fetchResults.notes;

                this._created = fetchResults.created;
                this._updated = fetchResults.updated;
                this._updatedBy = fetchResults.updatedBy;

                return true;
            }

            return false;

        } catch (err) {
            // typically errors when making changes to model or database schema!
            this._log(Training.LOG_ERROR, err);

            throw new Error(`Failed to load Training record with uid (${this.uid})`);
        }
    };

    // deletes this Trainingrecord from DB
    // Can throw "Error"
    async delete() {
        if (this._workerUid === null ||
            this._establishmentId === null) {
            this._log(Training.LOG_ERROR, 'Cannot delete a training record having unknown establishment uid, worker uid or training uid');
            throw new Error('Failed to delete');
        }

        try {
            // by getting here, we known the training record belongs to the Worker, because it's been validated by restoring the training record first
            const fetchQuery = {
                where: {
                    uid: this._uid,
                },
                include: [
                    {
                        model: models.worker,
                        as: 'worker',
                        attributes: ['id', 'uid'],
                        where: {
                            uid: this._workerUid
                        }
                    }
                ]
            };

            const deleteResults = await models.workerTraining.destroy(fetchQuery);  // returns the number of records deleted
            if (deleteResults === 1) {
                // reset self - don't use setters because they modify the change state
                this._isNew = false;
                this._id = null;
                this._uid = null;
                this._workerUid = null;
                this._establishmentId = null;

                this._category = null;
                this._title = null;
                this._accredited = null;
                this._completed = null;
                this._expires = null;
                this._notes = null;

                this._created = null;
                this._updated = null;
                this._updatedBy = null;

                return true;
            }

            return false;

        } catch (err) {
            // typically errors when making changes to model or database schema!
            this._log(Training.LOG_ERROR, err);

            throw new Error(`Failed to delete Training record with uid (${this.uid})`);
        }
    };

    // returns a set of Workers' Training Records based on given filter criteria (all if no filters defined) - restricted to the given Worker
    static async fetch(establishmentId, workerId, filters=null) {
        if (filters) throw new Error("Filters not implemented");

        const allTrainingRecords = [];
        const fetchResults = await models.workerTraining.findAll({
            include: [
                {
                    model: models.worker,
                    as: 'worker',
                    attributes: ['id', 'uid'],
                    where: {
                        uid: workerId
                    }
                },
                {
                    model: models.workerTrainingCategories,
                    as: 'category',
                    attributes: ['id', 'category']
                }
            ],
            order: [
                //['completed', 'DESC'],
                ['updated', 'DESC']
            ]           
        });

        if (fetchResults) {
            fetchResults.forEach(thisRecord => {
                allTrainingRecords.push({
                    uid: thisRecord.uid,
                    category: thisRecord.category.category,
                    title: unescape(thisRecord.title),
                    accredited: thisRecord.accredited,
                    completed: new Date(thisRecord.completed),
                    expires: thisRecord.expires !== null ? new Date(thisRecord.expires) : undefined,
                    notes: thisRecord.notes !== null ? unescape(thisRecord.notes) : undefined,
                    created:  thisRecord.created.toISOString(),
                    updated: thisRecord.updated.toISOString(),
                    updatedBy: thisRecord.updatedBy,
                })
            });
        }

        let lastUpdated = null;
        if (fetchResults && fetchResults.length === 1) {
            lastUpdated = fetchResults[0];
        } else if (fetchResults && fetchResults.length > 1) {
            lastUpdated = fetchResults.reduce((a, b) => { return a.updated > b.updated ? a : b; });;
        }
        
        const response = {
            workerUid: workerId,
            count: allTrainingRecords.length,
            lastUpdated: lastUpdated ? lastUpdated.updated.toISOString() : undefined,
            training: allTrainingRecords,
        };

        return response;
    };

    // returns a Javascript object which can be used to present as JSON
    toJSON() {
        // add worker default properties
        const myDefaultJSON = {
            uid:  this.uid,
            workerUid: this._workerUid,
            created: this.created.toJSON(),
            updated: this.updated.toJSON(),
            updatedBy: this.updatedBy,
            trainingCategory: this.category,
            title: this.title,
            accredited: this.accredited,
            completed: this.completed,
            expires: this._expires !== null ? this.expires : undefined,
            notes: this._notes !== null ? this.notes : undefined
        };

        return myDefaultJSON;

    }

    // HELPERS
    // returns true if all mandatory properties for a Training Record exist and are valid
    get hasMandatoryProperties() {
        let allExistAndValid = true;    // assume all exist until proven otherwise
        
        // category must exist
        // title must exist
        // completed must exist
        // accredited must exist
        if (this.category === null ||
            this.name === null ||
            this.accredited === null ||
            this.completed == null) allExistAndValid = true

        return allExistAndValid;
    }
};

module.exports.Training = Training;
