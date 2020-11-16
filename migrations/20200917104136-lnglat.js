'use strict';

const workerTable = { tableName: 'Worker', schema: 'cqc' };
const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all([
        queryInterface.addColumn(workerTable, 'Longitude', {
          type: Sequelize.DataTypes.DOUBLE,
          allowNull: true
        }, { transaction }),
        queryInterface.addColumn(workerTable, 'Latitude', {
          type: Sequelize.DataTypes.DOUBLE,
          allowNull: true
        }, { transaction }),
        queryInterface.addColumn(establishmentTable, 'Longitude', {
          type: Sequelize.DataTypes.DOUBLE,
          allowNull: true
        }, { transaction }),
        queryInterface.addColumn(establishmentTable, 'Latitude', {
          type: Sequelize.DataTypes.DOUBLE,
          allowNull: true
        }, { transaction })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all([
        queryInterface.removeColumn(workerTable, 'Longitude', { transaction }),
        queryInterface.removeColumn(workerTable, 'Latitude', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'Longitude', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'Latitude', { transaction }),
      ]);
    });
  }
};
