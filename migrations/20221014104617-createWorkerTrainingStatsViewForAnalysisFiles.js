'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."WorkerTrainingStats"');
    await queryInterface.sequelize.query(
      `CREATE MATERIALIZED VIEW cqc."WorkerTrainingStats" AS (
      SELECT wt."WorkerFK",
        wt."CategoryFK",
        count(*) AS total_training,
        count(*) FILTER (WHERE wt."Accredited" = 'Yes'::cqc."WorkerTrainingAccreditation") AS total_accredited_yes,
        count(*) FILTER (WHERE wt."Accredited" = 'No'::cqc."WorkerTrainingAccreditation") AS total_accredited_no,
        count(*) FILTER (WHERE wt."Accredited" = 'Don''t know'::cqc."WorkerTrainingAccreditation") AS total_accredited_unknown,
        to_char(max(wt."Completed")::timestamp with time zone, 'DD/MM/YYYY'::text) AS latest_training_date
      FROM cqc."Worker" w
      JOIN cqc."WorkerTraining" wt ON wt."WorkerFK" = w."ID"
      WHERE w."Archived" = false
      GROUP BY wt."WorkerFK", ROLLUP(wt."CategoryFK")
  );`,
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP MATERIALIZED VIEW "cqc"."WorkerTrainingStats"');
  },
};
