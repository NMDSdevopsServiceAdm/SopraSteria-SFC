/*
 * establishment.js
 *
 * The encapsulation of a Establishment, including all properties, all specific validation (not API, but object validation),
 * saving & restoring of data to database (via sequelize model), construction and deletion.
 * 
 * Also includes representation as JSON, in one or more presentations.
 */
const uuid = require('uuid');

// database models
const models = require('../index');

// notifications

// temp formatters
const ServiceFormatters = require('../api/services');
const CapacityFormatters = require('../api/capacity');
const ShareFormatters = require('../api/shareData');
const JobFormatters = require('../api/jobs');


// exceptions
const EstablishmentExceptions = require('./establishment/establishmentExceptions');

// User properties
const EstablishmentProperties = require('./establishment/establishmentProperties').EstablishmentPropertyManager;
const JSON_DOCUMENT_TYPE = require('./user/userProperties').JSON_DOCUMENT;
const SEQUELIZE_DOCUMENT_TYPE = require('./user/userProperties').SEQUELIZE_DOCUMENT;

class Establishment {
    constructor(username) {
        this._username = username;
        this._id = null;
        this._uid = null;
        this._created = null;
        this._updated = null;
        this._updatedBy = null;
        this._auditEvents = null;

        // localised attributes
        this._name = null;
        this._address = null;
        this._locationId = null;
        this._postcode = null;
        this._isRegulated = null;
        this._mainService = null;
        this._nmdsId = null;

        // abstracted properties
        const thisEstablishmentManager = new EstablishmentProperties();
        this._properties =thisEstablishmentManager.manager;

        // change properties
        this._isNew = false;
        
        // default logging level - errors only
        // TODO: INFO logging on User; change to LOG_ERROR only
        this._logLevel = Establishment.LOG_INFO;
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
            console.log(`TODO: (${level}) - Establishment class: `, msg);
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
    get name() {
        return this._name;
    };
    get address() {
        return this._address;
    };
    get locationId() {
        return this._locationId;
    };
    get postcode() {
        return this._postcode;
    };
    get isRegulated() {
        return this._isRegulated;
    };
    get mainService() {
        return this._mainService;
    };
    get nmdsId() {
        return this._nmdsId;
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

    // used by save to initialise a new Establishment; returns true if having initialised this Establishment
    _initialise() {
        if (this._uid === null) {
            this._isNew = true;
            this._uid = uuid.v4();
            
            // note, do not initialise the id as this will be returned by database
            return true;
        } else {
            return false;
        }
    }

    // external method to initialise the mandatory non-extendable properties
    initialise(name, address, locationId, postcode, isRegulated, mainServiceId, nmdsId) {
        this._name = name;
        this._address = address;
        this._postcode = postcode;
        this._isRegulated = isRegulated;
        this._locationId = locationId;
        this._mainService = {
            id: mainServiceId
        };
        this._nmdsId = nmdsId;
    }

    // takes the given JSON document and creates an Establishment's set of extendable properties
    // Returns true if the resulting Establishment is valid; otherwise false
    async load(document) {
        try {
            await this._properties.restore(document, JSON_DOCUMENT_TYPE);

        } catch (err) {
            this._log(Establishment.LOG_ERROR, `Establishment::load - failed: ${err}`);
            throw new EstablishmentExceptions.EstablishmentJsonException(
                err,
                null,
                'Failed to load Establishment from JSON');
        }

        return this.isValid();
    }

    // returns true if Establishment is valid, otherwise false
    isValid() {
        const thisEstablishmentIsValid = this._properties.isValid;
        if (this._properties.isValid === true) {
            return true;
        } else {
            this._log(Establishment.LOG_ERROR, `Establishment invalid properties: ${thisEstablishmentIsValid.toString()}`);
            return false;
        }
    }

    // saves the Establishment to DB. Returns true if saved; false is not.
    // Throws "EstablishmentSaveException" on error
    async save(savedBy, ttl=0, externalTransaction=null) {
        let mustSave = this._initialise();

        if (!this.uid) {
            this._log(Establishment.LOG_ERROR, 'Not able to save an unknown uid');
            throw new UserExceptions.UserSaveException(null,
                this.uid,
                this.name,
                'Not able to save an unknown uid',
                'Establishment does not exist');
        }

        if (mustSave && this._isNew) {
            // create new User
            try {
                const creationDocument = {
                    uid: this.uid,
                    name: this._name,
                    address: this._address,
                    postcode: this._postcode,
                    isRegulated: this._isRegulated,
                    locationId: this._locationId,
                    mainServiceId: this._mainService.id,
                    nmdsId: this._nmdsId,
                    updatedBy: savedBy,
                    ShareDataValue: false,
                    shareWithCQC: false,
                    shareWithLA: false,
                    attributes: ['id', 'created', 'updated'],
                };

                // need to create the Establishment record and the Establishment Audit event
                //  in one transaction
                await models.sequelize.transaction(async t => {
                    // the saving of an Establishment can be initiated within
                    //  an external transaction
                    const thisTransaction = externalTransaction ? externalTransaction : t;

                    // now append the extendable properties.
                    // Note - although the POST (create) has a default
                    //   set of mandatory properties, there is no reason
                    //   why we cannot create an Establishment record with more properties
                    const modifedCreationDocument = this._properties.save(savedBy, creationDocument);

                    // check all mandatory parameters have been provided
                    if (!this.hasMandatoryProperties) {
                        throw 'Missing Mandatory properties';
                    }

                    // now save the document
                    let creation = await models.establishment.create(modifedCreationDocument, {transaction: thisTransaction});

                    const sanitisedResults = creation.get({plain: true});

                    this._id = sanitisedResults.EstablishmentID;
                    this._created = sanitisedResults.created;
                    this._updated = sanitisedResults.updated;
                    this._updatedBy = savedBy;
                    this._isNew = false;

                    // having the user we can now create the audit record; injecting the userFk
                    const allAuditEvents = [{
                        establishmentFk: this._id,
                        username: savedBy,
                        type: 'created'}].concat(this._properties.auditEvents.map(thisEvent => {
                            return {
                                ...thisEvent,
                                establishmentFk: this._id
                            };
                        }));
                    await models.establishmentAudit.bulkCreate(allAuditEvents, {transaction: thisTransaction});

                    this._log(Establishment.LOG_INFO, `Created Establishment with uid (${this.uid}), id (${this._id}) and name (${this.name})`);
                });
                
            } catch (err) {
                // need to handle duplicate Establishment
                if (err.name && err.name === 'SequelizeUniqueConstraintError') {
                    if (err.parent.constraint && ( err.parent.constraint === 'Establishment_unique_registration_with_locationid' || err.parent.constraint === 'Establishment_unique_registration')) {
                        throw new EstablishmentExceptions.EstablishmentSaveException(null, this.uid, this.name, 'Duplicate Establishment', 'Duplicate Establishment');
                    }
                }

                // and foreign key constaint to Location
                if (err.name && err.name === 'SequelizeForeignKeyConstraintError') {
                    throw new EstablishmentExceptions.EstablishmentSaveException(null, this.uid, this.name, 'Unknown Location', 'Unknown Location');
                }

                if (err.name && err.name === 'SequelizeValidationError' && err.errors[0].path === 'nmdsId') {
                    throw new EstablishmentExceptions.EstablishmentSaveException(null, this.uid, this.name, 'Unknown NMDSID', 'Unknown NMDSID');
                }

                // gets here having not explicitly caught err
                throw new EstablishmentExceptions.EstablishmentSaveException(null, this.uid, this.name, err, null);
            }
        } else {
            // we are updating an existing Establishment
            try {
                const updatedTimestamp = new Date();

                // need to update the existing Establishment record and add an
                //  updated audit event within a single transaction
                await models.sequelize.transaction(async t => {
                    // the saving of an Establishment can be initiated within
                    //  an external transaction
                    const thisTransaction = externalTransaction ? externalTransaction : t;

                    // now append the extendable properties
                    const modifedUpdateDocument = this._properties.save(savedBy, {});

                    const updateDocument = {
                        ...modifedUpdateDocument,
                        updated: updatedTimestamp,
                        updatedBy: savedBy
                    };

                    // now save the document
                    let [updatedRecordCount, updatedRows] =
                        await models.establishment.update(
                            updateDocument,
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
                        this._id = updatedRecord.EstablishmentID;

                        const allAuditEvents = [{
                            establishmentFk: this._id,
                            username: savedBy,
                            type: 'updated'}].concat(this._properties.auditEvents.map(thisEvent => {
                                return {
                                    ...thisEvent,
                                    establishmentFk: this._id
                                };
                            }));
                            // having updated the record, create the audit event
                        await models.establishmentAudit.bulkCreate(allAuditEvents, {transaction: thisTransaction});

                        // now - work through any additional models having processed all properties (first delete and then re-create)
                        const additionalModels = this._properties.additionalModels;
                        const additionalModelsByname = Object.keys(additionalModels);
                        const deleteModelPromises = [];
                        additionalModelsByname.forEach(async thisModelByName => {
                            deleteModelPromises.push(
                                models[thisModelByName].destroy({
                                    where: {
                                        establishmentId: this._id
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
                                            establishmentId: this._id
                                        };
                                    }),
                                    { transaction: thisTransaction },
                                )
                            );
                        });
                        await Promise.all(createModelPromises);

                        this._log(Establishment.LOG_INFO, `Updated Establishment with uid (${this.uid}) and name (${this.name})`);

                    } else {
                        throw new EstablishmentExceptions.EstablishmentSaveException(null, this.uid, this.name, err, `Failed to update resulting establishment record with id: ${this._id}`);
                    }

                });
                
            } catch (err) {
                throw new EstablishmentExceptions.EstablishmentSaveException(null, this.uid, this.name, err, `Failed to update establishment record with id: ${this._id}`);
            }

        }

        return mustSave;
    };

    // loads the Establishment (with given id or uid) from DB, but only if it belongs to the known User
    // returns true on success; false if no User
    // Can throw EstablishmentRestoreException exception.
    async restore(id, uid, showHistory=false) {
        if (!id && !uid) {
            throw new EstablishmentExceptions.EstablishmentRestoreException(null,
                null,
                null,
                'User::restore failed: Missing id or uid',
                null,
                'Unexpected Error');
        }

        try {
            // by including the user id in the
            //  fetch, we are sure to only fetch those
            //  Establishment records associated to the known
            //   user
            let fetchQuery = null;
            
            if (uid) {
                // fetch by uid
                fetchQuery = {
                    // attributes: ['id', 'uid'],
                    where: {
                        uid,
                    },
                    include: [
                        {
                            model: models.user,
                            as: 'users',
                            attributes: ['id'],
                            where: {
                                archived: false,
                            },
                            include: [
                                {
                                    model: models.login,
                                    attributes: ['username'],
                                    where: {
                                        username: this._username,
                                    }
                                }
                            ]
                        }
                    ]
                };
            } else {
                // fetch by id
                fetchQuery = {
                    // attributes: ['id', 'uid'],
                    where: {
                        id,
                    },
                    include: [
                        {
                            model: models.user,
                            as: 'users',
                            attributes: ['id'],
                            where: {
                                archived: false,
                            },
                            include: [
                                {
                                    model: models.login,
                                    attributes: ['username'],
                                    where: {
                                        username: this._username,
                                    }
                                }
                            ]
                        }
                    ]
                };
            }

            // now join across the other dependent tables
            fetchQuery.include = fetchQuery.include.concat([
                {
                  model: models.services,
                  as: 'otherServices',
                  attributes: ['id', 'name', 'category'],
                  order: [
                    ['category', 'ASC'],
                    ['name', 'ASC']
                  ]
                },{
                  model: models.services,
                  as: 'mainService',
                  attributes: ['id', 'name']
                },{
                  model: models.establishmentCapacity,
                  as: 'capacity',
                  attributes: ['id', 'answer'],
                  include: [{
                    model: models.serviceCapacity,
                    as: 'reference',
                    attributes: ['id', 'question']
                  }]
                },
                {
                  model: models.establishmentJobs,
                  as: 'jobs',
                  attributes: ['id', 'type', 'total'],
                  order: [
                    ['type', 'ASC']
                  ],
                  include: [{
                    model: models.job,
                    as: 'reference',
                    attributes: ['id', 'title'],
                    order: [
                      ['title', 'ASC']
                    ]
                  }]
                },
                {
                  model: models.establishmentLocalAuthority,
                  as: 'localAuthorities',
                  attributes: ['id', 'cssrId', 'cssr'],
                }
              ]
            );

            // if history of the User is also required; attach the association
            //  and order in reverse chronological - note, order on id (not when)
            //  because ID is primay key and hence indexed
            if (showHistory) {
                fetchQuery.include.push({
                    model: models.establishmentAudit,
                    as: 'auditEvents'
                });
                fetchQuery.order = [
                    [
                        {
                            model: models.establishmentAudit,
                            as: 'auditEvents'
                        },
                        'id',
                        'DESC'
                    ]
                ];
            }

            const fetchResults = await models.establishment.findOne(fetchQuery);
            if (fetchResults && fetchResults.id && Number.isInteger(fetchResults.id)) {
                // update self - don't use setters because they modify the change state
                this._isNew = false;
                this._id = fetchResults.id;
                this._uid = fetchResults.uid;
                this._created = fetchResults.created;
                this._updated = fetchResults.updated;
                this._updatedBy = fetchResults.updatedBy;

                this._name = fetchResults.name;
                this._address = fetchResults.address;
                this._locationId = fetchResults.locationId;
                this._postcode = fetchResults.postcode;
                this._isRegulated = fetchResults.isRegulated;
                this._mainService = {
                    id: fetchResults.mainService.id,
                    name: fetchResults.mainService.name
                };
                this._nmdsId = fetchResults.nmdsId;

                // other services output requires a list of ALL services available to
                //  the Establishment
                if (fetchResults.isRegulated) {
                    // other services for CQC regulated is ALL including non-CQC
                    fetchResults.allMyServices = await models.services.findAll({
                        order: [
                            ['category', 'ASC'],
                            ['name', 'ASC']
                        ]
                    });
                } else {
                    fetchResults.allMyServices = await models.services.findAll({
                        where: {
                            iscqcregistered: false
                        },
                        order: [
                            ['category', 'ASC'],
                            ['name', 'ASC']
                        ]
                    });  
                }

                // service capacities output requires a list of ALL service capacities available to
                //  the Establishment
                // fetch the main service id and all the associated 'other services' by id only
                const allCapacitiesResults = await models.establishment.findOne({
                    where: {
                        id: this._id
                    },
                    attributes: ['id'],
                    include: [
                        {
                            model: models.services,
                            as: 'otherServices',
                            attributes: ['id'],
                        },
                        {
                        model: models.services,
                        as: 'mainService',
                        attributes: ['id']
                        }
                    ]
                });
        
                const allAssociatedServiceIndices = [];
                if (allCapacitiesResults && allCapacitiesResults.id) {
                    // merge tha main and other service ids
                    if (allCapacitiesResults.mainService.id) {
                        allAssociatedServiceIndices.push(allCapacitiesResults.mainService.id);
                    }
                    // TODO: there is a much better way to derference (transpose) the id on an Array of objects
                    //  viz. Map
                    if (allCapacitiesResults.otherServices) {
                        allCapacitiesResults.otherServices.forEach(thisService => allAssociatedServiceIndices.push(thisService.id));
                    }
                }
        
                // now fetch all the questions for the given set of combined services
                if (allAssociatedServiceIndices.length > 0) {
                    fetchResults.allServiceCapacityQuestions = await models.serviceCapacity.findAll({
                        where: {
                            serviceId: allAssociatedServiceIndices
                        },
                        attributes: ['id', 'seq', 'question'],
                        order: [
                            ['seq', 'ASC']
                        ],
                        include: [
                            {
                                model: models.services,
                                as: 'service',
                                attributes: ['id', 'category', 'name'],
                                order: [
                                    ['category', 'ASC'],
                                    ['name', 'ASC']
                                ]
                            }
                        ]
                    });
                } else {
                    fetchResults.allServiceCapacityQuestions = null;
                }

                // need to identify which, if any, of the shared authorities is attributed to the
                //  primary Authority; that is the Local Authority associated with the physical area
                //  of the given Establishment (using the postcode as the key)
                let primaryAuthorityCssr = null;

                // lookup primary authority by trying to resolve on specific postcode code
                const cssrResults = await models.pcodedata.findOne({
                    where: {
                        postcode: fetchResults.postcode,
                    },
                    include: [
                        {
                            model: models.cssr,
                            as: 'theAuthority',
                            attributes: ['id', 'name', 'nmdsIdLetter']
                        }
                    ]
                });
                
                if (cssrResults && cssrResults.postcode === fetchResults.postcode &&
                    cssrResults.theAuthority && cssrResults.theAuthority.id &&
                    Number.isInteger(cssrResults.theAuthority.id)) {
                    
                    fetchResults.primaryAuthorityCssr = {
                        id: cssrResults.theAuthority.id,
                        name: cssrResults.theAuthority.name
                    };

                } else {
                    //  using just the first half of the postcode
                    const [firstHalfOfPostcode] = results.postcode.split(' '); 
                    
                    // must escape the string to prevent SQL injection
                    const fuzzyCssrIdMatch = await models.sequelize.query(
                        `select "Cssr"."CssrID", "Cssr"."CssR" from cqcref.pcodedata, cqc."Cssr" where postcode like \'${escape(firstHalfOfPostcode)}%\' and pcodedata.local_custodian_code = "Cssr"."LocalCustodianCode" group by "Cssr"."CssrID", "Cssr"."CssR" limit 1`,
                        {
                            type: models.sequelize.QueryTypes.SELECT
                        }
                    );
                    if (fuzzyCssrIdMatch && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0].CssrID) {
                        fetchResults.primaryAuthorityCssr = {
                            id: fuzzyCssrIdMatch[0].CssrID,
                            name: fuzzyCssrIdMatch[0].CssR
                        }
                    }
                }
 
                // TODO - remove this property once all the individual properties are done
                this._establishmentResults = fetchResults;

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
            this._log(Establishment.LOG_ERROR, err);

            throw new EstablishmentExceptions.EstablishmentRestoreException(null, this.uid, null, err, null);
        }
    };

    // deletes this User from DB
    // Can throw "UserDeleteException"
    async delete() {
        throw new EstablishmentExceptions.EstablishmentDeleteException(null, null, null, 'Not implemented', 'Not implemented');
    };

    // helper returns a set 'json ready' objects for representing an Establishments's overall
    //  change history, from a given set of audit events (those events being created
    //  or updated only)
    formatHistoryEvents(auditEvents) {
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

    // helper returns a set 'json ready' objects for representing an Establishment's audit
    //  history, from a the given set of audit events including those of individual
    //  Establishment properties)
    formatHistory(auditEvents) {
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
    toJSON(showHistory=false, showPropertyHistoryOnly=true, showHistoryTimeline=false, modifiedOnlyProperties=false, fullDescription=true, filteredPropertiesByName=null) {
        if (!showHistoryTimeline) {
            if (filteredPropertiesByName !== null && !Array.isArray(filteredPropertiesByName)) {
                throw new Error('Establishment::toJSON filteredPropertiesByName must be a simple Array of names');
            }

            // JSON representation of extendable properties - with optional filter
            const myJSON = this._properties.toJSON(showHistory, showPropertyHistoryOnly, modifiedOnlyProperties, filteredPropertiesByName);

            // add Establishment default properties
            //  using the default formatters
            const myDefaultJSON = {
                id: this.id,
                uid:  this.uid,
                name: this.name,
            };

            if (fullDescription) {
                myDefaultJSON.address = this.address;
                myDefaultJSON.postcode = this.postcode;
                myDefaultJSON.locationRef = this.locationId;
                myDefaultJSON.isRegulated = this.isRegulated;
                myDefaultJSON.nmdsId = this.nmdsId;
                myDefaultJSON.mainService = ServiceFormatters.singleService(this.mainService);
                // myDefaultJSON.employerType = this._establishmentResults.employerType;
                // myDefaultJSON.numberOfStaff = this._establishmentResults.numberOfStaff;
                //myDefaultJSON.mainService = ServiceFormatters.singleService(this._establishmentResults.mainService);
                //myDefaultJSON.otherServices = ServiceFormatters.createServicesByCategoryJSON(this._establishmentResults.otherServices);
                //myDefaultJSON.capacities = CapacityFormatters.capacitiesJSON(this._establishmentResults.capacity);
                //myDefaultJSON.share = ShareFormatters.shareDataJSON(this._establishmentResults, this._establishmentResults.localAuthorities);
                myDefaultJSON.jobs = JobFormatters.jobsByTypeJSON(this._establishmentResults);
            }

            myDefaultJSON.created = this.created.toJSON();
            myDefaultJSON.updated = this.updated.toJSON();
            myDefaultJSON.updatedBy = this.updatedBy;

            // TODO: JSON schema validation
            if (showHistory && !showPropertyHistoryOnly) {
                return {
                    ...myDefaultJSON,
                    ...myJSON,
                    history: this.formatHistoryEvents(this._auditEvents)
                };
            } else {
                return {
                    ...myDefaultJSON,
                    ...myJSON
            
               };
            }
        } else {
            return {
                id: this.id,
                uid:  this.uid,
                name: this.name,
                created: this.created.toJSON(),
                updated: this.updated.toJSON(),
                updatedBy: this.updatedBy,
                history: this.formatHistory(this._auditEvents)
            };
        }
    }


    // HELPERS

    // returns true if all mandatory properties for an Establishment exist and are valid
    get hasMandatoryProperties() {
        let allExistAndValid = true;    // assume all exist until proven otherwise
        try {
            // const fullnameProperty = this._properties.get('FullName');
            // if (!(fullnameProperty && fullnameProperty.isInitialised && fullnameProperty.valid)) {
            //     allExistAndValid = false;
            //     this._log(Establishment.LOG_ERROR, 'User::hasMandatoryProperties - missing or invalid fullname');
            // }
    
            const nmdsIdRegex = /^[A-Z]1[\d]{6}$/i; 
            if (!(this._nmdsId && nmdsIdRegex.test(this._nmdsId))) {
                allExistAndValid = false;
                this._log(Establishment.LOG_ERROR, 'Establishment::hasMandatoryProperties - missing or invalid NMDS ID');
            }

            if (!(this._name)) {
                allExistAndValid = false;
                this._log(Establishment.LOG_ERROR, 'Establishment::hasMandatoryProperties - missing or invalid name');
            }

            if (!(this._address)) {
                allExistAndValid = false;
                this._log(Establishment.LOG_ERROR, 'Establishment::hasMandatoryProperties - missing or invalid address');
            }

            if (!(this._postcode)) {
                allExistAndValid = false;
                this._log(Establishment.LOG_ERROR, 'Establishment::hasMandatoryProperties - missing or invalid postcode');
            }

            if (this._isRegulated === null) {
                allExistAndValid = false;
                this._log(Establishment.LOG_ERROR, 'Establishment::hasMandatoryProperties - missing regulated flag');
            }

            // location id can be null for a Non-CQC site
            if (this._isRegulated && this._locationId === null) {
                allExistAndValid = false;
                this._log(Establishment.LOG_ERROR, 'Establishment::hasMandatoryProperties - missing or invalid Location ID for a (CQC) Regulated workspace');
            }

        } catch (err) {
            console.error(err)
        }

        return allExistAndValid;
    }
};

module.exports.Establishment = Establishment;

// sub types
module.exports.EstablishmentExceptions = EstablishmentExceptions;