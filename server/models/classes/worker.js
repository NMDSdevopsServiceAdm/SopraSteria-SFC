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

const EntityValidator = require('./validations/entityValidator').EntityValidator;
const ValidationMessage = require('./validations/validationMessage').ValidationMessage;

const WorkerExceptions = require('./worker/workerExceptions');

// associations
const Training = require('./training').Training;
const Qualification = require('./qualification').Qualification;

// Worker properties
const WorkerProperties = require('./worker/workerProperties').WorkerPropertyManager;
const JSON_DOCUMENT_TYPE = require('./worker/workerProperties').JSON_DOCUMENT;
const SEQUELIZE_DOCUMENT_TYPE = require('./worker/workerProperties').SEQUELIZE_DOCUMENT;

// WDF Calculator
const WdfCalculator = require('./wdfCalculator').WdfCalculator;

const STOP_VALIDATING_ON = ['UNCHECKED', 'DELETE', 'DELETED', 'NOCHANGE'];

class Worker extends EntityValidator {
  constructor(establishmentId, bulkUploadStatus = null) {
    super();

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
    this._changeLocalIdentifer = null;

    // abstracted properties
    const thisWorkerManager = new WorkerProperties();
    this._properties = thisWorkerManager.manager;

    // change properties
    this._isNew = false;

    // default logging level - errors only
    // TODO: INFO logging on Worker; change to LOG_ERROR only
    this._logLevel = Worker.LOG_INFO;

    // local attributes
    this._reason = null;
    this._lastWdfEligibility = null;

    // associated entities
    this._qualificationsEntities = [];
    this._trainingEntities = [];

    // bulk upload status - this is never stored in database
    this._status = bulkUploadStatus;
  }

  // returns true if valid establishment id
  get _isEstablishmentIdValid() {
    if (this._establishmentId && Number.isInteger(this._establishmentId) && this._establishmentId > 0) {
      return true;
    } else {
      return false;
    }
  }

  // private logging
  static get LOG_ERROR() {
    return 100;
  }
  static get LOG_WARN() {
    return 200;
  }
  static get LOG_INFO() {
    return 300;
  }
  static get LOG_TRACE() {
    return 400;
  }
  static get LOG_DEBUG() {
    return 500;
  }

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

      if (!this._isEstablishmentIdValid) {
        throw new WorkerExceptions.WorkerSaveException(
          null,
          this._uid,
          this._nameId,
          `Unexpected Establishment Id (${this._establishmentId})`,
          'Unknown Establishment',
        );
      }

      // note, do not initialise the id as this will be returned by database
      return true;
    } else {
      return false;
    }
  }

  // this method add this given qualification (entity) as an association to this worker entity - (bulk import)
  //  - note, no unique key for a qualification; just simply an array of
  associateQualification(qualification) {
    this._qualificationsEntities.push(qualification);
  }

  // this method add this given training (entity) as an association to this worker entity - (bulk import)
  //  - note, no unique key for a training; just simply an array of
  associateTraining(training) {
    this._trainingEntities.push(training);
  }

  get qualifications() {
    return this._qualificationsEntities;
  }

  get training() {
    return this._trainingEntities;
  }

  get changeLocalIdentifer() {
    return this._changeLocalIdentifer;
  }

  get establishmentId() {
    return this._establishmentId;
  }

  set establishmentId(establishmentId) {
    this._establishmentId = establishmentId;
  }

  get localIdentifier() {
    return this._properties.get('LocalIdentifier') ? this._properties.get('LocalIdentifier').property : null;
  }

  get nameOrId() {
    // returns the name or id property - if known
    if (this._properties.get('NameOrId') && this._properties.get('NameOrId').property) {
      return this._properties.get('NameOrId').property;
    } else {
      return null;
    }
  }

  get key() {
    return (this._properties.get('LocalIdentifier') && this._properties.get('LocalIdentifier').property
      ? this.localIdentifier.replace(/\s/g, '')
      : this.nameOrId
    ).replace(/\s/g, '');
  }

  get status() {
    return this._status;
  }

  get contract() {
    return this._properties.get('Contract') ? this._properties.get('Contract').property : null;
  }

  get postcode() {
    return this._properties.get('Postcode') ? this._properties.get('Postcode').property : null;
  }

  get fluJab() {
    return this._properties.get('FluJab') ? this._properties.get('FluJab').property : null;
  }

  get nationalInsuranceNumber() {
    return this._properties.get('NationalInsuranceNumber')
      ? this._properties.get('NationalInsuranceNumber').property
      : null;
  }

  get dateOfBirth() {
    return this._properties.get('DateOfBirth') ? this._properties.get('DateOfBirth').property : null;
  }

  get gender() {
    return this._properties.get('Gender') ? this._properties.get('Gender').property : null;
  }

  get disabiliity() {
    return this._properties.get('Disability') ? this._properties.get('Disability').property : null;
  }

  get careCerticate() {
    return this._properties.get('CareCertificate') ? this._properties.get('CareCertificate').property : null;
  }

  get approvedMentalHealthWorker() {
    return this._properties.get('ApprovedMentalHealthWorker')
      ? this._properties.get('ApprovedMentalHealthWorker').property
      : null;
  }

  get socialCareQualification() {
    return this._properties.get('QualificationInSocialCare')
      ? this._properties.get('QualificationInSocialCare').property
      : null;
  }

  get socialCareQualificationLevel() {
    return this._properties.get('SocialCareQualification')
      ? this._properties.get('SocialCareQualification').property
      : null;
  }

  get nonSocialCareQualification() {
    return this._properties.get('OtherQualifications') ? this._properties.get('OtherQualifications').property : null;
  }

  get nonSocialCareQualificationLevel() {
    return this._properties.get('HighestQualification') ? this._properties.get('HighestQualification').property : null;
  }

  get ethnicity() {
    return this._properties.get('Ethnicity') ? this._properties.get('Ethnicity').property : null;
  }

  get nationality() {
    return this._properties.get('Nationality') ? this._properties.get('Nationality').property : null;
  }

  get countryOfBirth() {
    return this._properties.get('CountryOfBirth') ? this._properties.get('CountryOfBirth').property : null;
  }

  get britishCitizenship() {
    return this._properties.get('BritishCitizenship') ? this._properties.get('BritishCitizenship').property : null;
  }

  get yearArrived() {
    return this._properties.get('YearArrived') ? this._properties.get('YearArrived').property : null;
  }

  get recruitmentSource() {
    return this._properties.get('RecruitedFrom') ? this._properties.get('RecruitedFrom').property : null;
  }

  get mainJobStartDate() {
    return this._properties.get('MainJobStartDate') ? this._properties.get('MainJobStartDate').property : null;
  }

  get socialCareStartDate() {
    return this._properties.get('SocialCareStartDate') ? this._properties.get('SocialCareStartDate').property : null;
  }

  get apprenticeship() {
    return this._properties.get('ApprenticeshipTraining')
      ? this._properties.get('ApprenticeshipTraining').property
      : null;
  }

  // TODO: rename to zeroHoursContract
  get zeroContractHours() {
    return this._properties.get('ZeroHoursContract') ? this._properties.get('ZeroHoursContract').property : null;
  }

  get daysSick() {
    return this._properties.get('DaysSick') ? this._properties.get('DaysSick').property : null;
  }

  get annualHourlyPay() {
    return this._properties.get('AnnualHourlyPay') ? this._properties.get('AnnualHourlyPay').property : null;
  }

  get mainJob() {
    return this._properties.get('MainJob') ? this._properties.get('MainJob').property : null;
  }

  get contractedHours() {
    return this._properties.get('WeeklyHoursContracted')
      ? this._properties.get('WeeklyHoursContracted').property
      : null;
  }

  get averageHours() {
    return this._properties.get('WeeklyHoursAverage') ? this._properties.get('WeeklyHoursAverage').property : null;
  }

  get otherJobs() {
    return this._properties.get('OtherJobs') ? this._properties.get('OtherJobs').property : null;
  }

  get registeredNurse() {
    return this._properties.get('RegisteredNurse') ? this._properties.get('RegisteredNurse').property : null;
  }

  get nurseSpecialism() {
    return this._properties.get('NurseSpecialism') ? this._properties.get('NurseSpecialism').property : null;
  }

  get nurseSpecialisms () {
    return this._properties.get('NurseSpecialisms') ? this._properties.get('NurseSpecialisms').property : null;
  }

  // takes the given JSON document and creates a Worker's set of extendable properties
  // Returns true if the resulting Worker is valid; otherwise false
  async load(document, associatedEntities = false, bulkUploadCompletion = false) {
    try {
      // bulk upload status
      if (document.status) {
        this._status = document.status;
      }

      // Consequential updates when one value means another should be empty or null

      // If their job isn't a registered nurse, remove their specialism and category
      if (document.mainJob || document.otherJobs) {
        let otherRegNurse = false;
        let otherSocialWorker = false;
        const mainJob = document.mainJob ? document.mainJob : this.mainJob;
        const otherJobs = document.otherJobs ? document.otherJobs : this.otherJobs;
        if (otherJobs && otherJobs.jobs) {
          otherJobs.jobs.map((otherJob) => {
            if (otherJob.jobId === 23) otherRegNurse = true;
            if (otherJob.jobId === 27) otherSocialWorker = true;
          });
        }
        if (mainJob && mainJob.jobId !== 23 && !otherRegNurse) {
          document.registeredNurse = null;
          document.nurseSpecialisms = { value: null, specialisms: null };
        }
        // If their job isn't a social worker - remove the approved mental health worker
        if (mainJob && mainJob.jobId !== 27 && !otherSocialWorker) {
          document.approvedMentalHealthWorker = null;
        }
      }

      // Remove British citizenship if they are british
      if (document.nationality && document.nationality.value === 'British') {
        delete document.nationality.other;
        document.britishCitizenship = null;
      }

      // Remove year arriced if born in the UK
      if (document.countryOfBirth) {
        if (document.countryOfBirth.value === 'United Kingdom') {
          document.yearArrived = { value: null, year: null };
        }
      }
      const notContract = ['Agency', 'Pool/Bank'];
      // Remove contracted hours If on a zero hour contract
      if (document.zeroHoursContract === 'Yes' || notContract.includes(document.contract)) {
        document.weeklyHoursContracted = { value: null, hours: null };
      }

      // Remove average hours if not on a zero hour contract
      const notZeroHours = ['No', "Don't know"];
      const contract = ['Permanent', 'Temporary', 'Other'];
      if (
        (notZeroHours.includes(document.zeroHoursContract) && contract.includes(this.contract)) ||
        (notZeroHours.includes(this.zeroContractHours) && contract.includes(document.contract))
      ) {
        document.weeklyHoursAverage = { value: null, hours: null };
      }

      // Remove sickness if 'Agency' or 'Pool/Bank' contract
      if (notContract.includes(document.contract)) {
        document.daysSick = { value: null, days: null };
      }

      // Remove social care qualification if they don't have one
      if (document.qualificationInSocialCare && document.qualificationInSocialCare !== 'Yes') {
        document.socialCareQualification = { qualificationId: null, title: null };
      }

      // Remove highest qualification if no other qualifications
      if (document.otherQualification && document.otherQualification !== 'Yes') {
        document.highestQualification = { qualificationId: null, title: null };
      }

      if (!(bulkUploadCompletion && document.status === 'NOCHANGE')) {
        this.resetValidations();

        await this._properties.restore(document, JSON_DOCUMENT_TYPE);

        // reason is not a managed property, load it specifically
        if (document.reason) {
          this._reason = await this.validateReason(document.reason);
        }

        if (document.changeLocalIdentifer) {
          this._changeLocalIdentifer = document.changeLocalIdentifer;
        }

        // allow for deep restoration of entities (associations - namely Qualifications and Training here)
        if (associatedEntities) {
          const promises = [];

          // training records and qualifications are no change managed
          //  therefore, simply remove all existing associations
          //  and create new ones

          // first training records
          this._trainingEntities = [];
          if (document.training && Array.isArray(document.training)) {
            // console.log("WA DEBUG - document.training: ", document.training)
            document.training.forEach((thisTraining) => {
              const newTrainingRecord = new Training(null, null);

              this.associateTraining(newTrainingRecord);
              promises.push(newTrainingRecord.load(thisTraining));
            });
          }

          // and qualifications records
          this._qualificationsEntities = [];
          if (document.qualifications && Array.isArray(document.qualifications)) {
            // console.log("WA DEBUG - document.qualifications: ", document.qualifications)
            document.qualifications.forEach((thisQualificationRecord) => {
              const newQualificationRecord = new Qualification(null, null);

              this.associateQualification(newQualificationRecord);
              promises.push(newQualificationRecord.load(thisQualificationRecord));
            });
          }

          // wait for loading of all training and qualification records
          await Promise.all(promises);
          // console.log("WA DEBUG - this qualifications/training: ", this._id, this._qualificationsEntities ? this._qualificationsEntities.length : 'undefined', this._trainingEntities ? this._trainingEntities.length : 'undefined');
        }
      }
    } catch (err) {
      this._log(Worker.LOG_ERROR, `Woker::load - failed: ${err}`);
      throw new WorkerExceptions.WorkerJsonException(err, null, 'Failed to load Worker from JSON');
    }
    return this.isValid();
  }

  // returns true if Worker is valid, otherwise false
  isValid() {
    // in bulk upload, an establishment entity, if UNCHECKED, will be nothing more than a status and a local identifier
    if (this._status === null || !STOP_VALIDATING_ON.includes(this._status)) {
      // the property manager returns a list of all properties that are invalid; or true
      const thisWorkerIsValid = this._properties.isValid;

      // reason is an unmanaged property - validate explicitly
      const unmanagedPropertiesValid = this._reason === null || (this._reason !== null && this._reason.id > 0);

      if (thisWorkerIsValid === true && unmanagedPropertiesValid) {
        return true;
      } else {
        // only add validations if not already existing
        if (thisWorkerIsValid && Array.isArray(thisWorkerIsValid) && this._validations.length == 0) {
          const propertySuffixLength = 'Property'.length * -1;
          thisWorkerIsValid.forEach((thisInvalidProp) => {
            this._validations.push(
              new ValidationMessage(ValidationMessage.WARNING, 111111111, 'Invalid', [
                thisInvalidProp.slice(0, propertySuffixLength),
              ]),
            );
          });
        }

        this._log(Worker.LOG_ERROR, `Worker invalid properties: ${thisWorkerIsValid.toString()}`);
        return false;
      }
    } else {
      return true;
    }
  }

  async saveAssociatedEntities(savedBy, bulkUploaded = false, externalTransaction) {
    const newQualificationsPromises = [];
    const newTrainingPromises = [];

    try {
      // there is no change audit on training; simply delete all that is there and recreate
      if (this._trainingEntities && this._trainingEntities.length > 0) {
        // delete all existing training records for this worker
        await models.workerTraining.destroy({
          where: {
            workerFk: this._id,
          },
          transaction: externalTransaction,
        });

        // now create new training records
        this._trainingEntities.forEach((currentTrainingRecord) => {
          currentTrainingRecord.workerId = this._id;
          currentTrainingRecord.workerUid = this._uid;
          currentTrainingRecord.establishmentId = this._establishmentId;
          newTrainingPromises.push(currentTrainingRecord.save(savedBy, bulkUploaded, 0, externalTransaction));
        });
      }

      // there is no change audit on qualifications; simply delete all that is there and recreate
      if (this._qualificationsEntities && this._qualificationsEntities.length > 0) {
        // delete all existing training records for this worker
        await models.workerQualifications.destroy({
          where: {
            workerFk: this._id,
          },
          transaction: externalTransaction,
        });

        // now create new training records
        this._qualificationsEntities.forEach((currentQualificationRecord) => {
          currentQualificationRecord.workerId = this._id;
          currentQualificationRecord.workerUid = this._uid;
          currentQualificationRecord.establishmentId = this._establishmentId;
          newQualificationsPromises.push(
            currentQualificationRecord.save(savedBy, bulkUploaded, 0, externalTransaction),
          );
        });
      }

      await Promise.all(newTrainingPromises);
      await Promise.all(newQualificationsPromises);
    } catch (err) {
      console.error('Worker::saveAssociatedEntities error: ', err);
      // rethrow error to ensure the transaction is rolled back
      throw err;
    }
  }

  static async saveMany(savedBy, workers) {
    try {
      await models.sequelize.transaction(async (t) => {
        for (let worker of workers) {
          await worker.save(savedBy, false, 0, t);
        }
      });
    } catch (err) {
      console.error('Worker::saveMany error: ', err);
      throw err;
    }
  }

  // saves the Worker to DB. Returns true if saved; false is not.
  // Throws "WorkerSaveException" on error
  async save(savedBy, bulkUploaded = false, ttl = 0, externalTransaction = null, associatedEntities = false) {
    const mustSave = this._initialise();

    // with bulk upload, if this entity's status is "UNCHECKED", do not save it
    if (this._status === 'UNCHECKED') {
      return;
    }

    if (!this.uid) {
      this._log(Worker.LOG_ERROR, 'Not able to save an unknown uid');
      throw new WorkerExceptions.WorkerSaveException(
        null,
        this.uid,
        nameId ? nameId.property : null,
        'Not able to save an unknown uid',
        'Worker does not exist',
      );
    }

    if (mustSave && this._isNew) {
      // create new Worker
      try {
        const creationDate = new Date();
        const updatedTimestamp = new Date();
        const creationDocument = {
          establishmentFk: this._establishmentId,
          uid: this.uid,
          updatedBy: savedBy.toLowerCase(),
          archived: false,
          source: bulkUploaded ? 'Bulk' : 'Online',
          updated: creationDate,
          created: creationDate,
          attributes: ['id', 'created', 'updated'],
        };

        // need to create the Worker record and the Worker Audit event
        //  in one transaction
        await models.sequelize.transaction(async (t) => {
          // the saving of an Worker can be initiated within
          //  an external transaction
          const thisTransaction = externalTransaction || t;

          // now append the extendable properties.
          // Note - although the POST (create) has a default
          //   set of mandatory properties, there is no reason
          //   why we cannot create a Worker record with more properties
          const modifedCreationDocument = this._properties.save(savedBy.toLowerCase(), creationDocument);

          // always recalculate WDF - if not bulk upload (this._status)
          if (this._status === null) {
            await WdfCalculator.calculate(
              savedBy,
              this._establishmentId,
              null,
              thisTransaction,
              WdfCalculator.WORKER_ADD,
              false,
            );
          }

          // every time the worker is saved, need to calculate
          //  it's current WDF Eligibility, and if it is eligible, update
          //  the last WDF Eligibility status
          const currentWdfEligibiity = await this.isWdfEligible(WdfCalculator.effectiveDate);

          const effectiveDateTime = WdfCalculator.effectiveTime;

          let wdfAudit = null;
          if (
            currentWdfEligibiity.isEligible &&
            (this._lastWdfEligibility === null || this._lastWdfEligibility.getTime() < effectiveDateTime)
          ) {
            modifedCreationDocument.lastWdfEligibility = updatedTimestamp;
            wdfAudit = {
              username: savedBy.toLowerCase(),
              type: 'wdfEligible',
            };
          }

          // now save the document
          const creation = await models.worker.create(modifedCreationDocument, { transaction: thisTransaction });

          const sanitisedResults = creation.get({ plain: true });

          this._id = sanitisedResults.ID;
          this._created = sanitisedResults.created;
          this._updated = sanitisedResults.updated;
          this._updatedBy = savedBy.toLowerCase();
          this._isNew = false;

          if (associatedEntities) {
            await this.saveAssociatedEntities(savedBy, bulkUploaded, thisTransaction);
          }

          if (this.nurseSpecialisms && this.nurseSpecialisms.value === 'Yes') {
            await models.workerNurseSpecialisms.bulkCreate(this.nurseSpecialisms.specialisms.map(thisSpecialism => ({nurseSpecialismFk: thisSpecialism.id, workerFk: this._id})), { transaction: thisTransaction });
          }

          // having the worker id we can now create the audit record; inserting the workerFk
          const allAuditEvents = [
            {
              workerFk: this._id,
              username: savedBy.toLowerCase(),
              type: 'created',
            },
          ].concat(
            this._properties.auditEvents.map((thisEvent) => {
              return {
                ...thisEvent,
                workerFk: this._id,
              };
            }),
          );
          if (wdfAudit) {
            wdfAudit.workerFk = this._id;
            allAuditEvents.push(wdfAudit);
          }
          await models.workerAudit.bulkCreate(allAuditEvents, { transaction: thisTransaction });

          this._log(Worker.LOG_INFO, `Created Worker with uid (${this._uid}) and id (${this._id})`);
        });
      } catch (err) {
        // if the name/Id property is known, use it in the error message
        const nameId = this._properties.get('NameOrId');

        if (err.name && err.name === 'SequelizeUniqueConstraintError') {
          if (err.parent.constraint && err.parent.constraint === 'worker_LocalIdentifier_unq') {
            throw new WorkerExceptions.WorkerSaveException(
              null,
              this._uid,
              nameId ? nameId.property : null,
              'Duplicate LocalIdentifier',
              'Duplicate LocalIdentifier',
            );
          }
        } else {
          throw new WorkerExceptions.WorkerSaveException(null, this.uid, nameId ? nameId.property : null, err, null);
        }
      }
    } else {
      // we are updating an existing worker
      try {
        const updatedTimestamp = new Date();

        // need to update the existing Worker record and add an
        //  updated audit event within a single transaction
        await models.sequelize.transaction(async (t) => {
          // the saving of an Worker can be initiated within
          //  an external transaction
          const thisTransaction = externalTransaction || t;

          const buChanged = this._status === 'NOCHANGE';
          // now append the extendable properties
          const modifedUpdateDocument = this._properties.save(savedBy.toLowerCase(), {}, buChanged);

          // note - if the worker was created online, but then updated via bulk upload, the source become bulk and vice-versa.
          const updateDocument = {
            ...modifedUpdateDocument,
            source: bulkUploaded ? 'Bulk' : 'Online',
            updated: updatedTimestamp,
            updatedBy: savedBy.toLowerCase(),
          };

          if (this._changeLocalIdentifer) {
            // during bulk upload only, if the change local identifier value is set, then when saving this worker, update it's local identifier;
            updateDocument.LocalIdentifierValue = this._changeLocalIdentifer;
          }

          // every time the worker is saved, need to calculate
          //  it's current WDF Eligibility, and if it is eligible, update
          //  the last WDF Eligibility status
          const currentWdfEligibiity = await this.isWdfEligible(WdfCalculator.effectiveDate);

          const effectiveDateTime = WdfCalculator.effectiveTime;

          let wdfAudit = null;
          if (
            currentWdfEligibiity.isEligible &&
            (this._lastWdfEligibility === null || this._lastWdfEligibility.getTime() < effectiveDateTime)
          ) {
            updateDocument.lastWdfEligibility = updatedTimestamp;
            wdfAudit = {
              username: savedBy.toLowerCase(),
              type: 'wdfEligible',
            };
          }

          // now save the document
          const [updatedRecordCount, updatedRows] = await models.worker.update(updateDocument, {
            returning: true,
            where: {
              uid: this.uid,
            },
            attributes: ['id', 'updated'],
            transaction: thisTransaction,
          });

          if (updatedRecordCount === 1) {
            const updatedRecord = updatedRows[0].get({ plain: true });

            this._updated = updatedRecord.updated;
            this._updatedBy = savedBy.toLowerCase();
            this._id = updatedRecord.ID;

            // having updated the record, create the audit event
            const allAuditEvents = [
              {
                workerFk: this._id,
                username: savedBy.toLowerCase(),
                type: 'updated',
              },
            ].concat(
              this._properties.auditEvents.map((thisEvent) => {
                return {
                  ...thisEvent,
                  workerFk: this._id,
                };
              }),
            );
            if (wdfAudit) {
              wdfAudit.workerFk = this._id;
              allAuditEvents.push(wdfAudit);
            }
            await models.workerAudit.bulkCreate(allAuditEvents, { transaction: thisTransaction });

            // now - work through any additional models having processed all properties (first delete and then re-create)
            const additionalModels = this._properties.additionalModels;
            const additionalModelsByname = Object.keys(additionalModels);
            const deleteMmodelPromises = [];
            additionalModelsByname.forEach(async (thisModelByName) => {
              deleteMmodelPromises.push(
                models[thisModelByName].destroy({
                  where: {
                    workerFk: this._id,
                  },
                  transaction: thisTransaction,
                }),
              );
            });
            await Promise.all(deleteMmodelPromises);
            const createMmodelPromises = [];
            additionalModelsByname.forEach(async (thisModelByName) => {
              const thisModelData = additionalModels[thisModelByName];
              createMmodelPromises.push(
                models[thisModelByName].bulkCreate(
                  thisModelData.map((thisRecord) => {
                    return {
                      ...thisRecord,
                      workerFk: this._id,
                    };
                  }),
                  { transaction: thisTransaction },
                ),
              );
            });
            await Promise.all(createMmodelPromises);

            // always recalculate WDF - if not bulk upload (this._status)
            if (this._status === null) {
              await WdfCalculator.calculate(
                savedBy,
                this._establishmentId,
                null,
                thisTransaction,
                WdfCalculator.WORKER_UPDATE,
                false,
              );
            }

            if (associatedEntities) {
              await this.saveAssociatedEntities(savedBy, bulkUploaded, thisTransaction);
            }

            this._log(Worker.LOG_INFO, `Updated Worker with uid (${this._uid}) and id (${this._id})`);
          } else {
            const nameId = this._properties.get('NameOrId');
            throw new WorkerExceptions.WorkerSaveException(
              null,
              this.uid,
              nameId ? nameId.property : null,
              err,
              `Failed to update resulting worker record with uid: ${this._uid}`,
            );
          }
        });
      } catch (err) {
        // if the name/Id property is known, use it in the error message
        const nameId = this._properties.get('NameOrId');

        if (err.name && err.name === 'SequelizeUniqueConstraintError') {
          if (err.parent.constraint && err.parent.constraint === 'worker_LocalIdentifier_unq') {
            throw new WorkerExceptions.WorkerSaveException(
              null,
              this._uid,
              nameId ? nameId.property : null,
              'Duplicate LocalIdentifier',
              'Duplicate LocalIdentifier',
            );
          }
        } else {
          throw new WorkerExceptions.WorkerSaveException(
            null,
            this.uid,
            nameId ? nameId.property : null,
            err,
            `Failed to update worker record with uid: ${this._uid}`,
          );
        }
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
  }

  // loads the Worker (with given id) from DB, but only if it belongs to the given Establishment
  // returns true on success; false if no Worker
  // Can throw WorkerRestoreException exception.
  async restore(workerUid, showHistory = false, associatedEntities = false, associatedLevel) {
    if (!workerUid) {
      throw new WorkerExceptions.WorkerRestoreException(
        null,
        null,
        null,
        'Worker::restore failed: Missing uid',
        null,
        'Unexpected Error',
      );
    }

    try {
      // by including the establishment id in the
      //  fetch, we are sure to only fetch those
      //  worker records associated to the given
      //   establishment
      const fetchQuery = {
        where: {
          establishmentFk: this._establishmentId,
          uid: workerUid,
          archived: false,
        },
        include: [
          {
            model: models.job,
            as: 'mainJob',
            attributes: ['id', 'title'],
          },
          {
            model: models.ethnicity,
            as: 'ethnicity',
            attributes: ['id', 'ethnicity'],
          },
          {
            model: models.nationality,
            as: 'nationality',
            attributes: ['id', 'nationality'],
          },
          {
            model: models.qualification,
            as: 'socialCareQualification',
            attributes: ['id', 'level'],
          },
          {
            model: models.qualification,
            as: 'highestQualification',
            attributes: ['id', 'level'],
          },
          {
            model: models.country,
            as: 'countryOfBirth',
            attributes: ['id', 'country'],
          },
          {
            model: models.recruitedFrom,
            as: 'recruitedFrom',
            attributes: ['id', 'from'],
          },
          {
            model: models.job,
            as: 'otherJobs',
            attributes: ['id', 'title'],
          },
          {
            model: models.workerNurseSpecialism,
            as: 'nurseSpecialism',
            attributes: ['id', 'specialism']
          },
          {
            model: models.workerNurseSpecialism,
            as: 'nurseSpecialisms',
            attributes: ['id', 'specialism']
          }
        ]
      };

      const fetchResults = await models.worker.findOne(fetchQuery);
      if (fetchResults && fetchResults.id && Number.isInteger(fetchResults.id)) {
        // update self - don't use setters because they modify the change state
        this._isNew = false;
        this._id = fetchResults.id;
        this._uid = workerUid;
        this._created = fetchResults.created;
        this._updated = fetchResults.updated;
        this._updatedBy = fetchResults.updatedBy;
        this._lastWdfEligibility = fetchResults.lastWdfEligibility;

        // if history of the Worker is also required; attach the association
        //  and order in reverse chronological - note, order on id (not when)
        //  because ID is primay key and hence indexed
        if (showHistory) {
          fetchResults.auditEvents = await models.workerAudit.findAll({
            where: {
              workerFk: fetchResults.id,
            },
            order: [['id', 'DESC']],
          });
        }

        if (fetchResults.auditEvents) {
          this._auditEvents = fetchResults.auditEvents;
        }

        // load extendable properties
        await this._properties.restore(fetchResults, SEQUELIZE_DOCUMENT_TYPE);

        // certainly for bulk upload, but also expected for cross-entity validations, restore all associated entities (qualifications and training)
        if (associatedEntities) {
          const myQualificationsSet = await models.workerQualifications.findAll({
            attributes: ['uid'],
            where: {
              workerFk: this._id,
            },
          });

          if (myQualificationsSet && Array.isArray(myQualificationsSet)) {
            await Promise.all(
              myQualificationsSet.map(async (thisQualification) => {
                const newQualification = new Qualification(this._establishmentId, this._uid);
                newQualification.workerId = this._id;

                await newQualification.restore(thisQualification.uid, false);
                this.associateQualification(newQualification);

                return {};
              }),
            );
          }

          const myTrainingSet = await models.workerTraining.findAll({
            attributes: ['uid'],
            where: {
              workerFk: this._id,
            },
          });

          if (myTrainingSet && Array.isArray(myTrainingSet)) {
            await Promise.all(
              myTrainingSet.map(async (thisTrainingRecord) => {
                const newTrainingRecord = new Training(this._establishmentId, this._uid);
                newTrainingRecord.workerId = this._id;

                await newTrainingRecord.restore(thisTrainingRecord.uid, false);
                this.associateTraining(newTrainingRecord);

                return {};
              }),
            );
          }
        }

        return true;
      }

      return false;
    } catch (err) {
      // typically errors when making changes to model or database schema!
      this._log(Worker.LOG_ERROR, err);

      throw new WorkerExceptions.WorkerRestoreException(null, this.uid, null, err, null);
    }
  }

  // "deletes" this Worker by setting the Worker to archived - does not delete any data!
  async archive(deletedBy, externalTransaction = null, associatedEntities = false) {
    let t;
    try {
      const updatedTimestamp = new Date();

      // need to update the existing Worker record and add an
      //  deleted audit event within a single transaction
      t = externalTransaction === null ? await models.sequelize.transaction() : null;
      const thisTransaction = externalTransaction || t;

      // now append the extendable properties
      const updateDocument = {
        archived: true,
        LocalIdentifierValue: null,
        updated: updatedTimestamp,
        updatedBy: deletedBy,
      };

      if (this._reason) {
        updateDocument.reasonFk = this._reason.id;

        if (this._reason.other) {
          updateDocument.otherReason = escape(this._reason.other);
        }
      }

      // now save the document
      const [updatedRecordCount, updatedRows] = await models.worker.update(updateDocument, {
        returning: true,
        where: {
          uid: this.uid,
        },
        attributes: ['id', 'updated'],
        transaction: thisTransaction,
      });

      if (updatedRecordCount === 1) {
        const updatedRecord = updatedRows[0].get({ plain: true });

        this._updated = updatedRecord.updated;
        this._updatedBy = deletedBy;
        this._id = updatedRecord.ID;

        const allAuditEvents = [
          {
            workerFk: this._id,
            username: deletedBy,
            type: 'deleted',
          },
        ];

        // having updated the record, create the audit event
        await models.workerAudit.bulkCreate(allAuditEvents, {
          transaction: thisTransaction,
        });

        // delete all training and qualifications for this user??
        if (associatedEntities) {
          // TODO - to be confirmed
        }

        // always recalculate WDF - if not bulk upload (this._status)
        if (this._status === null) {
          await WdfCalculator.calculate(
            deletedBy,
            this._establishmentId,
            null,
            thisTransaction,
            WdfCalculator.WORKER_DELETE,
            false,
          );
        }

        if (t) {
          t.commit();
        }

        this._log(Worker.LOG_INFO, `Archived Worker with uid (${this._uid}) and id (${this._id})`);
      } else {
        const nameId = this._properties.get('NameOrId');
        throw new WorkerExceptions.WorkerDeleteException(
          null,
          this.uid,
          nameId ? nameId.property : null,
          err,
          `Failed to update (archive) worker record with uid: ${this._uid}`,
        );
      }
    } catch (err) {
      if (t) {
        t.rollback();
      } else {
        externalTransaction.rollback();
      }

      // if the name/Id property is known, use it in the error message
      const nameId = this._properties.get('NameOrId');

      throw new WorkerExceptions.WorkerDeleteException(
        null,
        this.uid,
        nameId ? nameId.property : null,
        err,
        `Failed to delete (archive) worker record with uid: ${this._uid}`,
      );
    }
  }

  // returns a set of Workers based on given filter criteria (all if no filters defined) - restricted to the given Establishment
  static async fetch(establishmentId, filters = null) {
    const allWorkers = [];
    try {
      let fetchResults = null;

      fetchResults = await models.worker.findAll({
        where: {
          establishmentFk: establishmentId,
          archived: false,
        },
        include: [
          {
            model: models.job,
            as: 'mainJob',
            attributes: ['id', 'title'],
          },
        ],
        attributes: [
          'uid',
          'LocalIdentifierValue',
          'NameOrIdValue',
          'ContractValue',
          'CompletedValue',
          'MainJobFkOther',
          'lastWdfEligibility',
          'created',
          'updated',
          'updatedBy',
          'establishmentFk',
        ],
        order: [['updated', 'DESC']],
      });

      if (fetchResults) {
        const workerPromise = [];
        const effectiveFromDate = WdfCalculator.effectiveDate;
        const effectiveFromIso = WdfCalculator.effectiveDate.toISOString();

        await Promise.all(
          fetchResults.map(async (thisWorker) => {
            const worker = new Worker(thisWorker.establishmentFk);
            await worker.restore(thisWorker.uid);

            const isEligible = await worker.isWdfEligible(effectiveFromDate);

            if (thisWorker.lastWdfEligibility === null && isEligible.isEligible) {
              thisWorker.lastWdfEligibility = new Date();
            }
            allWorkers.push({
              uid: thisWorker.uid,
              localIdentifier: thisWorker.LocalIdentifierValue ? thisWorker.LocalIdentifierValue : null,
              nameOrId: thisWorker.NameOrIdValue,
              contract: thisWorker.ContractValue,
              mainJob: {
                jobId: thisWorker.mainJob.id,
                title: thisWorker.mainJob.title,
                other: thisWorker.MainJobFkOther ? thisWorker.MainJobFkOther : undefined,
              },
              completed: thisWorker.CompletedValue,
              created: thisWorker.created.toJSON(),
              updated: thisWorker.updated.toJSON(),
              updatedBy: thisWorker.updatedBy,
              effectiveFrom: effectiveFromIso,
              wdfEligible: isEligible.isEligible,
              wdfEligibilityLastUpdated: thisWorker.lastWdfEligibility
                ? thisWorker.lastWdfEligibility.toISOString()
                : undefined,
            });
          }),
        );
        await Promise.all(workerPromise);
        return allWorkers;
      }
    } catch (err) {
      console.error('Worker::fetch - unexpected exception: ', err);
      throw err;
    }
  }

  // helper returns a set 'json ready' objects for representing a Worker's overall
  //  change history, from a given set of audit events (those events being created
  //  or updated only)
  formatWorkerHistoryEvents(auditEvents) {
    if (auditEvents) {
      return auditEvents
        .filter((thisEvent) => ['created', 'updated', 'wdfEligible'].includes(thisEvent.type))
        .map((thisEvent) => {
          return {
            when: thisEvent.when,
            username: thisEvent.username,
            event: thisEvent.type,
          };
        });
    } else {
      return null;
    }
  }

  // helper returns a set 'json ready' objects for representing a Worker's audit
  //  history, from a the given set of audit events including those of individual
  //  worker properties)
  formatWorkerHistory(auditEvents) {
    if (auditEvents) {
      return auditEvents.map((thisEvent) => {
        return {
          when: thisEvent.when,
          username: thisEvent.username,
          event: thisEvent.type,
          property: thisEvent.property,
          change: thisEvent.event,
        };
      });
    } else {
      return null;
    }
  }

  // returns a Javascript object which can be used to present as JSON
  //  showHistory appends the historical account of changes at Worker and individual property level
  //  showHistoryTimeline just returns the history set of audit events for the given Worker
  toJSON(
    showHistory = false,
    showPropertyHistoryOnly = true,
    showHistoryTimeline = false,
    modifiedOnlyProperties = false,
    associatedEntities = false,
    wdf = false,
  ) {
    if (!showHistoryTimeline) {
      // JSON representation of extendable properties

      const myJSON = this._properties.toJSON(
        showHistory,
        showPropertyHistoryOnly,
        modifiedOnlyProperties,
        null,
        wdf ? WdfCalculator.effectiveDate : null,
      );

      // add worker default properties
      const myDefaultJSON = {
        uid: this.uid,
        changeLocalIdentifer: this.changeLocalIdentifer ? this.changeLocalIdentifer : undefined,
      };

      myDefaultJSON.created = this.created ? this.created.toJSON() : null;
      myDefaultJSON.updated = this.updated ? this.updated.toJSON() : null;
      myDefaultJSON.updatedBy = this.updatedBy ? this.updatedBy : null;

      // bulk upload status
      if (this._status !== null) {
        myDefaultJSON.status = this._status;
      }

      // TODO: JSON schema validation
      if (showHistory && !showPropertyHistoryOnly) {
        return {
          ...myDefaultJSON,
          ...myJSON,
          history: this.formatWorkerHistoryEvents(this._auditEvents),
        };
      } else {
        return {
          ...myDefaultJSON,
          ...myJSON,
          training: associatedEntities
            ? this._trainingEntities.map((thisTrainingRecord) =>
                thisTrainingRecord ? thisTrainingRecord.toJSON() : undefined,
              )
            : undefined,
          qualifications: associatedEntities
            ? this._qualificationsEntities.map((thisQualification) =>
                thisQualification ? thisQualification.toJSON() : undefined,
              )
            : undefined,
        };
      }
    } else {
      return {
        uid: this.uid,
        changeLocalIdentifer: this.changeLocalIdentifer ? this.changeLocalIdentifer : undefined,
        created: this.created.toJSON(),
        updated: this.updated.toJSON(),
        updatedBy: this.updatedBy,
        history: this.formatWorkerHistory(this._auditEvents),
      };
    }
  }

  /*
   * attributes
   */
  get uid() {
    return this._uid;
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
          id: establishmentId,
        },
        attributes: ['id'],
      });
      if (referenceEstablishment && referenceEstablishment.id && referenceEstablishment.id === establishmentId)
        return true;
    } catch (err) {
      console.error(err);
    }
    return false;
  }

  // returns true if all mandatory properties for a Worker exist and are valid
  get hasMandatoryProperties() {
    let allExistAndValid = true; // assume all exist until proven otherwise

    // in bulk upload, a worker entity, if UNCHECKED, will be nothing more than a status and a local identifier
    if (this._status === null || !STOP_VALIDATING_ON.includes(this._status)) {
      try {
        const nameIdProperty = this._properties.get('NameOrId');
        if (!(nameIdProperty && nameIdProperty.isInitialised && nameIdProperty.valid)) {
          allExistAndValid = false;
          this._validations.push(
            new ValidationMessage(ValidationMessage.ERROR, 101, nameIdProperty ? 'Invalid' : 'Missing', [
              'WorkerNameOrId',
            ]),
          );
          this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid name or id property');
        }

        const mainJobProperty = this._properties.get('MainJob');
        if (!(mainJobProperty && mainJobProperty.isInitialised && mainJobProperty.valid)) {
          allExistAndValid = false;
          this._validations.push(
            new ValidationMessage(ValidationMessage.ERROR, 102, mainJobProperty ? 'Invalid' : 'Missing', [
              'WorkerMainJob',
            ]),
          );
          this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid main job property');
        }

        const contractProperty = this._properties.get('Contract');
        if (!(contractProperty && contractProperty.isInitialised && contractProperty.valid)) {
          allExistAndValid = false;
          this._validations.push(
            new ValidationMessage(ValidationMessage.ERROR, 103, contractProperty ? 'Invalid' : 'Missing', [
              'WorkerContract',
            ]),
          );
          this._log(Worker.LOG_ERROR, 'Worker::hasMandatoryProperties - missing or invalid contract property');
        }
      } catch (err) {
        console.error(err);
      }
    }

    return allExistAndValid;
  }

  // this helper validates reason, doing a lookup on id or reason text; returns false if
  //  invalidate, otherwise the validated reason (with id and reason)
  async validateReason(reasonDef) {
    if (!reasonDef) return false;
    if (!(reasonDef.id || reasonDef.reason)) return false;
    if (reasonDef.id && !Number.isInteger(reasonDef.id)) return false;

    // reason "other" qualifier is optional, but if given, it must be less than 500 characters
    const MAX_LENGTH_ON_OTHER_REASON = 500;
    if (reasonDef.other && reasonDef.other.length > MAX_LENGTH_ON_OTHER_REASON) return false;

    let referenceReason = null;
    if (reasonDef.id) {
      referenceReason = await models.workerLeaveReasons.findOne({
        where: {
          id: reasonDef.id,
        },
        attributes: ['id', 'reason'],
      });
    } else {
      referenceReason = await models.workerLeaveReasons.findOne({
        where: {
          reason: reasonDef.reason,
        },
        attributes: ['id', 'reason'],
      });
    }

    const leaveReasonIdOfOther = 8;
    if (referenceReason && referenceReason.id) {
      // found a ethnicity match
      return {
        id: referenceReason.id,
        reason: referenceReason.reason,
        other: reasonDef.id === leaveReasonIdOfOther && reasonDef.other ? reasonDef.other : null,
      };
    } else {
      return false;
    }
  }

  // returns true if this worker is WDF eligible as referenced from the
  //  given effective date; otherwise returns false
  async isWdfEligible(effectiveFrom) {
    const wdfByProperty = await this.wdf(effectiveFrom);
    const wdfPropertyValues = Object.values(wdfByProperty);

    // NOTE - the worker does not have to be completed before it can be eligible for WDF
    return {
      lastEligibility: this._lastWdfEligibility ? this._lastWdfEligibility.toISOString() : null,
      isEligible: wdfPropertyValues.every((thisWdfProperty) => {
        if (
          (thisWdfProperty.isEligible === 'Yes' && thisWdfProperty.updatedSinceEffectiveDate) ||
          thisWdfProperty.isEligible === 'Not relevant'
        ) {
          return true;
        } else {
          return false;
        }
      }),
      currentEligibility: wdfPropertyValues.every((thisWdfProperty) => thisWdfProperty.isEligible !== 'No'),
      ...wdfByProperty,
    };
  }

  _isPropertyWdfBasicEligible(refEpoch, property) {
    // no record given, so test eligibility of this Worker
    const PER_PROPERTY_ELIGIBLE = 0;
    const RECORD_LEVEL_ELIGIBLE = 1;
    const COMPLETED_PROPERTY_ELIGIBLE = 2;
    const ELIGIBILITY_REFERENCE = PER_PROPERTY_ELIGIBLE;

    let referenceTime = null;

    switch (ELIGIBILITY_REFERENCE) {
      case PER_PROPERTY_ELIGIBLE:
        referenceTime = property.savedAt ? property.savedAt.getTime() : null;
        break;
      case RECORD_LEVEL_ELIGIBLE:
        referenceTime = this._updated.getTime();
        break;
      case COMPLETED_PROPERTY_ELIGIBLE:
        const completedProperty = this._properties.get('Completed');
        referenceTime = completedProperty && completedProperty.savedAt ? completedProperty.savedAt.getTime() : null;
        break;
    }

    return (
      property &&
      property.property !== null &&
      property.property !== undefined &&
      property.valid &&
      referenceTime !== null
    );
  }

  // returns the WDF eligibility of each WDF relevant property as referenced from
  //  the given effect date
  // if "record" is given, then the WDF eligibility is calculated from the raw Worker record data
  async wdf(effectiveFrom) {
    const myWdf = {};
    const effectiveFromEpoch = effectiveFrom.getTime();

    // gender/date of birth/nationality
    myWdf.gender = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('Gender')) ? 'Yes' : 'No',
      updatedSinceEffectiveDate: this._properties.get('Gender').toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.dateOfBirth = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('DateOfBirth'))
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties.get('DateOfBirth').toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.nationality = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('Nationality'))
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties.get('Nationality').toJSON(false, true, WdfCalculator.effectiveDate),
    };

    // main job, other job, main job start date, source of recruitment, employment status (contract)
    myWdf.mainJob = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('MainJob')) ? 'Yes' : 'No',
      updatedSinceEffectiveDate: this._properties.get('MainJob').toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.mainJobStartDate = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('MainJobStartDate'))
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties
        .get('MainJobStartDate')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.recruitedFrom = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('RecruitedFrom'))
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties.get('RecruitedFrom').toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.contract = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('Contract')) ? 'Yes' : 'No',
      updatedSinceEffectiveDate: this._properties.get('Contract').toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.zeroHoursContract = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('ZeroHoursContract'))
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties
        .get('ZeroHoursContract')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    let weeklyHoursContractedEligible;
    let weeklyHoursAverageEligible;

    if (this._properties.get('ZeroHoursContract').property === null) {
      // we have insufficient information to calculate whether the average/contracted weekly hours is WDF eligibnle
      weeklyHoursContractedEligible = 'Not relevant';
      weeklyHoursAverageEligible = 'Not relevant';
    } else {
      if (this._properties.get('ZeroHoursContract').property === 'No') {
        if (['Permanent', 'Temporary'].includes(this._properties.get('Contract').property)) {
          weeklyHoursContractedEligible = this._isPropertyWdfBasicEligible(
            effectiveFromEpoch,
            this._properties.get('WeeklyHoursContracted'),
          )
            ? 'Yes'
            : 'No';
        } else {
          weeklyHoursContractedEligible = 'Not relevant';
        }

        if (['Pool/Bank', 'Agency', 'Other'].includes(this._properties.get('Contract').property)) {
          weeklyHoursAverageEligible = this._isPropertyWdfBasicEligible(
            effectiveFromEpoch,
            this._properties.get('WeeklyHoursAverage'),
          )
            ? 'Yes'
            : 'No';
        } else {
          weeklyHoursAverageEligible = 'Not relevant';
        }
      } else if (this._properties.get('ZeroHoursContract').property === 'Yes') {
        // regardless of contract, all workers on zero hours contract, have an average set of weekly hours
        weeklyHoursContractedEligible = 'Not relevant';
        weeklyHoursAverageEligible = this._isPropertyWdfBasicEligible(
          effectiveFromEpoch,
          this._properties.get('WeeklyHoursAverage'),
        )
          ? 'Yes'
          : 'No';
      } else {
        // if zero hours contract is neither Yes or No, the average/contracted hour egligibility is not relevant
        weeklyHoursContractedEligible = 'Not relevant';
        weeklyHoursAverageEligible = 'Not relevant';
      }
    }

    myWdf.weeklyHoursContracted = {
      isEligible: weeklyHoursContractedEligible,
      updatedSinceEffectiveDate: this._properties
        .get('WeeklyHoursContracted')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.weeklyHoursAverage = {
      isEligible: weeklyHoursAverageEligible,
      updatedSinceEffectiveDate: this._properties
        .get('WeeklyHoursAverage')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    // sickness and salary
    myWdf.annualHourlyPay = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('AnnualHourlyPay'))
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties
        .get('AnnualHourlyPay')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    let daysSickEligible;
    // Note - contract is a mandatory property - it will always have value
    if (['Permanent', 'Temporary'].includes(this._properties.get('Contract').property)) {
      daysSickEligible = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('DaysSick'))
        ? 'Yes'
        : 'No';
    } else {
      daysSickEligible = 'Not relevant';
    }

    myWdf.daysSick = {
      isEligible: daysSickEligible,
      updatedSinceEffectiveDate: this._properties.get('DaysSick').toJSON(false, true, WdfCalculator.effectiveDate),
    };

    // qualifications and care certificate
    myWdf.careCertificate = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('CareCertificate'))
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties
        .get('CareCertificate')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.qualificationInSocialCare = {
      isEligible: this._isPropertyWdfBasicEligible(
        effectiveFromEpoch,
        this._properties.get('QualificationInSocialCare'),
      )
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties
        .get('QualificationInSocialCare')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    let socialCareQualificationEligible;
    let highestQualificationEligible;

    if (
      this._properties.get('QualificationInSocialCare').property === null ||
      this._properties.get('QualificationInSocialCare').property !== 'Yes'
    ) {
      // if not having defined 'having a qualification in social care' or 'have said no'
      socialCareQualificationEligible = 'Not relevant';
    } else {
      socialCareQualificationEligible = this._isPropertyWdfBasicEligible(
        effectiveFromEpoch,
        this._properties.get('SocialCareQualification'),
      )
        ? 'Yes'
        : 'No';
    }

    myWdf.socialCareQualification = {
      isEligible: socialCareQualificationEligible,
      updatedSinceEffectiveDate: this._properties
        .get('SocialCareQualification')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    myWdf.otherQualification = {
      isEligible: this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('OtherQualifications'))
        ? 'Yes'
        : 'No',
      updatedSinceEffectiveDate: this._properties
        .get('OtherQualifications')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    if (
      this._properties.get('OtherQualifications').property === null ||
      this._properties.get('OtherQualifications').property !== 'Yes'
    ) {
      // if not having defined 'having another qualification' or 'have said no'
      highestQualificationEligible = 'Not relevant';
    } else {
      highestQualificationEligible = this._isPropertyWdfBasicEligible(
        effectiveFromEpoch,
        this._properties.get('HighestQualification'),
      )
        ? 'Yes'
        : 'No';
    }

    myWdf.highestQualification = {
      isEligible: highestQualificationEligible,
      updatedSinceEffectiveDate: this._properties
        .get('HighestQualification')
        .toJSON(false, true, WdfCalculator.effectiveDate),
    };

    return myWdf;
  }

  // returns the WDF eligibilty as JSON object
  async wdfToJson() {
    const effectiveFrom = WdfCalculator.effectiveDate;
    return {
      effectiveFrom: effectiveFrom.toISOString(),
      ...(await this.isWdfEligible(effectiveFrom)),
    };
  }

  static async _updateLocalIdOnWorker(thisGivenWorker, transaction, updatedTimestamp, username, allAuditEvents) {
    const updatedWorker = await models.worker.update(
      {
        LocalIdentifierValue: thisGivenWorker.value,
        LocalIdentifierSavedBy: username,
        LocalIdentifierChangedBy: username,
        LocalIdentifierSavedAt: updatedTimestamp,
        LocalIdentifierChangedAt: updatedTimestamp,
      },
      {
        returning: true,
        where: {
          uid: thisGivenWorker.uid,
        },
        attributes: ['id', 'updated'],
        transaction,
      },
    );

    if (updatedWorker[0] === 1) {
      const updatedRecord = updatedWorker[1][0].get({ plain: true });
      allAuditEvents.push({
        workerFk: updatedRecord.ID,
        username,
        type: 'saved',
        property: 'LocalIdentifier',
      });
      allAuditEvents.push({
        workerFk: updatedRecord.ID,
        username,
        type: 'changed',
        property: 'LocalIdentifier',
        event: {
          new: thisGivenWorker.value,
        },
      });
    }
  }

  // update the local identifiers across all workers associated with the given establishment
  //  - When updating the local identifier, the local identifier property itself is audited, but the workers's own
  //    "updated" status is not updated
  static async bulkUpdateLocalIdentifiers(username, establishmentId, givenLocalIdentifiers) {
    try {
      const myWorkers = await Worker.fetch(establishmentId);
      const myWorkersUIDs = myWorkers.map((worker) => {
        return {
          uid: worker.uid,
          localIdentifier: worker.localIdentifier,
        };
      });

      const updatedTimestamp = new Date();
      const updatedUids = [];
      await models.sequelize.transaction(async (t) => {
        const dbUpdatePromises = [];
        const allAuditEvents = [];

        givenLocalIdentifiers.forEach((thisGivenWorker) => {
          if (thisGivenWorker && thisGivenWorker.uid) {
            const foundWorker = myWorkersUIDs.find((currentWorker) => currentWorker.uid === thisGivenWorker.uid);

            if (foundWorker && foundWorker.localIdentifier !== thisGivenWorker.value) {
              const updateThisWorker = Worker._updateLocalIdOnWorker(
                thisGivenWorker,
                t,
                updatedTimestamp,
                username,
                allAuditEvents,
              );
              dbUpdatePromises.push(updateThisWorker);
              updatedUids.push(thisGivenWorker);
            } else if (foundWorker) {
              updatedUids.push(thisGivenWorker);
            } else {
              // not found this worker; silently ignore it
            }
          }
        });

        await Promise.all(dbUpdatePromises);
        await models.workerAudit.bulkCreate(allAuditEvents, { transaction: t });
      });

      return updatedUids;
    } catch (err) {
      console.error('Worker::bulkUpdateLocalIdentifiers error: ', err);
      throw err;
    }
  }

  static async recalcWdf(username, establishmentId, workerUid, externalTransaction) {
    try {
      const thisWorker = new Worker(establishmentId);
      await thisWorker.restore(workerUid);

      // only try to update if not yet eligible
      if (thisWorker._lastWdfEligibility === null) {
        const wdfEligibility = await thisWorker.wdfToJson();
        if (wdfEligibility.isEligible) {
          const updatedWorker = await models.worker.update(
            {
              lastWdfEligibility: new Date(),
            },
            {
              where: {
                uid: workerUid,
              },
              returning: true,
              plain: true,
              transaction: externalTransaction,
            },
          );

          await models.workerAudit.create(
            {
              workerFk: updatedWorker[1].dataValues.ID,
              username,
              type: 'wdfEligible',
            },
            { transaction: externalTransaction },
          );
        }
      } // end if _lastWdfEligibility

      return true;
    } catch (err) {
      console.error('Worker::recalcWdf error: ', err);
      return false;
    }
  }
}

module.exports.Worker = Worker;

// sub types
module.exports.WorkerExceptions = WorkerExceptions;
