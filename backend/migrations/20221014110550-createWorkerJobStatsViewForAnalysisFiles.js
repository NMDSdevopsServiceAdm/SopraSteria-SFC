'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."WorkerJobStats"');
    await queryInterface.sequelize.query(
      `CREATE MATERIALIZED VIEW cqc."WorkerJobStats" AS (
        SELECT "EstablishmentJobs"."EstablishmentID",
        "EstablishmentJobs"."JobID",
        sum("EstablishmentJobs"."Total") FILTER (WHERE "EstablishmentJobs"."JobType" = 'Starters'::cqc.job_type) AS total_starters,
        sum("EstablishmentJobs"."Total") FILTER (WHERE "EstablishmentJobs"."JobType" = 'Leavers'::cqc.job_type) AS total_leavers,
        sum("EstablishmentJobs"."Total") FILTER (WHERE "EstablishmentJobs"."JobType" = 'Vacancies'::cqc.job_type) AS total_vacancies
       FROM cqc."EstablishmentJobs"
      GROUP BY "EstablishmentJobs"."EstablishmentID", ROLLUP("EstablishmentJobs"."JobID")
      );`,
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP MATERIALIZED VIEW "cqc"."WorkerJobStats"');
  },
};
