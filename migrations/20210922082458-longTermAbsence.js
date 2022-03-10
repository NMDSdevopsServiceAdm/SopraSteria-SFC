'use strict';

const table = {
  tableName: 'Worker',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface.addColumn(
          table,
          'LongTermAbsence',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: [
              'Maternity leave',
              'Paternity leave',
              'Illness',
              'Injury',
              'Other',
            ],
          },
          { transaction },
        );
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'LongTermAbsence', { transaction }),
        queryInterface.sequelize.query(`DROP TYPE IF EXISTS cqc."enum_Worker_LongTermAbsence";`, { transaction }),
      ]);
    });
  },
};
