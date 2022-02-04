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
              FROM cqc."UserAudit" ua
              WHERE ua."Username" =  u."Username" AND ua."EventType" = "loginSuccess"
              LIMIT 1
          ) AS "LastLogin"
      );
    `);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  },
};
