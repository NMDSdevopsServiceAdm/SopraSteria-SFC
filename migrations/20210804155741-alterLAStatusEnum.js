'use strict';

const table = {
  tableName: 'LocalAuthorities',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .removeColumn(table, 'Status')
      .then(() => {
        return queryInterface.sequelize.query('DROP TYPE IF EXISTS cqc."enum_LocalAuthorities_Status";');
      })
      .then(() => {
        return queryInterface.addColumn(table, 'Status', {
          type: Sequelize.DataTypes.ENUM,
          defaultValue: 'Not updated',
          values: [
            'Not updated',
            'Update, complete',
            'Update, not complete',
            'Confirmed, not complete',
            'Confirmed, complete',
          ],
        });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .removeColumn(table, 'Status')
      .then(() => {
        return queryInterface.sequelize.query('DROP TYPE IF EXISTS cqc."enum_LocalAuthorities_Status";');
      })
      .then(() => {
        return queryInterface.addColumn(table, 'Status', {
          type: Sequelize.DataTypes.ENUM,
          defaultValue: 'Not Updated',
          values: ['Not Updated', 'Updated'],
        });
      });
  },
};
