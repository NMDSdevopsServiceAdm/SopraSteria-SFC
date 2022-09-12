'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Disability adaptations, assistive technology services\' where "id"=3;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Occupational, employment-related services\' where "id"=5;',
          { transaction },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Disability adaptations / assistive technology services\' where "id"=3;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Occupational / employment-related services\' where "id"=5;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Long term conditions services\' where "id"=32;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Residential substance misuse treatment / rehabilitation services\' where "id"=34;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Any children\'\'s / young people\'\'s services\' where "id"=14;',
          { transaction },
        ),
      ]);
    });
  },
};
