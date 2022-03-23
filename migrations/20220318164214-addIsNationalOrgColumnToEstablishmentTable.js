'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      return queryInterface.addColumn(
        table,
        'IsNationalOrg',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
        },
        { transaction },
      );
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(table, 'IsNationalOrg');
  },
};
