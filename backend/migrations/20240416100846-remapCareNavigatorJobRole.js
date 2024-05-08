'use strict';
const models = require('../server/models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      async function updateWorker() {
        const workersWithOldJob = await models.worker.count({
          where: {
            MainJobFkValue: 9
          }
        });

        const workersWithNewJobPreUpdate = await models.worker.count({
          where: {
            MainJobFkValue: 8
          }
        });

        await models.worker.update(
          { MainJobFkValue: 8 },
          {
            where: {
              MainJobFkValue: 9
            }
          },
          { transaction }
        );

        const workersWithNewJobPostUpdate = await models.worker.count({
          where: {
            MainJobFkValue: 8
          }
        });

        if(workersWithNewJobPostUpdate !== workersWithOldJob + workersWithNewJobPreUpdate) {
          throw new Error(`Expected ${workersWithOldJob} rows to be updated, but found ${workersWithNewJobPostUpdate - workersWithNewJobPreUpdate} instead`);
        }
      }

      async function updateWorkerJobs() {
        const workersWithOldJob = await models.workerJobs.count({
          where: {
            jobFk: 9
          }
        });

        const workersWithNewJobPreUpdate = await models.workerJobs.count({
          where: {
            jobFk: 8
          }
        });

        await models.workerJobs.update(
          { jobFk: 8 },
          {
            where: {
              jobFk: 9
            }
          },
          { transaction }
        );

        const workersWithNewJobPostUpdate = await models.workerJobs.count({
          where: {
            jobFk: 8
          }
        });

        if(workersWithNewJobPostUpdate !== workersWithOldJob + workersWithNewJobPreUpdate) {
          throw new Error(`WorkerJobs: Expected ${workersWithOldJob} rows to be updated, but found ${workersWithNewJobPostUpdate - workersWithNewJobPreUpdate} instead`);
        }
      }

      async function updateMandatoryTrainingJobs() {
        const trainingWithOldJob = await models.MandatoryTraining.count({
          where: {
            jobFK: 9
          }
        });

        const trainingWithNewJobPreUpdate = await models.MandatoryTraining.count({
          where: {
            jobFK: 8
          }
        });

        await models.MandatoryTraining.update(
          { jobFK: 8 },
          {
            where: {
              jobFK: 9
            }
          },
          { transaction }
        );

        const trainingWithNewJobPostUpdate = await models.MandatoryTraining.count({
          where: {
            jobFK: 8
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
