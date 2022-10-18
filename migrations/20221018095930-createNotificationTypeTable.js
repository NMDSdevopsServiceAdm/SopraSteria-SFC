'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query('ALTER TYPE cqc."NotificationType" RENAME TO "NotificationTypes"');

    await queryInterface.sequelize.query('ALTER TABLE cqc."Notifications" ADD COLUMN "LevelId" integer NOT NULL DEFAULT 1');
    await queryInterface.sequelize.query('ALTER TABLE cqc."Notifications" ALTER COLUMN "notificationuid" SET DEFAULT gen_random_uuid()')

    await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS cqc."NotificationType"
    (
        "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "Type" character varying COLLATE pg_catalog."default" UNIQUE,
        "Title" character varying COLLATE pg_catalog."default" NOT NULL,
        "Created" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "NotificationCategory_pkey" PRIMARY KEY ("Id")
    )
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS cqc."NotificationType";
    `);

    await queryInterface.sequelize.query('ALTER TYPE cqc."NotificationTypes" RENAME TO "NotificationType"');
  },
};
