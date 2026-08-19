'use strict';

const NurseFieldOfPracticeTable = { tableName: 'NurseFieldOfPractice', schema: 'cqc' };
const junctionTable = { tableName: 'WorkerNurseFieldsOfPractice', schema: 'cqc' };
const workerTable = { tableName: 'Worker', schema: 'cqc' };

const oldAndNewColumnPairs = [
  ['RegisteredNurseSavedAt', 'NurseFieldOfPracticeSavedAt'],
  ['RegisteredNurseChangedAt', 'NurseFieldOfPracticeChangedAt'],
  ['RegisteredNurseSavedBy', 'NurseFieldOfPracticeSavedBy'],
  ['RegisteredNurseChangedBy', 'NurseFieldOfPracticeChangedBy'],
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const copyDataToJunctionTable = `
    INSERT INTO cqc."WorkerNurseFieldsOfPractice" ("WorkerID", "NurseFieldOfPracticeID")
      (
        SELECT
          w."ID" as worker_id,
          nurse_fields."ID" as nurse_field_id
        FROM
          cqc."Worker" w
          JOIN cqc."NurseFieldOfPractice" as nurse_fields
          ON w."RegisteredNurseValue"::text = nurse_fields."OldEnum"
     );`;

    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(copyDataToJunctionTable, { transaction });

      // rename savedAt and changedAt columns
      for (const [oldColumn, newColumn] of oldAndNewColumnPairs) {
        await queryInterface.renameColumn(workerTable, oldColumn, newColumn, { transaction });
      }
      return;
    });
  },

  async down(queryInterface) {
    const clearJunctionTable = 'TRUNCATE cqc."WorkerNurseFieldsOfPractice";';

    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(clearJunctionTable, { transaction });

      for (const [oldColumn, newColumn] of oldAndNewColumnPairs) {
        await queryInterface.renameColumn(workerTable, newColumn, oldColumn, { transaction });
      }
      return;
    });
  },
};
