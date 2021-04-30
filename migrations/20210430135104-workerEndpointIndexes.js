'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      await queryInterface.addIndex(
        {
          tableName: 'MandatoryTraining',
          schema: 'cqc',
        },
        {
          fields: ['EstablishmentFK', 'JobFK', 'TrainingCategoryFK'],
          concurrently: true,
        },
      ),
      await queryInterface.addIndex(
        {
          tableName: 'WorkerTraining',
          schema: 'cqc',
        },
        {
          fields: ['WorkerFK', 'Expires'],
          concurrently: true,
        },
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
DROP INDEX IF EXISTS cqc."mandatory_training__establishment_f_k__job_f_k__training_catego";
DROP INDEX IF EXISTS cqc."worker_training__worker_f_k__expires";
    `);
  },
};
