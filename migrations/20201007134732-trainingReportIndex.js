'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface.sequelize.query(`
CREATE UNIQUE INDEX CONCURRENTLY "MandatoryTraining_EstablishmentFKJobFK_Idx"
    ON cqc."MandatoryTraining"
    ("EstablishmentFK" ASC NULLS LAST, "JobFK" ASC NULLS LAST);

CREATE UNIQUE INDEX CONCURRENTLY "MandatoryTraining_EstablishmentFKJobFKTrainingCategoryFK_Idx"
    ON cqc."MandatoryTraining"
    ("EstablishmentFK" ASC NULLS LAST, "JobFK" ASC NULLS LAST, "TrainingCategoryFK" ASC NULLS LAST);

CREATE UNIQUE INDEX CONCURRENTLY "Establishment_EstablishmentUIDArchived_Idx"
    ON cqc."Establishment"
    ("EstablishmentUID" ASC NULLS LAST, "Archived" ASC NULLS LAST);
      `);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface.sequelize.query(`
DROP INDEX cqc."MandatoryTraining_EstablishmentFKJobFK_Idx";
DROP INDEX cqc."MandatoryTraining_EstablishmentFKJobFKTrainingCategoryFK_Idx";
DROP INDEX cqc."Establishment_EstablishmentUIDArchived_Idx";
      `);
    });
  },
};
