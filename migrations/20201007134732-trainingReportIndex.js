'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addIndex(
        {
          tableName: 'MandatoryTraining',
          schema: 'cqc',
        },
        {
          fields: ['EstablishmentFK', 'JobFK', 'TrainingCategoryFK'],
          concurrently: true,
          unique: true,
        },
      ),
      queryInterface.addIndex(
        {
          tableName: 'Establishment',
          schema: 'cqc',
        },
        {
          fields: ['EstablishmentUID', 'Archived'],
          concurrently: true,
          unique: true,
        },
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
DROP INDEX IF EXISTS cqc."mandatory_training__establishment_f_k__job_f_k__training_catego";
DROP INDEX IF EXISTS cqc."establishment__establishment_u_i_d__archived";
    `);
  },
};
