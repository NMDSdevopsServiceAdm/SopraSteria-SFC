'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.query(
      'UPDATE cqc."Establishment" SET "ShowSharingPermissionsBanner" = false WHERE "Status" = \'PENDING\' OR "Status" = \'IN PROGRESS\';',
    );
  },
};
