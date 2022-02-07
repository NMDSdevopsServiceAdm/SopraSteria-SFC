'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
          ) AS "PrimaryUserName",
          (
            SELECT u."EmailValue"
              FROM cqc."User" u
              WHERE u."IsPrimary" = true AND (e."EstablishmentID" = u."EstablishmentID") AND u."Archived" = false
              LIMIT 1
          ) AS "PrimaryUserEmail",
          (
            SELECT MAX(l."LastLoggedIn")
              FROM cqc."User" u
              LEFT JOIN cqc."Login" l
              ON u."RegistrationID" = l."RegistrationID"
              WHERE e."EstablishmentID" = u."EstablishmentID"
              LIMIT 1
          ) as "LastLogin"
          FROM cqc."Establishment" e
          WHERE e."Archived" = false
      );
    `);

    await queryInterface.addIndex(
      {
        tableName: 'EstablishmentLastLogin',
        schema: 'cqc',
      },
      {
        fields: ['IsParent', 'PrimaryUserEmail', 'LastLogin', 'DataOwner'],
      },
    );

    await queryInterface.addIndex(
      {
        tableName: 'EstablishmentLastLogin',
        schema: 'cqc',
      },
      {
        fields: ['IsParent', 'PrimaryUserEmail'],
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW cqc."EstablishmentLastLogin"');
  },
};
