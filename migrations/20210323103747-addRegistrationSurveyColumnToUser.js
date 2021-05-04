'use strict';

const table = {
  tableName: 'User',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        await Promise.all([
          queryInterface.addColumn(
            table,
            'RegistrationSurveyCompleted',
            {
              type: Sequelize.DataTypes.BOOLEAN,
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
    return queryInterface.removeColumn(table, 'RegistrationSurveyCompleted');
  },
};
