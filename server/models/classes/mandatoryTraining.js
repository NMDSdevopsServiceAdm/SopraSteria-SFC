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

   // used by save to initialise a new Mandatory Trainign Record; returns true if having initialised this Training Record
   _initialise() {
     if (this._id === null) {
         this._isNew = true;
         return true;
     } else {
         return false;
     }
   }

   // validates a given mandatory training record; returns the training record if valid
   async validateMandatoryTrainingRecord(document) {
     let validatedMandatoryTrainingRecord = [];
     let returnStatus = true;
     //validate all posted training ids
     if(document && Array.isArray(document)){
       for(let i = 0; i < document.length; i++){
         let doc = document[i];
         if(!doc.trainingCategoryId){
           console.error('POST:: create mandatoryTraining - Failed Validation - Training Category ID missing');
           this._log(MandatoryTraining.LOG_ERROR, 'Failed Validation - Training Category ID missing');
           return false;
         }
         // get training details
         const trainingCategoryDetails = await models.workerTrainingCategories.findOne({
           where: {
             id: doc.trainingCategoryId
           },
           attributes: ['id']
         });

         if (trainingCategoryDetails && trainingCategoryDetails.id) {
           // get job details if doc.allJobRoles === false
           if(!doc.allJobRoles){
             let foundJobRoles = true;
             if(!doc.allJobRoles && Array.isArray(doc.jobs) && doc.jobs.length > 0){

               for(let j = 0; j < doc.jobs.length; j++){
                 let job = doc.jobs[j];
                 const jobDetails = await models.job.findOne({
                   where: {
                    id: job.id
                   },
                   attributes: ['id']
                 });

                 if (!jobDetails || !jobDetails.id) {
                   foundJobRoles = false;
                   console.error('POST:: create mandatoryTraining - Failed Validation - Job role record not found');
                   this._log(MandatoryTraining.LOG_ERROR, 'Failed Validation - Job role record not found');
                   returnStatus = false;
                 }
               }
             }else{
               console.error('POST:: create mandatoryTraining - Failed Validation - Selected job roles record not found');
               this._log(MandatoryTraining.LOG_ERROR, 'Failed Validation - Selected job roles record not found');
               returnStatus = false;
             }

             if(foundJobRoles){
               validatedMandatoryTrainingRecord.push(doc);
             }
           }else{
             validatedMandatoryTrainingRecord.push(doc);
           }
         }else{
           console.error('POST:: create mandatoryTraining - Failed Validation - Training Category record not found');
           this._log(MandatoryTraining.LOG_ERROR, 'Failed Validation - Training record not found');
           return false;
         }
       }
     }else{
       console.error('POST:: create mandatoryTraining - Failed Validation - Invalid Input');
       this._log(MandatoryTraining.LOG_ERROR, 'Invalid Input');
       return false;
     }

     if (returnStatus === false) {
       return false;
     } else {
         return validatedMandatoryTrainingRecord;
     }
   }

   // takes the given JSON document and updates self (internal properties)
   // Thows "Error" on error.
   async load(document) {
     try {
         const validatedTrainingRecord = await this.validateMandatoryTrainingRecord(document);

         if (validatedTrainingRecord !== false) {
             return this.mandatorytrainingDetails = validatedTrainingRecord;
         } else {
             this._log(MandatoryTraining.LOG_ERROR, `Failed Validation::load - failed`);
             return false
         }
     } catch (err) {
         console.error(`POST:: create mandatoryTraining - Failed Validation::load - error: ${err}`);
         this._log(MandatoryTraining.LOG_ERROR, `Failed Validation::load - error: ${err}`);
         throw new Error('Failed Validation');
     }
   }

   // saves the Training record to DB. Returns true if saved; false is not.
   // Throws "Error" on error
   async save(savedBy, externalTransaction=null) {
     let returnSavedResponse = [];
     let failedWhileSave = false;
     let initializedRecords = this._initialise();
     if(initializedRecords && this._isNew){
       // create new Mandatory Training Record
       try{

         //find already existing mandatory details, if found delete them
         for(let i = 0; i < this.mandatorytrainingDetails.length; i++){
           let row = this.mandatorytrainingDetails[i];
           const fetchQuery = {
             where: {
               establishmentFK: this.establishmentId
             }
           };
           await models.MandatoryTraining.destroy(fetchQuery);
         }

         // save new mandatory training details
         for(let i = 0; i < this.mandatorytrainingDetails.length; i++){
           let row = this.mandatorytrainingDetails[i];
           if(row.allJobRoles){
             // fetch all job roles
             let allJobRoles = await models.job.findAll({
               attributes: ['id'],
             });
             if (allJobRoles && Array.isArray(allJobRoles) && allJobRoles.length > 0) {
               row.jobs = allJobRoles;
             } else {
               failedWhileSave = true;
               throw new Error('No Job roles found');
             }
           }

           if(Array.isArray(row.jobs) && row.jobs.length > 0){
             for(let j = 0; j < row.jobs.length; j++){
               let job = row.jobs[j];
               const now = new Date();
               let creationDocument = {
                 establishmentFK: this.establishmentId,
                 trainingCategoryFK: row.trainingCategoryId,
                 jobFK: job.id,
                 created: now,
                 updated: now,
                 createdBy: savedBy.toLowerCase(),
                 updatedBy: savedBy.toLowerCase()
               }

               // need to create the Training record only
               //  in one transaction
               await models.sequelize.transaction(async t => {
                 // the saving of an Mandatory Training record can be initiated within
                 //  an external transaction
                 const thisTransaction = externalTransaction ? externalTransaction : t;

                 // now save the document
                 let creation = await models.MandatoryTraining.create(creationDocument, {transaction: thisTransaction});

                 const sanitisedResults = creation.get({plain: true});
                 returnSavedResponse.push({
                   id: sanitisedResults.ID,
                   created: sanitisedResults.created,
                   updated: sanitisedResults.updated,
                   createdBy: savedBy.toLowerCase(),
                   updatedBy: savedBy.toLowerCase()
                 });
                 this._isNew = false;

                 this._log(MandatoryTraining.LOG_INFO, `Created Mandatory Training Record with id (${sanitisedResults.ID})`);
               });
             }
           }
         }
         if(!failedWhileSave){
           return returnSavedResponse;
         }
       }
       catch (err) {
         console.error(`POST:: create mandatoryTraining - Failed to save new Mandatory training record: ${err}`);
         this._log(MandatoryTraining.LOG_ERROR, `Failed to save new Mandatory training record: ${err}`);
         throw new Error('Failed to save new Mandatory Training record');
       }
     }else{
       // we are updating an existing Mandatory Training Record
       try{

       }
       catch (err) {
         console.error(`POST:: create mandatoryTraining - Failed to update Mandatory Training record with id (${this._id})`);
         this._log(MandatoryTraining.LOG_ERROR, `Failed to update Mandatory Training record with id (${this._id})`);
         throw new Error('Failed to update Mandatory Training record');
       }
     }
   }

   /**
    * Returns all saved mandatory training list including training category name, job name and establishment id
    */
   static async fetch(establishmentId){
     const allMandatoryTrainingRecords = [];
     const fetchResults = await models.MandatoryTraining.findAll({
       include: [
         {
           model: models.workerTrainingCategories,
           as: 'workerTrainingCategories',
           attributes: ['id', 'category']
         },
         {
           model: models.job,
           as: 'job',
           attributes: ['id', 'title']
         }
       ],
       order: [
           ['updated', 'DESC']
       ],
       where: {
         establishmentFK: establishmentId
       }
     });

     if(fetchResults){
       fetchResults.forEach(result => {
         if(allMandatoryTrainingRecords.length > 0){
           const foundCategory = allMandatoryTrainingRecords.filter(el => el.trainingCategoryId === result.trainingCategoryFK);
           if (foundCategory.length === 0){
             allMandatoryTrainingRecords.push({
               establishmentId: result.establishmentFK,
               trainingCategoryId: result.trainingCategoryFK,
               category: result.workerTrainingCategories.category,
               jobs: [{id: result.jobFK, title: result.job.title}]
             });
           }else{
             foundCategory[0].jobs.push({id: result.jobFK, title: result.job.title});
           }
         }else{
           allMandatoryTrainingRecords.push({
             establishmentId: result.establishmentFK,
             trainingCategoryId: result.trainingCategoryFK,
             category: result.workerTrainingCategories.category,
             jobs: [{id: result.jobFK, title: result.job.title}]
           });
         }
       });
     }

     let lastUpdated = null;
     if (fetchResults && fetchResults.length === 1) {
         lastUpdated = fetchResults[0];
     } else if (fetchResults && fetchResults.length > 1) {
         lastUpdated = fetchResults.reduce((a, b) => { return a.updated > b.updated ? a : b; });
     }

     const allJobRoles = await models.job.findAll();
     if(allJobRoles){
       const response = {
         mandatoryTrainingCount: allMandatoryTrainingRecords.length,
         allJobRolesCount: allJobRoles.length,
         lastUpdated: lastUpdated ? lastUpdated.updated.toISOString() : undefined,
         mandatoryTraining: allMandatoryTrainingRecords
       };

       return response;
     }
   }

   /**
    * Returns all saved mandatory training list including worker details
    * Calculate missing mandatory training counts if not available on those worker records
    */
   static async fetchAllMandatoryTrainings(establishmentId){
     // Fetch all saved mandatory training
     const mandatoryTrainingDetails = await MandatoryTraining.fetch(establishmentId);
     if(mandatoryTrainingDetails && mandatoryTrainingDetails.mandatoryTraining.length > 0){
       let mandatoryTraining = mandatoryTrainingDetails.mandatoryTraining;
       for(let i = 0; i < mandatoryTraining.length; i++){
         let tempWorkers = [];
         let jobs = mandatoryTraining[i].jobs;
         for(let j = 0; j < jobs.length; j++){
           const thisWorker = await models.worker.findAll({
             attributes: ['id', 'uid', 'NameOrIdValue'],
             where:{
               establishmentFk: establishmentId,
               MainJobFkValue: jobs[j].id
             }
           });
           if(thisWorker && thisWorker.length > 0){
             thisWorker.forEach(async worker => {
               tempWorkers.push({
                 id: worker.id,
                 uid: worker.uid,
                 NameOrIdValue: worker.NameOrIdValue,
                 mainJob:{jobId: jobs[j].id, title: jobs[j].title}
               });
             });
           }
         }
         delete mandatoryTraining[i].jobs;
         mandatoryTraining[i].workers = [];
         if(tempWorkers.length > 0){
           mandatoryTraining[i].workers = await Training.getAllRequiredCounts(establishmentId, tempWorkers, mandatoryTraining[i].trainingCategoryId);
         }
       }
     }
     delete mandatoryTrainingDetails.mandatoryTrainingCount;
     delete mandatoryTrainingDetails.allJobRolesCount;
     return mandatoryTrainingDetails;
   }

 }

 module.exports.MandatoryTraining = MandatoryTraining;
