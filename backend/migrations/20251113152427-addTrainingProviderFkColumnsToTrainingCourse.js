'use strict';

/** @type {import('sequelize-cli').Migration} */

const table = { tableName: 'TrainingCourse', schema: 'cqc' };

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      const addFkColumn = queryInterface.addColumn(
        table,
        'TrainingProviderFK',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: {
              tableName: 'TrainingProvider',
              schema: 'cqc',
            },
            key: 'ID',
          },
        },
        { transaction },
      );

      const addOtherNameColumn = queryInterface.addColumn(
        table,
        'OtherTrainingProviderName',
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction },
      );

      const removeOldColumn = queryInterface.removeColumn(table, 'ExternalProviderName', { transaction });

      return Promise.all([addFkColumn, addOtherNameColumn, removeOldColumn]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize
      .transaction((transaction) => {
        return Promise.all([
          queryInterface.removeColumn(table, 'TrainingProviderFK', { transaction }),
          queryInterface.removeColumn(table, 'OtherTrainingProviderName', { transaction }),
          queryInterface.addColumn(
            table,
            'ExternalProviderName',
            {
              type: Sequelize.DataTypes.TEXT,
              allowNull: true,
            },
            { transaction },
          ),
        ]);
      })
      .catch((err) => console.error(err));
  },
};
