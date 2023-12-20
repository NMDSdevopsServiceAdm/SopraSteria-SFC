'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      {
        tableName: 'Benchmarks',
        schema: 'cqc'
      },
      'Turnover', {
        type: Sequelize.DataTypes.DECIMAL(5, 2),
        allowNull: true
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn({
      tableName: 'Benchmarks',
      schema: 'cqc'
    }, 'Turnover', {
      type: Sequelize.DataTypes.DECIMAL(3, 2),
      allowNull: true
    }, {
      schema: 'cqc'
    });
  }
};
