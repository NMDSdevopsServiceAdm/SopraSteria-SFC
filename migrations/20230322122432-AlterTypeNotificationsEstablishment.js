'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'ALTER TABLE cqc."NotificationsEstablishment" ALTER COLUMN "type" TYPE cqc."NotificationType"',
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'ALTER TABLE cqc."NotificationsEstablishment" ALTER COLUMN "type" TYPE cqc."NotificationTypes"',
          { transaction },
        ),
      ]);
    });
  },
};
