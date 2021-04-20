'use strict';

const table = {
  tableName: 'Worker',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        await Promise.all([
          queryInterface.addColumn(
            table,
            'DateOfBirthEncryptedValue',
            {
              type: Sequelize.DataTypes.TEXT,
              allowNull: true,
            },
            { transaction },
          ),
          queryInterface.addColumn(
            table,
            'NationalInsuranceNumberEncryptedValue',
            {
              type: Sequelize.DataTypes.TEXT,
              allowNull: true,
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
      queryInterface.removeColumn(table, 'DateOfBirthEncryptedValue'),
      queryInterface.removeColumn(table, 'NationalInsuranceNumberEncryptedValue'),
    ]);
  },
};
