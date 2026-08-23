'use strict';

const NurseFieldOfPracticeTable = { tableName: 'NurseFieldOfPractice', schema: 'cqc' };
const junctionTable = { tableName: 'WorkerNurseFieldsOfPractice', schema: 'cqc' };
const workerTable = { tableName: 'Worker', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        junctionTable,
        {
          WorkerID: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: workerTable,
              key: 'ID',
            },
          },
          NurseFieldOfPracticeID: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: NurseFieldOfPracticeTable,
              key: 'ID',
            },
          },
        },
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable(junctionTable, { transaction });
    });
  },
};
