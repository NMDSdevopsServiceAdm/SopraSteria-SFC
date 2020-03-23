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

const EntityValidator = require('./validations/entityValidator').EntityValidator;
const ValidationMessage = require('./validations/validationMessage').ValidationMessage;

class Training extends EntityValidator {
    constructor(establishmentId, workerUid) {
        super();

        this._establishmentId = establishmentId;
        this._workerUid = workerUid;
        this._workerId = null;
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

    get workerId() {
        return this._workerId;
    }
    get workerUid() {
        return this._workerUid;
    }
    get establishmentId() {
        return this._establishmentId;
    }
    set workerId(newID) {
        this._workerId = newID;
    }
    set workerUid(newUid) {
        this._workerUid = newUid;
    }
    set establishmentId(newId) {
        this._establishmentId = newId;
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
        if (this._title === null) return null;
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
        if (title !== null) {
            this._title = escape(title);
        } else {
            this._title = null;
        }
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
        if (notes !== null) {
            // do not escape null!
            this._notes = escape(notes);
        } else {
            this._notes = null;
        }
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

    async preValidateTrainingRecord(){

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
            this._validations.push(new ValidationMessage(
                ValidationMessage.ERROR,
                100,
                'Failed to get all training categories',
                ['TrainingCategory']
            ));

            this._log(Training.LOG_ERROR, 'Failed to get all training categories');
            return false;
        }

        let returnStatus = true;

        // training category
        const validatedTrainingRecord = {};
        if (document.trainingCategory) {

            // validate category
            if (!(document.trainingCategory.id || document.trainingCategory.category)) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    101,
                    'trainingCategory.id or trainingCategory.category must exist',
                    ['TrainingCategory']
                ));

                this._log(Training.LOG_ERROR, 'category failed validation: trainingCategory.id or trainingCategory.category must exist');
                returnStatus = false;
            }

            if (document.trainingCategory.id && !Number.isInteger(document.trainingCategory.id)) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    102,
                    `trainingCategory.id (${document.trainingCategory.id}) must be an integer`,
                    ['TrainingCategory']
                ));
                this._log(Training.LOG_ERROR, `category failed validation: trainingCategory.id (${document.trainingCategory.id}) must be an integer`);
                returnStatus = false;
            }

            let foundCategory = null;
            if (document.trainingCategory.id) {
                foundCategory = trainingCategories.find(thisCategory => thisCategory.id === document.trainingCategory.id);
            } else {
                foundCategory = trainingCategories.find(thisCategory => {
                    return thisCategory.category === document.trainingCategory.category
                });
            }

            if (foundCategory === null || foundCategory === undefined) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    103,
                    `trainingCategory.id (${document.trainingCategory.id}) or trainingCategory.category (${document.trainingCategory.category}) must exist`,
                    ['TrainingCategory']
                ));
                this._log(Training.LOG_ERROR, `category failed validation: trainingCategory.id (${document.trainingCategory.id}) or trainingCategory.category (${document.trainingCategory.category}) must exist`);
                returnStatus = false;
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
            if (
                document.title.length > MAX_LENGTH) {
                    this._validations.push(new ValidationMessage(
                        ValidationMessage.ERROR,
                        110,
                        `validation: MAX(${MAX_LENGTH}) length`,
                        ['Title']
                    ));
                    this._log(Training.LOG_ERROR, `title failed validation: title failed validation: MAX(${MAX_LENGTH}) length`);
                returnStatus = false;
            }

            validatedTrainingRecord.title = document.title;
        } else {
            validatedTrainingRecord.title = null;
        }

        // accredited - boolean value (or string equivalent of true/false)!
        if (document.accredited) {
            // validate accredited - JSON only allows true/false
            const ALLOWED_VALUES = ['Yes', 'No', 'Don\'t know'];
            if (!(ALLOWED_VALUES.includes(document.accredited))) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.WARNING,
                    120,
                    `unexpected value - ${document.accredited}`,
                    ['Accredited']
                ));
                this._log(Training.LOG_ERROR, `accredited failed validation: accredited failed validation: unexpected value - ${document.accredited}`);
                returnStatus = false;
            }

            validatedTrainingRecord.accredited = document.accredited;

        } else {
            validatedTrainingRecord.accredited = null;
        }

        // completed
        if (document.completed) {
            // validate completed - must be a valid date
            const expectedDate = moment.utc(document.completed, 'YYYY-MM-DD');
            if (!expectedDate.isValid()) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    130,
                    `unexpected date - ${document.completed}`,
                    ['Completed']
                ));
                this._log(Training.LOG_ERROR, 'completed failed validation: incorrect date');
                returnStatus = false;
            }
            if (!expectedDate.isSameOrBefore(moment(), 'day')) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    131,
                    `must be in the past - ${document.completed}`,
                    ['Completed']
                ));
                this._log(Training.LOG_ERROR, 'completed failed validation: must be before today');
                returnStatus = false;
            }

            validatedTrainingRecord.completed = expectedDate;
        } else {
            validatedTrainingRecord.completed = null;
        }

        // expires
        if (document.expires) {
            const expectedDate = moment.utc(document.expires, 'YYYY-MM-DD');
            if (!expectedDate.isValid()) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    140,
                    `unexpected date - ${document.expires}`,
                    ['Expires']
                ));

                this._log(Training.LOG_ERROR, 'expires failed validation: incorrect date');
                returnStatus = false;
            }

            // validation against completed is only relevant if completed has been given
            if (validatedTrainingRecord.completed && !expectedDate.isAfter(validatedTrainingRecord.completed, 'day')) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.ERROR,
                    141,
                    `must be in the past - ${document.expires}`,
                    ['Expires']
                ));

                this._log(Training.LOG_ERROR, 'expires failed validation: must expire after completed');
                returnStatus = false;
            }

            validatedTrainingRecord.expires = expectedDate;
        } else {
            // expires is not present
            validatedTrainingRecord.expires = null;
        }

        // notes
        if (document.notes) {
            // validate title
            const MAX_LENGTH=1000;
            if (document.notes.length > MAX_LENGTH) {
                this._validations.push(new ValidationMessage(
                    ValidationMessage.WARNING,
                    150,
                    `validation: MAX (${MAX_LENGTH}) length`,
                    ['Notes']
                ));

                this._log(Training.LOG_ERROR, `notes failed validation: MAX (${MAX_LENGTH}) length`);
                returnStatus = false;
            }

            validatedTrainingRecord.notes = document.notes;
        } else {
            // notes not present
            validatedTrainingRecord.notes = null;
        }

        if (returnStatus === false) {
            return false;
        } else {
            return validatedTrainingRecord;
        }
    }

    // takes the given JSON document and updates self (internal properties)
    // Thows "Error" on error.
    async load(document) {
        try {
            this.resetValidations();

            const validatedTrainingRecord = await this.validateTrainingRecord(document);

            if (validatedTrainingRecord !== false) {
                this.category = validatedTrainingRecord.trainingCategory;
                this.title = validatedTrainingRecord.title;
                this.accredited = validatedTrainingRecord.accredited;
                this.completed = validatedTrainingRecord.completed ? validatedTrainingRecord.completed.toJSON().slice(0,10) : null;
                this.expires = validatedTrainingRecord.expires ? validatedTrainingRecord.expires.toJSON().slice(0,10) : null;
                this.notes = validatedTrainingRecord.notes;
            } else {
                this._log(Training.LOG_ERROR, `Training::load - failed`);
                return false
            }
        } catch (err) {
            this._log(Training.LOG_ERROR, `Training::load - error: ${err}`);
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
    async save(savedBy, bulkUploaded=false, ttl=0, externalTransaction=null) {
        let mustSave = this._initialise();

        if (!this.uid) {
            this._log(Training.LOG_ERROR, 'Not able to save an unknown training uid');
            throw Error('Invalid Training UID');
        }

        if (mustSave && this._isNew) {
            // create new Training Record
            try {
                // must validate the Worker record
                let workerRecord = null;


                if (!this._workerId) {
                    workerRecord = await models.worker.findOne({
                        where: {
                            establishmentFk: this._establishmentId,
                            uid: this._workerUid,
                            archived: false
                        },
                        attributes: ['id']
                    });
                } else {
                    workerRecord = {
                        id: this._workerId
                    };
                }

                if (workerRecord && workerRecord.id) {
                    const now = new Date();
                    const creationDocument = {
                        workerFk: workerRecord.id,
                        uid: this._uid,
                        created: now,
                        updated: now,
                        updatedBy: savedBy.toLowerCase(),
                        source: bulkUploaded ? 'Bulk' : 'Online',
                        categoryFk: this._category.id,
                        title: this.title,
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
                        this._updatedBy = savedBy.toLowerCase();
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

                    // note - if the training was created online, but then updated via bulk upload, the source become bulk and vice-versa.
                    const updateDocument = {
                        categoryFk: this._category.id,
                        title: this.title,
                        accredited: this._accredited,
                        completed: this._completed,
                        expires: this._expires,
                        notes: this._notes,
                        source: bulkUploaded ? 'Bulk' : 'Online',
                        updated: updatedTimestamp,
                        updatedBy: savedBy.toLowerCase()
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
                        this._updatedBy = savedBy.toLowerCase();
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
                this._completed = fetchResults.completed ? new Date(fetchResults.completed).toISOString().slice(0, 10) : null;
                this._expires = fetchResults.expires !== null ? new Date(fetchResults.expires).toISOString().slice(0, 10) : null;
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
    static async fetch(establishmentId, workerId, categoryId = null, filters=null) {
        if (filters) throw new Error("Filters not implemented");

        const allTrainingRecords = [];
        let fetchResults;
        if(categoryId === null){
          fetchResults = await models.workerTraining.findAll({
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
        }else{
          fetchResults = await models.workerTraining.findAll({
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
            ],
            where:{
              categoryFk: categoryId
            }
        });
        }

        if (fetchResults) {
            fetchResults.forEach(thisRecord => {
                allTrainingRecords.push({
                    uid: thisRecord.uid,
                    trainingCategory: {
                        id: thisRecord.category.id,
                        category: thisRecord.category.category
                    },
                    title: thisRecord.title ? unescape(thisRecord.title) : undefined,
                    accredited: thisRecord.accredited ? thisRecord.accredited : undefined,
                    completed: thisRecord.completed ? new Date(thisRecord.completed).toISOString().slice(0, 10) : undefined,
                    expires: thisRecord.expires !== null ? new Date(thisRecord.expires).toISOString().slice(0, 10) : undefined,
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
            created: this.created ? this.created.toJSON() : undefined,
            updated: this.updated ? this.updated.toJSON() : undefined,
            updatedBy: this.updatedBy,
            trainingCategory: this.category,
            title: this.title ? this.title : undefined,
            accredited: this.accredited ? this.accredited : undefined,
            completed: this.completed ? this.completed : undefined,
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
        if (this.category === null) allExistAndValid = false

        return allExistAndValid;
    }

    /**
     * Function used to get all training expired and expiring soon counts for a worker id
     * @param {number} establishmentId
     * @param {object} workerRecords
     * @return {array} Modified worker records while adding training counts & missing mandatory training counts for each worker object
     */
    static async getAllRequiredCounts(establishmentId, workerRecords, categoryId = null){
      if(workerRecords.length !== 0){
        let currentDate = moment();
        for(let i = 0; i < workerRecords.length; i++){
          const allTrainingRecords = await Training.fetch(establishmentId, workerRecords[i].uid, categoryId);
          workerRecords[i].trainingCount = 0;
          workerRecords[i].expiredTrainingCount = 0;
          workerRecords[i].expiringTrainingCount = 0;
          workerRecords[i].missingMandatoryTrainingCount = 0;
          if(allTrainingRecords && allTrainingRecords.training.length > 0){
            //calculate all expired and expiring soon training count
            let trainings = allTrainingRecords.training;
            for(let j = 0; j < trainings.length; j++){
              if(allTrainingRecords.training[j].expires){
                let expiringDate = moment(allTrainingRecords.training[j].expires);
                let daysDiffrence = expiringDate.diff(currentDate, 'days');
                if(daysDiffrence < 0){
                  workerRecords[i].expiredTrainingCount++;
                }else if(daysDiffrence >= 0 && daysDiffrence <= 90){
                  workerRecords[i].expiringTrainingCount++;
                }
              }
            }
          }else{
            if(categoryId !== null){
              workerRecords[i].missingMandatoryTrainingCount++;
            }
          }
          if(categoryId === null){
            workerRecords[i].missingMandatoryTrainingCount = await Training.getAllMissingMandatoryTrainingCounts(establishmentId, workerRecords[i], allTrainingRecords.training);
          }
          workerRecords[i].trainingCount = workerRecords[i].expiredTrainingCount + workerRecords[i].expiringTrainingCount + workerRecords[i].missingMandatoryTrainingCount;
        }
        return workerRecords;
      }
    }

    /**
     * Function used to get all missing mandatory training counts for a worker id
     * @param {number} establishmentId
     * @param {object} workerRecords
     * @param {array} trainingLists
     * @return {array} Modified worker records while adding training counts & missing mandatory training counts for each worker object
     */
    static async getAllMissingMandatoryTrainingCounts(establishmentId, workerRecords, trainingLists){
        // check for missing mandatory training
        const fetchMandatoryTrainingResults = await models.MandatoryTraining.findAll({
            where: {
                establishmentFK: establishmentId,
                jobFK: (workerRecords.mainJob.jobId)? workerRecords.mainJob.jobId: workerRecords.mainJob.id
            }
        });
        let mandatoryTrainingLength = fetchMandatoryTrainingResults ? fetchMandatoryTrainingResults.length: 0;
        let trainingLength = trainingLists.length;
        if(mandatoryTrainingLength > 0){
            if(trainingLength === 0){
                return mandatoryTrainingLength;
            }
            let missingMandatoryTrainingCount = 0;
            for(let i = 0; i < mandatoryTrainingLength; i++){
              let foundMandatoryTraining = false;
              for(let j = 0; j < trainingLength; j++){
                if(fetchMandatoryTrainingResults[i].trainingCategoryFK === trainingLists[j].trainingCategory.id){
                  foundMandatoryTraining = true;
                }
              }
              if(!foundMandatoryTraining){
                missingMandatoryTrainingCount++;
              }
            }
            return missingMandatoryTrainingCount;
        }else{
            return 0;
        }
    }
};

module.exports.Training = Training;
