'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('update cqc."Establishment" SET "ShareDataWithLA" = null ;', { transaction }),
        queryInterface.sequelize.query(
          'update cqc."Establishment" SET "ShareDataWithCQC" = null where "ShareDataWithCQC" = false;',
          { transaction },
        ),
      ]);
    });
  },
};
