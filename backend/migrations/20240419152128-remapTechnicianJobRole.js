'use strict';
const models = require('../server/models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      async function updateWorker() {
        const workersWithOldJob = await models.worker.count({
          where: {
            MainJobFkValue: 29
          }
        });

        const workersWithNewJobPreUpdate = await models.worker.count({
          where: {
            MainJobFkValue: 21
          }
        });

        await models.worker.update(
          { MainJobFkValue: 21 },
          {
            where: {
              MainJobFkValue: 29
            }
          },
          { transaction }
        );

        const workersWithNewJobPostUpdate = await models.worker.count({
          where: {
            MainJobFkValue: 21
          }
        });

        if(workersWithNewJobPostUpdate !== workersWithOldJob + workersWithNewJobPreUpdate) {
          throw new Error(`Worker: Expected ${workersWithOldJob} rows to be updated, but found ${workersWithNewJobPostUpdate - workersWithNewJobPreUpdate} instead`);
        }
      }

      async function updateWorkerJobs() {
        const workersWithOldJob = await models.workerJobs.count({
          where: {
            jobFk: 29
          }
        });

        const workersWithNewJobPreUpdate = await models.workerJobs.count({
          where: {
            jobFk: 21
          }
        });

        await models.workerJobs.update(
          { jobFk: 21 },
          {
            where: {
              jobFk: 29
            }
          },
          { transaction }
        );

        const workersWithNewJobPostUpdate = await models.workerJobs.count({
          where: {
            jobFk: 21
          }
        });

        if(workersWithNewJobPostUpdate !== workersWithOldJob + workersWithNewJobPreUpdate) {
          throw new Error(`WorkerJobs: Expected ${workersWithOldJob} rows to be updated, but found ${workersWithNewJobPostUpdate - workersWithNewJobPreUpdate} instead`);
        }
      }

      async function updateMandatoryTrainingJobs() {
        const trainingWithOldJob = await models.MandatoryTraining.count({
          where: {
            jobFK: 29
          }
        });

        const trainingWithNewJobPreUpdate = await models.MandatoryTraining.count({
          where: {
            jobFK: 21
          }
        });

        await models.MandatoryTraining.update(
          { jobFK: 21 },
          {
            where: {
              jobFK: 29
            }
          },
          { transaction }
        );

        const trainingWithNewJobPostUpdate = await models.MandatoryTraining.count({
          where: {
            jobFK: 21
          }
        });

        if(trainingWithNewJobPostUpdate !== trainingWithOldJob + trainingWithNewJobPreUpdate) {
          throw new Error(`ManadatoryTraining: Expected ${trainingWithOldJob} rows to be updated, but found ${trainingWithNewJobPostUpdate - trainingWithNewJobPreUpdate} instead`);
        }
      }


      await updateWorker();
      await updateWorkerJobs();
      await updateMandatoryTrainingJobs();
    });
  },

  async down (queryInterface) {

  }
};
