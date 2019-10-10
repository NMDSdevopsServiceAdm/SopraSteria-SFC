/*
 * user.js
 *
 * The encapsulation of a User, including all properties, all specific validation (not API, but object validation),
 * saving & restoring of data to database (via sequelize model), construction and deletion.
 *
 * Also includes representation as JSON, in one or more presentations.
 */
const uuid = require('uuid');

// database models
const models = require('../index');
const Sequelize = require('sequelize');

// notifications
const sendAddUserEmail = require('../../utils/email/notify-email').sendAddUser;
const AWSKinesis = require('../../aws/kinesis');

const UserExceptions = require('./user/userExceptions');

// User properties
const UserProperties = require('./user/userProperties').UserPropertyManager;
const JSON_DOCUMENT_TYPE = require('./user/userProperties').JSON_DOCUMENT;
const SEQUELIZE_DOCUMENT_TYPE = require('./user/userProperties').SEQUELIZE_DOCUMENT;

const bcrypt = require('bcrypt-nodejs');
const passwordValidator = require('../../utils/security/passwordValidation').isPasswordValid;

// establishment entity
const Establishment = require('./establishment').Establishment;

class User {
    constructor(establishmentId, trackingUUID=null) {
        this._establishmentId = establishmentId;           // NOTE - a User has a direct link to an Establishment; this is likely to change with parent/sub
        this._id = null;
        this._uid = null;
        this._username = null;
        this._status = null;
        this._active = false;
        this._created = null;
        this._updated = null;
        this._updatedBy = null;
        this._auditEvents = null;

        // localised attributes - optional on load
        this._username = null;
        this._password = null;
        this._isPrimary - null;
        this._tribalId = null;
        this._lastLogin = null;
        this._establishmentUid = null;

        // abstracted properties
        const thisUserManager = new UserProperties();
        this._properties =thisUserManager.manager;

        // change properties
        this._isNew = false;

        // default logging level - errors only
        // TODO: INFO logging on User; change to LOG_ERROR only
        this._logLevel = User.LOG_INFO;

        this._trackingUUID = trackingUUID;
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

    // Maximum user types
    static get MAX_EDIT_PARENT_USERS() { return 3 }
    static get MAX_READ_PARENT_USERS() { return 20 }
    static get MAX_EDIT_SINGLE_USERS() { return 3 }
    static get MAX_READ_SINGLE_USERS() { return 3 }

    set logLevel(logLevel) {
        this._logLevel = logLevel;
    }

    _log(level, msg) {
        if (this._logLevel >= level) {
            console.log(`TODO: (${level}) - User class: `, msg);
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
    get username() {
        return this._username;
    }
    get status() {
      return this._status;
    }
    get fullname() {
        const prop = this._properties.get('Fullname');
        return prop ? prop.property : null;
    };
    get jobTitle() {
        const prop = this._properties.get('JobTitle');
        return prop ? prop.property : null;
    };
    get email() {
        const prop = this._properties.get('Email');
        return prop ? prop.property : null;
    };
    get phone() {
        const prop = this._properties.get('Phone');
        return prop ? prop.property : null;
    };
    get securityQuestion() {
        const prop = this._properties.get('SecurityQuestion');
        return prop ? prop.property : null;
    };
    get securityQuestionAnswer() {
        const prop = this._properties.get('SecurityQuestionAnswer');
        return prop ? prop.property : null;
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
    get isPrimary() {
        return this._auditEvents._isPrimary;
    }

    get trackingId() {
        return this._trackingUUID;
    }

    get userRole() {
        const prop = this._properties.get('UserRole');
        return prop ? prop.property : null;
    };

    get lastLogin() {
      return this._lastLogin;
    }

    get tribalId() {
      return this._tribalId;
    }

    get establishmentUid() {
      return this._establishmentUid;
    }

    set establishmentUid(uid) {
      this._establishmentUid = uid;
    }

    // used by save to initialise a new User; returns true if having initialised this user
    _initialise() {
        if (this._uid === null) {
            this._isNew = true;
            this._uid = uuid.v4();

            if (!this._isEstablishmentIdValid)
                throw new UserExceptions.UserSaveException(null,
                                                           this._uid,
                                                           this.fullname,
                                                           `Unexpected Establishment Id (${this._establishmentId})`,
                                                           'Unknown Establishment');


            // note, do not initialise the id as this will be returned by database
            return true;
        } else {
            return false;
        }
    }

    // takes the given JSON document and creates a User's set of extendable properties
    // Returns true if the resulting User is valid; otherwise false
    async load(document) {
        try {
            await this._properties.restore(document, JSON_DOCUMENT_TYPE);

            // for user, the username and password are additional (non property based) optional attributes
            if (document.username) {
                this._username = escape(document.username);
            }
            if (document.password) {
                this._password = escape(document.password);
            }

            if (document.isPrimary !== null) {
                // by explicitly checking for "true", don't have to worry about any other value
                if (document.isPrimary === true) {
                    this._isPrimary = true;
                } else {
                    this._isPrimary = false;
                }
            }
            if(document.isActive) {
              this._active = document.isActive;
            }
            if(document.status) {
              this._status = document.status;
            }
        } catch (err) {
            this._log(User.LOG_ERROR, `User::load - failed: ${err}`);
            throw new UserExceptions.UserJsonException(
                err,
                null,
                'Failed to load User from JSON');
        }
        return this.isValid();
    }

    // validates username; returns true if username is not defined
    get isUsernameValid() {
        // must be 50 or less characters
        if (this._username !== null) {
            if (this._username.length <= 50) {
                return true;
            } else {
                this._log(User.LOG_WARN, 'username is defined but invalid');
                return false;
            }
        } else {
            return true;
        }
    }

    // validates password; returns true if password is not defined
    get isPasswordValid() {
        // must meet password complexity
        if (this._password !== null) {
            if (passwordValidator(this._password)) {
                return true;
            } else {
                this._log(User.LOG_WARN, 'password is defined but invalid');
                return false;
            }
        } else {
            return true;
        }
    }

    // returns true if User is valid, otherwise false
    isValid() {
        // must also validate username and password - IF they are defined
        // the property manager returns a list of all properties that are invalid; or true
        const thisUserIsValid = this._properties.isValid === true && this.isUsernameValid && this.isPasswordValid;

        if (thisUserIsValid === true) {
            return true;
        } else {
            this._log(User.LOG_ERROR, `User invalid properties: ${thisUserIsValid.toString()}`);
            return false;
        }
    }

    // track new user helper - can only be done within a transaction
    async trackNewUser(savedBy, transaction, ttl) {
        // intentionally now exception handling - to ensure exception passes back up to calling function
        const fullnameProperty = this._properties.get('FullName').property
        const emailProperty = this._properties.get('Email').property;

        // generate a new tracking UUID
        this._trackingUUID = uuid.v4();

        // now before creating a new tracking record, need to close down
        //  any open tracking records for this user
        await models.addUserTracking.update(
            {
                completed: new Date(),
            },
            {
                transaction,
                where : {
                    userFk: this._id
                },
            }
        );

        // now add a tracking record
        const now = new Date();
        const expiresIn = new Date(now.getTime() + ttl);
        await models.addUserTracking.create(
            {
                userFk: this._id,
                created: now.toISOString(),
                expires: expiresIn.toISOString(),
                uuid: this._trackingUUID,
                by: savedBy.toLowerCase()
            },
            {transaction}
        );

        // now send the email
        await sendAddUserEmail(emailProperty, fullnameProperty, this._trackingUUID);

        return this._trackingUUID;
    }

    // saves the User to DB. Returns true if saved; false if not.
    // Throws "UserSaveException" on error
    async save(savedBy, ttl=0, externalTransaction=null, firstSave=false) {
        let mustSave = this._initialise();

        if (!this.uid) {
            this._log(User.LOG_ERROR, 'Not able to save an unknown uid');
            throw new UserExceptions.UserSaveException(null,
                this.uid,
                this.fullname,
                'Not able to save an unknown uid',
                'User does not exist');
        }

        if (mustSave && this._isNew) {
            // create new User
            try {
                // TODO: change to a managed property
                if (this._isPrimary === null) {
                    this._isPrimary = false;        // isPrimary is only explicitly declared on registration and it is true
                }

                const creationDocument = {
                    establishmentId: this._establishmentId,
                    uid: this.uid,
                    updatedBy: savedBy.toLowerCase(),
                    isPrimary: this._isPrimary,
                    archived: false,
                    attributes: ['id', 'created', 'updated'],
                };

                // need to create the User record and the User Audit event
                //  in one transaction
                await models.sequelize.transaction(async t => {
                    // the saving of an User can be initiated within
                    //  an external transaction
                    const thisTransaction = externalTransaction ? externalTransaction : t;

                    // now append the extendable properties.
                    // Note - although the POST (create) has a default
                    //   set of mandatory properties, there is no reason
                    //   why we cannot create a User record with more properties
                    const modifedCreationDocument = this._properties.save(savedBy.toLowerCase(), creationDocument);

                    // check all mandatory parameters have been provided
                    if (!this.hasMandatoryProperties) {
                        throw 'Missing Mandatory properties';
                    }

                    // now save the document
                    let creation = await models.user.create(modifedCreationDocument, {transaction: thisTransaction});

                    const sanitisedResults = creation.get({plain: true});

                    this._id = sanitisedResults.RegistrationID;
                    this._created = sanitisedResults.created;
                    this._updated = sanitisedResults.updated;
                    this._updatedBy = savedBy.toLowerCase();
                    this._isNew = false;

                    // create the associated Login record - if the username is known
                    if (this._username !== null) {
                        const passwordHash = await bcrypt.hashSync(this._password, bcrypt.genSaltSync(10), null);
                        await models.login.create(
                            {
                                registrationId: this._id,
                                username: this._username,
                                Hash: passwordHash,
                                status: this._status,
                                isActive: this._active,
                                invalidAttempt: 0,
                            },
                            {transaction: thisTransaction}
                        );

                        // also need to complete on the originating add user tracking record
                        const trackingResponse = await models.addUserTracking.update(
                            {
                                completed: sanitisedResults.created,        // use the very same timestamp as that which the User record was created!
                            },
                            {
                                transaction: thisTransaction,
                                where: {
                                    uuid: this._trackingUUID,
                                },
                                returning: true,
                                plain: false
                            }
                        );

                        // if there was a tracking record, need also to delete (archive) the original User record used for the registration
                        if (trackingResponse[1] && trackingResponse[1][0] && trackingResponse[1][0].dataValues)
                        await models.user.update(
                            {
                                archived: true
                            },
                            {
                                where: {
                                    id: trackingResponse[1][0].dataValues.UserFK
                                },
                                transaction: thisTransaction
                            }
                        )
                    }

                    // only create the audit records for the new user the username is known
                    if (this._username !== null) {
                        // having the user we can now create the audit record; injecting the userFk
                        const allAuditEvents = [{
                            userFk: this._id,
                            username: savedBy.toLowerCase(),
                            type: 'created'}].concat(this._properties.auditEvents.map(thisEvent => {
                                return {
                                    ...thisEvent,
                                    userFk: this._id
                                };
                            }));
                        await models.userAudit.bulkCreate(allAuditEvents, {transaction: thisTransaction});
                    }

                    // send invitation email if the username is not known
                    if (this._username === null) {
                        // need to send an email having added an "Add User" tracking record
                        await this.trackNewUser(savedBy.toLowerCase(), t, ttl);
                    }

                    // this is an async method - don't wait for it to return
                    AWSKinesis.userPump(AWSKinesis.CREATED, this.toJSON());

                    this._log(User.LOG_INFO, `Created User with uid (${this.uid}) and id (${this._id})`);
                });

            } catch (err) {
                // need to handle duplicate username
                if (err.name && err.name === 'SequelizeUniqueConstraintError') {
                    if (err.parent.constraint && err.parent.constraint === 'uc_Login_Username') {
                        throw new UserExceptions.UserSaveException(null, this.uid, this.fullname, 'Duplicate Username', 'Duplicate Username');
                    }
                } else {
                    throw new UserExceptions.UserSaveException(null, this.uid, this.fullname, err, null);
                }
            }
        } else {
            // we are updating an existing User
            try {
                const updatedTimestamp = new Date();

                // need to update the existing User record and add an
                //  updated audit event within a single transaction
                await models.sequelize.transaction(async t => {

                    // the saving of an User can be initiated within
                    //  an external transaction
                    const thisTransaction = externalTransaction ? externalTransaction : t;

                    // Is this the intial update setup
                    if(firstSave){

                        const passwordHash = await bcrypt.hashSync(this._password, bcrypt.genSaltSync(10), null);
                        await models.login.create(
                            {
                                registrationId: this._id,
                                username: this._username,
                                Hash: passwordHash,
                                status: this._status,
                                isActive: this._active,
                                invalidAttempt: 0,
                            },
                            {transaction: thisTransaction}
                        );

                        // also need to complete on the originating add user tracking record
                        const trackingResponse = await models.addUserTracking.update(
                            {
                                completed: this.created,        // use the very same timestamp as that which the User record was created!
                            },
                            {
                                transaction: thisTransaction,
                                where: {
                                    uuid: this._trackingUUID,
                                },
                                returning: true,
                                plain: false
                            }
                        );

                        const allAuditEvents = [{
                            userFk: this._id,
                            username: savedBy.toLowerCase(),
                            type: 'created'}];
                        await models.userAudit.bulkCreate(allAuditEvents, {transaction: thisTransaction});
                    }

                    if(this._isPrimary){
                        // Set the existing primary to not primary
                        await models.user.update({
                                isPrimary: false,
                                updated: new Date(),
                                updatedBy: savedBy.toLowerCase()
                            },{
                            where: {
                                uid: { $not: this.uid},
                                establishmentId: this._establishmentId,
                                archived: false,
                                isPrimary: true
                            },
                            transaction: thisTransaction,
                            returning: true,
                            raw: true,
                            attributes: ['id', 'updated'],
                        });
                    }

                    // now append the extendable properties
                    const modifedUpdateDocument = this._properties.save(savedBy.toLowerCase(), {});

                    const updateDocument = {
                        ...modifedUpdateDocument,
                        isPrimary: this._isPrimary,
                        updated: updatedTimestamp,
                        updatedBy: savedBy.toLowerCase()
                    };

                    // now save the document
                    let [updatedRecordCount, updatedRows] =
                        await models.user.update(updateDocument,
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
                        this._id = updatedRecord.RegistrationID;

                        // if we're updating a part added user (registered only not completed - username is not known)
                        //  then we need to complete on any outstanding add user tracking for that user
                        //  and create another one, which includes sending an email with that tracking request.
                        if (this._username === null) {
                            // need to send an email having added an "Add User" tracking record
                            await this.trackNewUser(savedBy.toLowerCase(), t, ttl);
                        }

                        // only create the audit records for the new user the username is known
                        if (this._username !== null) {
                            const allAuditEvents = [{
                                userFk: this._id,
                                username: savedBy.toLowerCase(),
                                type: 'updated'}].concat(this._properties.auditEvents.map(thisEvent => {
                                    return {
                                        ...thisEvent,
                                        userFk: this._id
                                    };
                                }));
                                // having updated the record, create the audit event
                            await models.userAudit.bulkCreate(allAuditEvents, {transaction: thisTransaction});
                        }

                        // now - work through any additional models having processed all properties (first delete and then re-create)
                        const additionalModels = this._properties.additionalModels;
                        const additionalModelsByname = Object.keys(additionalModels);
                        const deleteModelPromises = [];
                        additionalModelsByname.forEach(async thisModelByName => {
                            deleteModelPromises.push(
                                models[thisModelByName].destroy({
                                    where: {
                                        userFk: this._id
                                    },
                                    transaction: thisTransaction,
                                  })
                            );
                        });
                        await Promise.all(deleteModelPromises);
                        const createModelPromises = [];
                        additionalModelsByname.forEach(async thisModelByName => {
                            const thisModelData = additionalModels[thisModelByName];
                            createModelPromises.push(
                                models[thisModelByName].bulkCreate(
                                    thisModelData.map(thisRecord => {
                                        return {
                                            ...thisRecord,
                                            userFk: this._id
                                        };
                                    }),
                                    { transaction: thisTransaction },
                                )
                            );
                        });
                        await Promise.all(createModelPromises);

                        // this is an async method - don't wait for it to return
                        AWSKinesis.userPump(AWSKinesis.UPDATED, this.toJSON());

                        this._log(User.LOG_INFO, `Updated User with uid (${this.uid}) and name (${this.fullname})`);

                    } else {
                        throw new UserExceptions.UserSaveException(null, this.uid, this.fullname, err, `Failed to update resulting user record with id: ${this._id}`);
                    }

                });

            } catch (err) {
                throw new UserExceptions.UserSaveException(null, this.uid, this.fullname, err, `Failed to update user record with id: ${this._id}`);
            }

        }

        return mustSave;
    };

    // loads the User (with given id or username) from DB, but only if it belongs to the given Establishment
    // returns true on success; false if no User
    // Can throw WorkerRestoreException exception.
    async restore(uid, uname, showHistory=false) {
        if (!uid && !uname) {
            throw new UserExceptions.UserRestoreException(null,
                null,
                null,
                'User::restore failed: Missing uid or username',
                null,
                'Unexpected Error');
        }

        try {
            // by including the establishment id in the
            //  fetch, we are sure to only fetch those
            //  User records associated to the given
            //   establishment
            let fetchQuery = null;

            if (uname) {
                // fetch by username
                fetchQuery = {
                    where: {
                        archived: false,
                    },
                    include: [
                        {
                            model: models.login,
                            attributes: ['username', 'lastLogin'],
                            where: {
                                username: uname
                            }
                        }
                    ]
                };
            } else {
                // fetch by username
                fetchQuery = {
                    where: {
                        uid: uid,
                        archived: false,
                    },
                    include: [
                        {
                            model: models.login,
                            attributes: ['username', 'lastLogin']
                        }
                    ]
                };
            }

            const fetchResults = await models.user.findOne(fetchQuery);
            if (fetchResults && fetchResults.id && Number.isInteger(fetchResults.id)) {
                // update self - don't use setters because they modify the change state
                this._isNew = false;
                this._id = fetchResults.id;
                this._uid = fetchResults.uid;
                this._username = fetchResults.login && fetchResults.login.username ? fetchResults.login.username : null;
                this._created = fetchResults.created;
                this._updated = fetchResults.updated;
                this._updatedBy = fetchResults.updatedBy;
                this._tribalId = fetchResults.tribalId;
                this._lastLogin = fetchResults.login && fetchResults.login.username  ? fetchResults.login.lastLogin : null;

                // TODO: change to amanaged property
                this._isPrimary = fetchResults.isPrimary;
                // if history of the User is also required; attach the association
                //  and order in reverse chronological - note, order on id (not when)
                //  because ID is primay key and hence indexed
                if (showHistory) {
                    fetchResults.auditEvents = await models.userAudit.findAll({
                        where: {
                            userFk: this._id
                        },
                        order: [
                            ['id','DESC']
                        ]
                    });
                }

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
            this._log(User.LOG_ERROR, err);

            throw new UserExceptions.UserRestoreException(null, this.uid, null, err, null);
        }
    };

    async delete(deletedBy, externalTransaction=null, associatedEntities=false) {

        try {
            const updatedTimestamp = new Date();

            await models.sequelize.transaction(async t => {

                const thisTransaction = externalTransaction ? externalTransaction : t;
                let randomNewUsername = uuid.v4();
                let oldUsername = this._username;

                const updateDocument = {
                    updated: updatedTimestamp,
                    updatedBy: deletedBy,
                    archived: true,
                    FullNameValue: false,
                    isPrimary: false,
                    Username: randomNewUsername,
                    EmailValue: '',
                    PhoneValue: '',
                    JobTitle: '',
                    SecurityQuestionValue: '',
                    SecurityQuestionAnswerValue: ''
                };

                let [updatedRecordCount, updatedRows] = await models.user.update(updateDocument,
                                            {
                                                returning: true,
                                                where: {
                                                    uid: this.uid
                                                },
                                                attributes: ['id', 'updated'],
                                                transaction: thisTransaction,
                                            });

                if (updatedRecordCount === 1) {

                    await models.login.update({
                        isActive: false
                    },{
                    where: {
                        registrationId: this._id
                    },
                    transaction: thisTransaction
                    });

                    await models.addUserTracking.update(
                        {
                            completed: new Date(),
                        },
                        {
                            transaction: thisTransaction,
                            where : {
                                userFk: this._id
                            },
                        }
                    );

                    const auditEvent = {
                        userFk: this._id,
                        username: deletedBy,
                        type: 'delete',
                        property: 'isActive',
                        event: {}
                    };
                    await models.userAudit.create(auditEvent, {transaction: thisTransaction});

                    await models.sequelize.query('UPDATE  cqc."EstablishmentAudit" SET "Username" = :usernameNew WHERE "Username" = :username', { replacements: { username: oldUsername, usernameNew: randomNewUsername },type: models.sequelize.QueryTypes.UPDATE, transaction: thisTransaction });
                    await models.sequelize.query('UPDATE cqc."UserAudit" SET "Username" = :usernameNew WHERE "Username" = :username', { replacements: { username: oldUsername, usernameNew: randomNewUsername }, type: models.sequelize.QueryTypes.UPDATE, transaction: thisTransaction });
                    await models.sequelize.query('UPDATE cqc."WorkerAudit" SET "Username" = :usernameNew WHERE "Username" = :username', { replacements: { username: oldUsername, usernameNew: randomNewUsername }, type: models.sequelize.QueryTypes.UPDATE, transaction: thisTransaction });

                    AWSKinesis.userPump(AWSKinesis.DELETED, this.toJSON());

                    this._log(User.LOG_INFO, `Archived User with uid (${this._uid}) and id (${this._id})`);

                } else {
                    const nameId = this._properties.get('NameOrId');
                    throw new UserExceptions.UserDeleteException(null,
                                                                        this.uid,
                                                                        null,
                                                                        err,
                                                                        `Failed to update (archive) user record with uid: ${this._uid}`);
                }

            });
        } catch (err) {
            console.log('throwing error');
            console.log(err);
            throw new UserExceptions.UserDeleteException(null,
                this.uid,
                null,
                err,
                `Failed to update (archive) user record with uid: ${this._uid}`);
        }
    };


    static async fetchUserTypeCounts(establishmentId){
        const results = await models.user.findAll({
            attributes: ['UserRoleValue', [Sequelize.fn('count', Sequelize.col('UserRoleValue')), 'roleCount']],
            group: ['UserRoleValue'],
            where: {
                establishmentId: establishmentId,
                archived: false
            },
            raw: true
        });

        const returnData = { 'Read': 0, 'Edit': 0};

        results.forEach((element) => {
            returnData[element.UserRoleValue] = Number.parseInt(element.roleCount);
        });

        return returnData;
    }

    // returns a set of User based on given filter criteria (all if no filters defined) - restricted to the given Establishment
    static async fetch(establishmentId, filters=null) {
        if (filters) throw new Error("Filters not implemented");

        let allUsers = [];
        const fetchResults = await models.user.findAll({
            where: {
                establishmentId: establishmentId,
                archived: false
            },
            include: [
                {
                    model: models.login,
                    attributes: ['username', 'lastLogin']
                }
            ],
            attributes: ['uid', 'FullNameValue', 'EmailValue', 'UserRoleValue', 'created', 'updated', 'updatedBy','isPrimary'],
            order: [
                ['updated', 'DESC']
            ]
        });

        if (fetchResults) {
            fetchResults.forEach(thisUser => {
                allUsers.push({
                    uid: thisUser.uid,
                    fullname: thisUser.FullNameValue,
                    email: thisUser.EmailValue,
                    role: thisUser.UserRoleValue,
                    lastLoggedIn: thisUser.login && thisUser.login.username ? thisUser.login.lastLogin : null,
                    username: thisUser.login && thisUser.login.username ? thisUser.login.username : null,
                    created:  thisUser.created.toJSON(),
                    updated: thisUser.updated.toJSON(),
                    updatedBy: thisUser.updatedBy,
                    isPrimary: thisUser.isPrimary ? true : false
                })
            });

            allUsers = allUsers.map((user) => {
                return Object.assign(user, { status: user.username == null ? 'Pending' : 'Active'});
            });

            allUsers.sort((a, b) => {
                if((a.status > b.status)) return -1;
                return (new Date(b.updated) - new Date(a.updated))
            });
        }

        return allUsers;
    };

    // helper returns a set 'json ready' objects for representing a User's overall
    //  change history, from a given set of audit events (those events being created
    //  or updated only)
    formatWorkerHistoryEvents(auditEvents) {
        if (auditEvents) {
            return auditEvents.filter(thisEvent => ['created', 'updated', 'loginSuccess', 'loginFailed', 'loginWhileLocked', 'passwdReset'].includes(thisEvent.type))
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

    // helper returns a set 'json ready' objects for representing a User's audit
    //  history, from a the given set of audit events including those of individual
    //  User properties)
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
    //  showHistory appends the historical account of changes at User and individual property level
    //  showHistoryTimeline just returns the history set of audit events for the given User
    toJSON(showHistory=false, showPropertyHistoryOnly=true, showHistoryTimeline=false, modifiedOnlyProperties=false) {
        if (!showHistoryTimeline) {
            // JSON representation of extendable properties
            const myJSON = this._properties.toJSON(showHistory, showPropertyHistoryOnly, modifiedOnlyProperties);

            // add worker default properties
            const myDefaultJSON = {
                uid:  this.uid,
                username: this.username,
            };

            myDefaultJSON.created = this.created.toJSON();
            myDefaultJSON.updated = this.updated.toJSON();
            myDefaultJSON.updatedBy = this.updatedBy;
            myDefaultJSON.isPrimary = (this._isPrimary) ? true : false;
            myDefaultJSON.lastLoggedIn = this._lastLogin;
            myDefaultJSON.establishmentId = this._establishmentId;
            myDefaultJSON.establishmentUid = this._establishmentUid ? this._establishmentUid : undefined;

            // migrated user first logged in
            const migratedUserFirstLogin = this._tribalId !== null && this._lastLogin === null ? true : false;
            myDefaultJSON.migratedUserFirstLogon = migratedUserFirstLogin;
            myDefaultJSON.migratedUser = this._tribalId !== null ? true : false;

            // TODO: JSON schema validation
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
                username: this.username,
                created: this.created.toJSON(),
                updated: this.updated.toJSON(),
                updatedBy: this.updatedBy,
                history: this.formatWorkerHistory(this._auditEvents)
            };
        }
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


    // returns true if all mandatory properties for a User exist and are valid
    get hasMandatoryProperties() {
        let allExistAndValid = true;    // assume all exist until proven otherwise
        try {
            const fullnameProperty = this._properties.get('FullName');
            if (!(fullnameProperty && fullnameProperty.isInitialised && fullnameProperty.valid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasMandatoryProperties - missing or invalid fullname');
            }

            const jobTitle = this._properties.get('JobTitle');
            if (!(jobTitle && jobTitle.isInitialised && jobTitle.valid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasMandatoryProperties - missing or invalid job title');
            }

            const emailProperty = this._properties.get('Email');
            if (!(emailProperty && emailProperty.isInitialised && emailProperty.valid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasMandatoryProperties - missing or invalid email');
            }

            const phoneProperty = this._properties.get('Phone');
            if (!(phoneProperty && phoneProperty.isInitialised && phoneProperty.valid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasMandatoryProperties - missing or invalid phone');
            }

            const roleProperty = this._properties.get('UserRole');
            if (!(roleProperty && roleProperty.isInitialised && roleProperty.valid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasMandatoryProperties - missing or invalid role');
            }

        } catch (err) {
            console.error(err)
        }

        return allExistAndValid;
    }

    // returns true if all default properties required to createa new User exist and are valid
    get hasDefaultNewUserProperties() {
        let allExistAndValid = true;    // assume all exist until proven otherwise
        try {
            // must at least have the mandatory properties
            if (!this.hasMandatoryProperties) {
                allExistAndValid = false;
            }

            const questionProperty = this._properties.get('SecurityQuestion');
            if (!(questionProperty && questionProperty.isInitialised && questionProperty.valid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasDefaultNewUserProperties - missing or invalid Security Question');
            }

            const answerProperty = this._properties.get('SecurityQuestionAnswer');
            if (!(answerProperty && answerProperty.isInitialised && answerProperty.valid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasDefaultNewUserProperties - missing or invalid Security Question Answer');
            }

            // username must exist
            if (!(this._username !== null && this.isUsernameValid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasDefaultNewUserProperties - missing or invalid Username');
            }

            // password must exist
            if (!(this._password !== null && this.isPasswordValid)) {
                allExistAndValid = false;
                this._log(User.LOG_ERROR, 'User::hasDefaultNewUserProperties - missing or invalid Password');
            }

        } catch (err) {
            console.error(err)
        }

        return allExistAndValid;
    };

    // returns the set Establishments associated to this user
    //   the primary establishment is identified within the JWT
    // returns false if primary establishment is not found
    async myEstablishments(isParent, isWDF, filters=null) {
        if (filters) throw new Error("Filters not implemented");

        const primaryEstablishmentId = this._establishmentId;

        return await Establishment.fetchMyEstablishments(isParent, primaryEstablishmentId, isWDF);
    };

};

module.exports.User = User;

// sub types
module.exports.UserExceptions = UserExceptions;
