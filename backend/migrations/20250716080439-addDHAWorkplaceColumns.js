'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'StaffDoDelegatedHealthcareActivitiesValue',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don't know"],
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'StaffDoDelegatedHealthcareActivitiesSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'StaffDoDelegatedHealthcareActivitiesChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'StaffDoDelegatedHealthcareActivitiesSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'StaffDoDelegatedHealthcareActivitiesChangedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },
  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'StaffDoDelegatedHealthcareActivitiesValue', { transaction }),
        queryInterface.removeColumn(table, 'StaffDoDelegatedHealthcareActivitiesSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'StaffDoDelegatedHealthcareActivitiesChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'StaffDoDelegatedHealthcareActivitiesSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'StaffDoDelegatedHealthcareActivitiesChangedBy', { transaction }),
      ]);
    });
  },
};
