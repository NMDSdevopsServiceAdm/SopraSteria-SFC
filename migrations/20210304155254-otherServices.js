'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        await Promise.all([
          queryInterface.addColumn(
            table,
            'OtherServicesValue',
            {
              type: Sequelize.DataTypes.ENUM,
              allowNull: true,
              values: ['Yes', 'No'],
            },
            { transaction },
          ),
        ]);

        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn(table, 'OtherServicesValue'),
      await queryInterface.sequelize.query('DROP TYPE cqc."enum_Establishment_OtherServicesValue";'),
    ]);
  },
};
