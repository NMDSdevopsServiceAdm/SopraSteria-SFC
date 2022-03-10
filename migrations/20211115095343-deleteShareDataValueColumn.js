'use strict';

const establishmentTable = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.removeColumn(establishmentTable, 'ShareDataValue');
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(establishmentTable, 'ShareDataValue', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true,
    });
  },
};
