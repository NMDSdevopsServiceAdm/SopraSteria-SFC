'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Short breaks, respite care\' where "id"=7;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Other adult residential care service\' where "id"=12;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Other adult day care service\' where "id"=10;',
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Short breaks / respite care\' where "id"=7;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Other adult residential care services\' where "id"=12;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Other adult day care services\' where "id"=10;',
          { transaction },
        ),
      ]);
    });
  },
};
