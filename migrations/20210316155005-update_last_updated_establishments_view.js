'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW cqc."LastUpdatedEstablishments"');

    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW cqc."LastUpdatedEstablishments" AS (
        SELECT e."EstablishmentID",
           e."NameValue",
           e."ParentID",
           e."IsParent",
           e."NmdsID",
           e."DataOwner",
           ( SELECT u."FullNameValue"
                  FROM cqc."User" u
                 WHERE u."IsPrimary" = true AND (e."EstablishmentID" = u."EstablishmentID" OR u."EstablishmentID" = e."ParentID") AND u."Archived" = false
                LIMIT 1) AS "PrimaryUserName",
           ( SELECT u."EmailValue"
                  FROM cqc."User" u
                 WHERE u."IsPrimary" = true AND (e."EstablishmentID" = u."EstablishmentID" OR u."EstablishmentID" = e."ParentID") AND u."Archived" = false
                LIMIT 1) AS "PrimaryUserEmail",
           GREATEST(e.updated, ( SELECT w.updated
                  FROM cqc."Worker" w
                 WHERE w."EstablishmentFK" = e."EstablishmentID" AND w."Archived" = false
                 ORDER BY w.updated DESC
                LIMIT 1)) AS "LastUpdated"
          FROM cqc."Establishment" e
          WHERE e."Archived" = false
       );
    `);

    await queryInterface.addIndex({
      tableName: 'LastUpdatedEstablishments',
      schema: 'cqc',
    },
    {
      fields: ['ParentID', 'IsParent', 'LastUpdated'],
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP MATERIALIZED VIEW "cqc"."LastUpdatedEstablishments"');
  }
};
