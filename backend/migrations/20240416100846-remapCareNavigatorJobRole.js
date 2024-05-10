'use strict';
const models = require('../server/models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const oldJobId = 9;
    const newJobId = 8;

    return queryInterface.sequelize.transaction(async (transaction) => {
      async function updateWorker() {
        const workersWithOldJob = await models.worker.count({
          where: {
            MainJobFkValue: oldJobId
          }
        });

        const workersWithNewJobPreUpdate = await models.worker.count({
          where: {
            MainJobFkValue: newJobId
          }
        });

        await models.worker.update(
          { MainJobFkValue: newJobId },
          {
            where: {
              MainJobFkValue: oldJobId
            }
          },
          { transaction }
        );

        const workersWithNewJobPostUpdate = await models.worker.count({
          where: {
            MainJobFkValue: newJobId
          }
        });

        if(workersWithNewJobPostUpdate !== workersWithOldJob + workersWithNewJobPreUpdate) {
          throw new Error(`Expected ${workersWithOldJob} rows to be updated, but found ${workersWithNewJobPostUpdate - workersWithNewJobPreUpdate} instead`);
        }
      }

      async function updateWorkerJobs() {
        const workersWithOldJob = await models.workerJobs.count({
          where: {
            jobFk: oldJobId
          }
        });

        const workersWithNewJobPreUpdate = await models.workerJobs.count({
          where: {
            jobFk: newJobId
          }
        });

        await models.workerJobs.update(
          { jobFk: newJobId },
          {
            where: {
              jobFk: oldJobId
            }
          },
          { transaction }
        );

        const workersWithNewJobPostUpdate = await models.workerJobs.count({
          where: {
            jobFk: newJobId
          }
        });

        if(workersWithNewJobPostUpdate !== workersWithOldJob + workersWithNewJobPreUpdate) {
          throw new Error(`WorkerJobs: Expected ${workersWithOldJob} rows to be updated, but found ${workersWithNewJobPostUpdate - workersWithNewJobPreUpdate} instead`);
        }
      }

      async function updateMandatoryTrainingJobs() {
        const trainingWithOldJob = await models.MandatoryTraining.count({
          where: {
            jobFK: oldJobId
          }
        });

        const trainingWithNewJobPreUpdate = await models.MandatoryTraining.count({
          where: {
            jobFK: newJobId
          }
        });

        await models.MandatoryTraining.update(
          { jobFK: newJobId },
          {
            where: {
              jobFK: oldJobId
            }
          },
          { transaction }
        );

        const trainingWithNewJobPostUpdate = await models.MandatoryTraining.count({
          where: {
            jobFK: newJobId
          }
        });

        if(trainingWithNewJobPostUpdate !== trainingWithOldJob + trainingWithNewJobPreUpdate) {
          throw new Error(`ManadatoryTraining: Expected ${trainingWithOldJob} rows to be updated, but found ${trainingWithNewJobPostUpdate - trainingWithNewJobPreUpdate} instead`);
        }
      }

      async function updateEstablishmentJobs() {
        await queryInterface.sequelize.query(
          `UPDATE cqc."EstablishmentJobs" AS ej
           SET "Total" = (ej."Total" + ej2."Total")
           FROM cqc."EstablishmentJobs" AS ej2
           WHERE ej2."EstablishmentID" = ej."EstablishmentID"
           AND ej2."JobType" = ej."JobType"
           AND ej2."JobID" = ${oldJobId}
           AND ej."JobID" = ${newJobId};`, { transaction }
         );


        await queryInterface.sequelize.query(
          `UPDATE cqc."EstablishmentJobs" AS ej
          SET "JobID" = ${newJobId}
          WHERE ej."JobID" = ${oldJobId}
          AND NOT EXISTS (
            SELECT "JobID"
            FROM cqc."EstablishmentJobs" AS ej2
            WHERE ej2."EstablishmentID" = ej."EstablishmentID"
              AND ej2."JobType" = ej."JobType"
            AND ej2."JobID" = ${newJobId}
          );`, { transaction }
        );

        await models.establishmentJobs.destroy({
          where: {
            jobId: oldJobId
          }
         }, { transaction }
        );
      }

      await updateWorker();
      await updateWorkerJobs();
      await updateMandatoryTrainingJobs();
      await updateEstablishmentJobs();
    });
  },

  async down (queryInterface) {

  }
};
