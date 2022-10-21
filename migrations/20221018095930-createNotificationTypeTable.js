'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query('ALTER TYPE cqc."NotificationType" RENAME TO "NotificationTypes"');

    await queryInterface.sequelize.query(`CREATE TABLE IF NOT EXISTS cqc."NotificationType"
    (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        type character varying COLLATE pg_catalog."default",
        title character varying COLLATE pg_catalog."default" NOT NULL,
        created timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "NotificationCategory_pkey" PRIMARY KEY (id)
    )`);

    await queryInterface.sequelize.query(`
      ALTER TABLE cqc."Notifications" ALTER COLUMN "notificationUid" SET DEFAULT gen_random_uuid();
      ALTER TABLE cqc."Notifications" ALTER COLUMN "typeUid" DROP NOT NULL;
      ALTER TABLE IF EXISTS cqc."Notifications" ADD COLUMN "notificationTypeUid" uuid NOT NULL;
      ALTER TABLE IF EXISTS cqc."Notifications"
        ADD CONSTRAINT "notifications_notificationType_fk" FOREIGN KEY ("notificationTypeUid")
        REFERENCES cqc."NotificationType" ("Id") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION;
      `);

    await queryInterface.sequelize.query(`CREATE TABLE IF NOT EXISTS cqc."NotificationsEstablishment"
      (
          "notificationUid" uuid NOT NULL DEFAULT gen_random_uuid(),
          "notificationTypeUid" uuid NOT NULL,
          "establishmentUid" uuid NOT NULL,
          created timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdByUserUID" uuid NOT NULL,
          "notificationContentUid" uuid,
          "isViewed" boolean NOT NULL DEFAULT false,
          CONSTRAINT "NotificationsEstablishment_pkey" PRIMARY KEY ("notificationUid"),
          CONSTRAINT "notificationEstablishment_notificationType_fk" FOREIGN KEY ("notificationTypeUid")
              REFERENCES cqc."NotificationType" ("Id") MATCH SIMPLE
              ON UPDATE NO ACTION
              ON DELETE NO ACTION
      )`);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS cqc."NotificationsEstablishment";
    `);

    await queryInterface.sequelize.query(`
    ALTER TABLE IF EXISTS cqc."Notifications" DROP CONSTRAINT IF EXISTS "notifications_notificationType_fk";
    ALTER TABLE IF EXISTS cqc."Notifications" DROP COLUMN IF EXISTS "notificationTypeUid";
    `);

    await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS cqc."NotificationType";
    `);

    await queryInterface.sequelize.query('ALTER TYPE cqc."NotificationTypes" RENAME TO "NotificationType"');
  },
};
