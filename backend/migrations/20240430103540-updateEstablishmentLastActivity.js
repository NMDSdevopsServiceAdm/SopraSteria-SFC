'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW cqc."EstablishmentLastActivityTemp" AS (
        SELECT e."EstablishmentID",
          e."NameValue",
          e."ParentID",
          e."IsParent",
          e."NmdsID",
          e."DataOwner",
          e."Address1",
          e."Town",
          e."County",
          e."PostCode",
          e."LocationID",
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
          GREATEST(e.updated, (
            SELECT w.updated
              FROM cqc."Worker" w
              WHERE w."EstablishmentFK" = e."EstablishmentID" AND w."Archived" = false
              ORDER BY w.updated DESC
              LIMIT 1
          )) AS "LastUpdated",
          (
            SELECT MAX(l."LastLoggedIn")
              FROM cqc."User" u
              LEFT JOIN cqc."Login" l
              ON u."RegistrationID" = l."RegistrationID"
              WHERE e."EstablishmentID" = u."EstablishmentID"
              LIMIT 1
          ) as "LastLogin",
          (
            SELECT p."NmdsID"
              FROM cqc."Establishment" p
              WHERE e."ParentID" = p."EstablishmentID"
          ) AS "ParentNmdsID"
          FROM cqc."Establishment" e
          WHERE e."Archived" = false
      );
    `);

    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."EstablishmentLastActivity"');

    await queryInterface.sequelize.query(
      'ALTER MATERIALIZED VIEW IF EXISTS cqc."EstablishmentLastActivityTemp" RENAME TO "EstablishmentLastActivity";',
    );

    await queryInterface.addIndex(
      {
        tableName: 'EstablishmentLastActivity',
        schema: 'cqc',
      },
      {
        fields: ['IsParent', 'PrimaryUserEmail', 'LastLogin', 'LastUpdated', 'DataOwner'],
      },
    );

    await queryInterface.addIndex(
      {
        tableName: 'EstablishmentLastActivity',
        schema: 'cqc',
      },
      {
        fields: ['IsParent', 'PrimaryUserEmail'],
      },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW cqc."EstablishmentLastActivityTemp" AS (
        SELECT e."EstablishmentID",
          e."NameValue",
          e."ParentID",
          e."IsParent",
          e."NmdsID",
          e."DataOwner",
          e."Address1",
          e."Town",
          e."County",
          e."PostCode",
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
          GREATEST(e.updated, (
            SELECT w.updated
              FROM cqc."Worker" w
              WHERE w."EstablishmentFK" = e."EstablishmentID" AND w."Archived" = false
              ORDER BY w.updated DESC
              LIMIT 1
          )) AS "LastUpdated",
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

    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."EstablishmentLastActivity"');

    await queryInterface.sequelize.query(
      'ALTER MATERIALIZED VIEW IF EXISTS cqc."EstablishmentLastActivityTemp" RENAME TO "EstablishmentLastActivity"',
    );

    await queryInterface.addIndex(
      {
        tableName: 'EstablishmentLastActivity',
        schema: 'cqc',
      },
      {
        fields: ['IsParent', 'PrimaryUserEmail', 'LastLogin', 'LastUpdated', 'DataOwner'],
      },
    );

    await queryInterface.addIndex(
      {
        tableName: 'EstablishmentLastActivity',
        schema: 'cqc',
      },
      {
        fields: ['IsParent', 'PrimaryUserEmail'],
      },
    );
  },
};
