'use strict';

const establishmentTable = {
  tableName: 'Establishment',
  schema: 'cqc',
};

const workerTable = {
  tableName: 'Worker',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeColumn(establishmentTable, 'Longitude', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'Latitude', { transaction }),
        queryInterface.removeColumn(workerTable, 'Longitude', { transaction }),
        queryInterface.removeColumn(workerTable, 'Latitude', { transaction }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          establishmentTable,
          'Longitude',
          {
            type: Sequelize.DataTypes.DOUBLE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          establishmentTable,
          'Latitude',
          {
            type: Sequelize.DataTypes.DOUBLE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          workerTable,
          'Longitude',
          {
            type: Sequelize.DataTypes.DOUBLE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          workerTable,
          'Latitude',
          {
            type: Sequelize.DataTypes.DOUBLE,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },
};
