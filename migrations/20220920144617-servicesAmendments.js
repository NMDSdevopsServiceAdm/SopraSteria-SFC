'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Hospital services for people with mental health needs, learning disabilities, problems with substance misuse\' where "id"=31',
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."services" set "name"=\'Hospital services for people with mental health needs, learning disabilities and/or problems with substance misuse\' where "id"=31',
          { transaction },
        ),
      ]);
    });
  },
};
