'use strict';

const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };
const travelTimePayOptionTable = { tableName: 'TravelTimePayOption', schema: 'cqc' };

const Sequelize = require('sequelize');

const newColumns = [
  [
    'PensionContributionPercentage',
    {
      type: Sequelize.DataTypes.DECIMAL(6, 3),
      allowNull: true,
    },
  ],
  [
    'StaffOptOutOfWorkplacePension',
    {
      type: Sequelize.DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', "Don't know"],
    },
  ],
  [
    'OfferSleepIn',
    {
      type: Sequelize.DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', "Don't know"],
    },
  ],
  [
    'HowToPayForSleepIn',
    {
      type: Sequelize.DataTypes.ENUM,
      allowNull: true,
      values: ['Hourly rate', 'Flat rate', 'I do not know'],
    },
  ],
  [
    'TravelTimePayOptionFK',
    {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: travelTimePayOptionTable,
        key: 'ID',
      },
    },
  ],
  [
    'TravelTimePayRate',
    {
      type: Sequelize.DataTypes.DECIMAL(9, 2), // same as actual DB type of worker table's AnnualHourlyPayRate
      allowNull: true,
    },
  ],
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      const addColumns = newColumns.map(([columnName, properties]) => {
        return queryInterface.addColumn(establishmentTable, columnName, properties, { transaction });
      });

      return Promise.all(addColumns);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      const dropColumns = newColumns.map(([columnName, _prop]) => {
        return queryInterface.removeColumn(establishmentTable, columnName, { transaction });
      });

      return Promise.all(dropColumns);
    });
  },
};
