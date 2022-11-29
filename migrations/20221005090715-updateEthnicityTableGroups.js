'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('update cqc."Ethnicity" set "EthnicityGroup"=\'White\' where "ID"=1', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Ethnicity" set "EthnicityGroup"=\'Don\'\'t know\' where "ID"=2', {
          transaction,
        }),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('update cqc."Ethnicity" set "EthnicityGroup"=\'\' where "ID"=1', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Ethnicity" set "EthnicityGroup"=\'\' where "ID"=2', {
          transaction,
        }),
      ]);
    });
  },
};
