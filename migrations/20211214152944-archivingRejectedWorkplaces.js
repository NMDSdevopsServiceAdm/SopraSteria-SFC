'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.query(
      'UPDATE cqc."Establishment" SET "Archived" = true WHERE "Status" = \'REJECTED\';',
    );
  },
};
