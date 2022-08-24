'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize
      .query(`DELETE FROM pg_enum WHERE enumlabel = 'Think ahead' OR enumlabel = 'Social worker integrated Degree'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname ='WorkerApprenticeshipTraining')`);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.sequelize.query(
        'ALTER TYPE cqc."WorkerApprenticeshipTraining" ADD VALUE IF NOT EXISTS \'Think ahead\' ',
      ),
      queryInterface.sequelize.query(
        'ALTER TYPE cqc."WorkerApprenticeshipTraining" ADD VALUE IF NOT EXISTS \'Social worker integrated Degree\' ',
      ),
    ]);
  },
};
