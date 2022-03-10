'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface.addColumn(
        table,
        'ExpiresSoonAlertDate',
        {
          type: Sequelize.DataTypes.ENUM,
          allowNull: false,
          defaultValue: '90',
          values: ['90', '60', '30'],
        },
        { transaction },
      );
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'ExpiresSoonAlertDate', { transaction }),
        queryInterface.sequelize.query(`DROP TYPE IF EXISTS cqc."enum_Establishment_ExpiresSoonAlertDate";`, {
          transaction,
        }),
      ]);
    });
  },
};
