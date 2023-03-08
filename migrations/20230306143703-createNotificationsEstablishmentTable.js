'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE cqc."Notifications" ALTER COLUMN "notificationUid" SET DEFAULT gen_random_uuid();
      `);

    await queryInterface.sequelize.query(`CREATE TABLE IF NOT EXISTS cqc."NotificationsEstablishment"
      (
          "notificationUid" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          "type" cqc."NotificationTypes" NOT NULL,
          "establishmentUid" uuid NOT NULL,
          "created" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdByUserUID" uuid NOT NULL,
          "notificationContentUid" uuid,
          "isViewed" boolean NOT NULL DEFAULT false
      );`);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS cqc."NotificationsEstablishment";
    ALTER TABLE cqc."Notifications" ALTER COLUMN "notificationUid" DROP DEFAULT;
    `);
  },
};
