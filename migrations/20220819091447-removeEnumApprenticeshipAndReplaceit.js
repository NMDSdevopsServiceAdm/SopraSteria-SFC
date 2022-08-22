'use strict';

module.exports = {
  up: function (queryInterface) {
    return Promise.all([
      queryInterface.sequelize.query(
        'ALTER TYPE cqc."WorkerApprenticeshipTraining" ADD VALUE IF NOT EXISTS \'Think ahead\' ',
      ),
      queryInterface.sequelize.query(
        'ALTER TYPE cqc."WorkerApprenticeshipTraining" ADD VALUE IF NOT EXISTS \'Social worker integrated Degree\' ',
      ),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(`DELETE FROM pg_enum WHERE enumlabel = 'Think ahead'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname ='WorkerApprenticeshipTraining')`),

      queryInterface.sequelize.query(`DELETE FROM pg_enum WHERE enumlabel = 'Social worker integrated Degree'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkerApprenticeshipTraining')`),
    ]);
  },
};
