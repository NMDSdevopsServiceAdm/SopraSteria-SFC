'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
       );
    `);

    await queryInterface.addIndex({
      tableName: 'EmailCampaignHistories',
      schema: 'cqc',
    },
    {
      fields: ['establishmentID', 'createdAt'],
    });

    await queryInterface.addIndex({
      tableName: 'EmailCampaigns',
      schema: 'cqc',
    },
    {
      fields: ['type', 'id'],
    });

    await queryInterface.addIndex({
      tableName: 'LastUpdatedEstablishments',
      schema: 'cqc',
    },
    {
      fields: ['ParentID', 'IsParent', 'LastUpdated'],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`DROP INDEX cqc."email_campaign_histories_establishment_i_d_created_at"`);
    await queryInterface.sequelize.query(`DROP INDEX cqc."email_campaigns_type_id"`);

    return queryInterface.sequelize.query(`DROP MATERIALIZED VIEW "cqc"."LastUpdatedEstablishments"`);
  }
};
