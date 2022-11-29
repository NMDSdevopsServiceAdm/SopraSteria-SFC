'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."WorkerQualificationStats"');
    await queryInterface.sequelize.query(
      `CREATE MATERIALIZED VIEW cqc."WorkerQualificationStats" AS (
        SELECT wt."WorkerFK",
        wt."QualificationsFK",
        wt."Year",
        count(*) AS total_quals
       FROM cqc."Worker" w
         JOIN cqc."WorkerQualifications" wt ON wt."WorkerFK" = w."ID"
      WHERE w."Archived" = false
      GROUP BY wt."WorkerFK", ROLLUP(wt."QualificationsFK", wt."Year")
      );`,
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP MATERIALIZED VIEW "cqc"."WorkerQualificationStats"');
  },
};
