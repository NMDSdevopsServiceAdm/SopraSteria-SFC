'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      {
        tableName: 'Benchmarks',
        schema: 'cqc'
      },
      'Pay', {
        type: Sequelize.DataTypes.DECIMAL(5, 2),
        allowNull: true
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn({
      tableName: 'Benchmarks',
      schema: 'cqc'
    }, 'Pay', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    }, {
      schema: 'cqc'
    });
  }
};
