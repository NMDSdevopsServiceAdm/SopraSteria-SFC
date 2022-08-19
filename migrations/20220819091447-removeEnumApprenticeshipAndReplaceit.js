'use strict';
const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: function (queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.sequelize.query(
          'ALTER TYPE cqc."WorkerApprenticeshipTraining" ADD VALUE IF NOT EXISTS \'Think ahead\' ',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'ALTER TYPE cqc."WorkerApprenticeshipTraining" ADD VALUE IF NOT EXISTS \'Social worker integrated Degree\' ',
          {
            transaction,
          },
        ),
      ]);
    });
  },
};
