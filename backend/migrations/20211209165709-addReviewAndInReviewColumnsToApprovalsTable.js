'use strict';

const table = {
  tableName: 'Approvals',
  schema: 'cqc',
};
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          table,
          'Reviewer',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'InReview',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false,
          },
          { transaction },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {
    await queryInterface.seqeulize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeColumn(table, 'Reviewer', { transaction }),
        queryInterface.removeColumn(table, 'InReview', { transaction }),
      ]);
    });
  },
};
