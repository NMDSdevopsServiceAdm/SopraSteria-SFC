'use strict';

module.exports = {
  up: async (queryInterface) => {
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

    await queryInterface.sequelize.query('ALTER TYPE cqc."NotificationType" RENAME TO "NotificationTypes"');

    await queryInterface.sequelize.query(
      'ALTER TABLE cqc."Notifications" ALTER COLUMN "notificationUid" SET DEFAULT gen_random_uuid()',
    );
    await queryInterface.sequelize.query('ALTER TABLE cqc."Notifications" ALTER COLUMN "typeUid" DROP NOT NULL');
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS cqc."Notifications" ADD COLUMN "notificationTypeUid" uuid NOT NULL;',
    );
    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS cqc."Notifications"
      ADD CONSTRAINT "notifications_notificationType_fk" FOREIGN KEY ("notificationTypeUid")
      REFERENCES cqc."NotificationType" ("Id") MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION;
      `);

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
