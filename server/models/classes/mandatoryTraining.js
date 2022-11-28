/*
 * mandatoryTraining.js
 *
 * The encapsulation of a establishment's Mandatory Training record, including all properties, all specific validation (not API, but object validation),
 * saving & restoring of data to database (via sequelize model), construction and deletion.
 *
 * Also includes representation as JSON, in one or more presentations.
 *
 */

// database models
const models = require('../index');
const EntityValidator = require('./validations/entityValidator').EntityValidator;
const Training = require('../../models/classes/training').Training;
class MandatoryTraining extends EntityValidator {
  constructor(establishmentId) {
    super();
    this._establishmentId = establishmentId;
    this._id = null;
    this._trainingId = null;
    this._jobId = null;
    this._created = null;
    this._updated = null;
    this._createdBy = null;
    this._updatedBy = null;
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
      console.log(`TODO: (${level}) - Mandatory Training class: `, msg);
    }
  }

  set mandatorytrainingDetails(obj) {
    this._mandatorytrainingDetails = obj;
  }

  get mandatorytrainingDetails() {
    return this._mandatorytrainingDetails;
  }

  set establishmentId(newId) {
    this._establishmentId = newId;
  }

  get establishmentId() {
    return this._establishmentId;
  }

  get id() {
    return this._id;
  }

  get created() {
    return this._created;
  }
  get updated() {
    return this._updated;
  }
  get createdBy() {
    return this._createdBy;
  }
  get updatedBy() {
    return this._updatedBy;
  }

  async load(document) {
    try {
      const validatedTrainingRecord = await this.validateMandatoryTrainingRecord(document);
      if (validatedTrainingRecord !== false) {
        return (this.mandatorytrainingDetails = validatedTrainingRecord);
      } else {
        this._log(MandatoryTraining.LOG_ERROR, 'Failed Validation::load - failed');
        return false;
      }
    } catch (err) {
      this.validationReportError(`load - error: ${err}`);
      throw new Error('Failed Validation');
    }
  }

  async validateMandatoryTrainingRecord(document) {
    let returnStatus;
    if (document) {
      returnStatus = this.checkMandatoryTrainingRecordHasTrainingCategoryId(document.trainingCategoryId);
      const trainingCategoryDetails = await this.findWorkerTrainingCategories(document.trainingCategoryId);
      returnStatus = this.checkMandatoryTrainingRecordCategoryDetails(trainingCategoryDetails, document);
    } else {
      returnStatus = this.validationReportError('Invalid Input');
    }
    return returnStatus ? document : false;
  }

  checkMandatoryTrainingRecordHasTrainingCategoryId(trainingCategoryId) {
    return trainingCategoryId ? true : this.validationReportError('Training Category ID missing');
  }

  async findWorkerTrainingCategories(trainingCategoryId) {
    return await models.workerTrainingCategories.findOne({
      where: {
        id: trainingCategoryId,
      },
      attributes: ['id'],
    });
  }

  checkMandatoryTrainingRecordCategoryDetails(trainingCategoryDetails, document) {
    if (trainingCategoryDetails && trainingCategoryDetails.id) {
      return document.allJobRoles ? true : this.checkNewMandatoryTrainingJobRoles(document.jobs);
    } else {
      return this.validationReportError('Training record not found');
    }
  }

  async checkNewMandatoryTrainingJobRoles(newMandatoryTrainingJobRolesArray) {
    if (Array.isArray(newMandatoryTrainingJobRolesArray) && newMandatoryTrainingJobRolesArray.length > 0) {
      for (let i = 0; i < newMandatoryTrainingJobRolesArray.length; i++) {
        let job = newMandatoryTrainingJobRolesArray[i];
        const jobDetails = await models.job.findOne({
          where: {
            id: job.id,
          },
          attributes: ['id'],
        });
        if (!this.checkJobDetailsExist(jobDetails)) {
          return false;
        }
      }
    } else {
      return this.validationReportError('Selected job roles record not found');
    }
    return true;
  }

  checkJobDetailsExist(jobDetails) {
    if (!jobDetails || !jobDetails.id) {
      return this.validationReportError('Job role record not found');
    }
  }

  validationReportError(specifiedErrorString) {
    console.error(`POST:: create mandatoryTraining - Failed Validation - ${specifiedErrorString}`);
    this._log(MandatoryTraining.LOG_ERROR, `Failed Validation - ${specifiedErrorString}`);
    return false;
  }

  async save(savedBy, externalTransaction = null) {
    if (this._initialise()) {
      if (this.mandatorytrainingDetails.allJobRoles) {
        this.mandatorytrainingDetails.jobs = await this.findAllJobRoles();
      }
      try {
        for (let i = 0; i < this.mandatorytrainingDetails.jobs.length; i++) {
          let creationDocument = this.getCreationDocument(i, savedBy);
          await this.saveMandatoryTrainingDetailsToDB(externalTransaction, creationDocument);
        }
        return true;
      } catch (err) {
        this.saveReportError(err);
      }
    } else {
      this.saveReportError(`with id (${this._id})`);
    }
  }

  _initialise() {
    if (this._id === null) {
      this._isNew = true;
      return true;
    } else {
      return false;
    }
  }

  async findAllJobRoles() {
    let allJobRoles = await models.job.findAll({
      attributes: ['id'],
    });

    if (allJobRoles && Array.isArray(allJobRoles) && allJobRoles.length > 0) {
      return allJobRoles;
    } else {
      this.saveReportError('No Job roles found');
    }
  }

  getCreationDocument(mandatorytrainingDetailsJobsIndex, savedBy) {
    let job = this.mandatorytrainingDetails.jobs[mandatorytrainingDetailsJobsIndex];
    const now = new Date();
    return {
      establishmentFK: this.establishmentId,
      trainingCategoryFK: this.mandatorytrainingDetails.trainingCategoryId,
      jobFK: job.id,
      created: now,
      updated: now,
      createdBy: savedBy.toLowerCase(),
      updatedBy: savedBy.toLowerCase(),
    };
  }

  async saveMandatoryTrainingDetailsToDB(externalTransaction, creationDocument) {
    await models.sequelize.transaction(async (t) => {
      const sanitisedResults = await this.executeMandatoryTrainingSave(externalTransaction, creationDocument, t);
      this._isNew = false;
      this._log(MandatoryTraining.LOG_INFO, `Created Mandatory Training Record with id (${sanitisedResults.ID})`);
    });
    return;
  }

  async executeMandatoryTrainingSave(externalTransaction, creationDocument, t) {
    const thisTransaction = externalTransaction ? externalTransaction : t;
    let creation = await models.MandatoryTraining.create(creationDocument, {
      transaction: thisTransaction,
    });
    return creation.get({ plain: true });
  }

  saveReportError(specifiedErrorString) {
    console.error(
      `POST:: create mandatoryTraining - Failed to save new Mandatory training record: - ${specifiedErrorString}`,
    );
    this._log(MandatoryTraining.LOG_ERROR, `Failed to save new Mandatory training record: - ${specifiedErrorString}`);
    throw new Error(`Failed to save new Mandatory Training record: - ${specifiedErrorString}`);
  }

  /**
   * This gets all the MandatoryTraining for a specific Worker
   */
  static async fetchMandatoryTrainingForWorker(workerUid) {
    const fetchWorker = await models.worker.findOne({
      attributes: ['establishmentFk', 'MainJobFkValue'],
      where: {
        WorkerUID: workerUid,
      },
    });
    if (!fetchWorker) {
      throw new Error('Worker ' + workerUid + ' doesnt exist');
    }
    const fetchMandatoryTrainingResults = await models.MandatoryTraining.findAll({
      include: [
        {
          model: models.workerTrainingCategories,
          as: 'workerTrainingCategories',
          attributes: ['id', 'category'],
        },
      ],
      where: {
        establishmentFK: fetchWorker.establishmentFk,
        jobFK: fetchWorker.MainJobFkValue,
      },
    });
    return fetchMandatoryTrainingResults;
  }

  /**
   * Returns all saved mandatory training list including training category name, job name and establishment id
   */
  static async fetch(establishmentId) {
    const allMandatoryTrainingRecords = [];
    const fetchResults = await models.MandatoryTraining.findAll({
      include: [
        {
          model: models.workerTrainingCategories,
          as: 'workerTrainingCategories',
          attributes: ['id', 'category'],
        },
        {
          model: models.job,
          as: 'job',
          attributes: ['id', 'title'],
        },
      ],
      order: [['updated', 'DESC']],
      where: {
        establishmentFK: establishmentId,
      },
    });

    if (fetchResults) {
      fetchResults.forEach((result) => {
        if (allMandatoryTrainingRecords.length > 0) {
          const foundCategory = allMandatoryTrainingRecords.filter(
            (el) => el.trainingCategoryId === result.trainingCategoryFK,
          );
          if (foundCategory.length === 0) {
            allMandatoryTrainingRecords.push({
              establishmentId: result.establishmentFK,
              trainingCategoryId: result.trainingCategoryFK,
              category: result.workerTrainingCategories.category,
              jobs: [{ id: result.jobFK, title: result.job.title }],
            });
          } else {
            foundCategory[0].jobs.push({ id: result.jobFK, title: result.job.title });
          }
        } else {
          allMandatoryTrainingRecords.push({
            establishmentId: result.establishmentFK,
            trainingCategoryId: result.trainingCategoryFK,
            category: result.workerTrainingCategories.category,
            jobs: [{ id: result.jobFK, title: result.job.title }],
          });
        }
      });
    }

    let lastUpdated = null;
    if (fetchResults && fetchResults.length === 1) {
      lastUpdated = fetchResults[0];
    } else if (fetchResults && fetchResults.length > 1) {
      lastUpdated = fetchResults.reduce((a, b) => {
        return a.updated > b.updated ? a : b;
      });
    }

    const allJobRoles = await models.job.findAll();
    if (allJobRoles) {
      const response = {
        mandatoryTrainingCount: allMandatoryTrainingRecords.length,
        allJobRolesCount: allJobRoles.length,
        lastUpdated: lastUpdated ? lastUpdated.updated.toISOString() : undefined,
        mandatoryTraining: allMandatoryTrainingRecords,
      };

      return response;
    }
  }

  /**
   * Returns all saved mandatory training list including worker details
   * Calculate missing mandatory training counts if not available on those worker records
   */
  static async fetchAllMandatoryTrainings(establishmentId) {
    // Fetch all saved mandatory training
    const mandatoryTrainingDetails = await MandatoryTraining.fetch(establishmentId);
    if (mandatoryTrainingDetails && mandatoryTrainingDetails.mandatoryTraining.length > 0) {
      let mandatoryTraining = mandatoryTrainingDetails.mandatoryTraining;
      for (let i = 0; i < mandatoryTraining.length; i++) {
        let tempWorkers = [];
        let jobs = mandatoryTraining[i].jobs;
        for (let j = 0; j < jobs.length; j++) {
          const thisWorker = await models.worker.findAll({
            attributes: ['id', 'uid', 'NameOrIdValue'],
            where: {
              establishmentFk: establishmentId,
              archived: false,
              MainJobFkValue: jobs[j].id,
            },
          });
          if (thisWorker && thisWorker.length > 0) {
            thisWorker.forEach(async (worker) => {
              tempWorkers.push({
                id: worker.id,
                uid: worker.uid,
                NameOrIdValue: worker.NameOrIdValue,
                mainJob: { jobId: jobs[j].id, title: jobs[j].title },
              });
            });
          }
        }
        delete mandatoryTraining[i].jobs;
        mandatoryTraining[i].workers = [];
        if (tempWorkers.length > 0) {
          mandatoryTraining[i].workers = await Training.getAllRequiredCounts(
            establishmentId,
            tempWorkers,
            mandatoryTraining[i].trainingCategoryId,
          );
        }
      }
    }
    delete mandatoryTrainingDetails.mandatoryTrainingCount;
    delete mandatoryTrainingDetails.allJobRolesCount;
    return mandatoryTrainingDetails;
  }

  async deleteAllMandatoryTraining() {
    try {
      const fetchQuery = {
        where: {
          EstablishmentFK: this.establishmentId,
        },
      };
      return await models.MandatoryTraining.destroy(fetchQuery);
    } catch (err) {
      this._log(MandatoryTraining.LOG_ERROR, err);

      throw new Error('Failed to delete Mandatory Training record');
    }
  }
}

module.exports.MandatoryTraining = MandatoryTraining;
