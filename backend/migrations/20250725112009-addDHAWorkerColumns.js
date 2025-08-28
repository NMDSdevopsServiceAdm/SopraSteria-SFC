'use strict';

const table = {
  tableName: 'Worker',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'CarryOutDelegatedHealthcareActivitiesValue',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don't know"],
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CarryOutDelegatedHealthcareActivitiesSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CarryOutDelegatedHealthcareActivitiesChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CarryOutDelegatedHealthcareActivitiesSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CarryOutDelegatedHealthcareActivitiesChangedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'CarryOutDelegatedHealthcareActivitiesValue', { transaction }),
        queryInterface.removeColumn(table, 'CarryOutDelegatedHealthcareActivitiesSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'CarryOutDelegatedHealthcareActivitiesChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'CarryOutDelegatedHealthcareActivitiesSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'CarryOutDelegatedHealthcareActivitiesChangedBy', { transaction }),
      ]);
    });
  },
};
