'use strict';

const workplaceTable = {
  tableName: 'Establishment',
  schema: 'cqc',
};

const workerTable = {
  tableName: 'Worker',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        workplaceTable,
        'AdminOverrides',
        {
          type: Sequelize.DataTypes.JSONB,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        workerTable,
        'AdminOverrides',
        {
          type: Sequelize.DataTypes.JSONB,
          allowNull: true,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(workplaceTable, 'AdminOverrides', { transaction });
      await queryInterface.removeColumn(workerTable, 'AdminOverrides', { transaction });
    });
  },
};
