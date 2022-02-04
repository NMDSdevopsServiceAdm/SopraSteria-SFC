'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."EstablishmentLastLogin"');

    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW cqc."EstablishmentLastLogin" AS (
        SELECT e."EstablishmentID",
          e."NameValue",
          e."ParentID",
          e."IsParent",
          e."NmdsID",
          e."DataOwner",
          (
            SELECT u."FullNameValue"
              FROM cqc."User" u
              WHERE u."IsPrimary" = true AND (e."EstablishmentID" = u."EstablishmentID") AND u."Archived" = false
              LIMIT 1
          ) AS "PrimaryUserName"',
          (
            SELECT u."EmailValue",
              FROM cqc."User" u
              WHERE u."IsPrimary" = true AND (e."EstablishmentID" = u."EstablishmentID") AND u."Archived" = false
              LIMIT 1
          ) AS "PrimaryUserEmail",
          (
            SELECT MAX(ua."When")
              FROM cqc."User" u
              LEFT JOIN cqc."UserAudit" ua
              ON u."RegistrationID" = ua."UserFK"
              WHERE e."EstablishmentID" = u."EstablishmentID AND ua."EventType" = "loginSuccess"
              LIMIT 1
          ) AS "LastLogin"
          FROM cqc."Establishment" e
          WHERE e."Archived" = false
      );
    `);
  },

  down: (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW cqc."EstablishmentLastLogin"');
  },
};
