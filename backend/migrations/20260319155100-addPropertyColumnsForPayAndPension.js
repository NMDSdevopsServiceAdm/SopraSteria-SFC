'use strict';

const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };
const Sequelize = require('sequelize');

const mainColumnNames = [
  'PensionContribution',
  'PensionContributionPercentage',
  'StaffOptOutOfWorkplacePension',
  'OfferSleepIn',
  'HowToPayForSleepIn',
  'TravelTimePayOption',
  'TravelTimePayRate',
];

const buildSubColumns = (mainColumnName) => {
  const columnNameStem = mainColumnName;

  const suffixAndType = [
    ['SavedAt', Sequelize.DataTypes.DATE],
    ['ChangedAt', Sequelize.DataTypes.DATE],
    ['SavedBy', Sequelize.DataTypes.TEXT],
    ['ChangedBy', Sequelize.DataTypes.TEXT],
  ];

  const subColumns = suffixAndType.map(([suffix, dataType]) => {
    const subColumnName = columnNameStem + suffix;
    const properties = { type: dataType, allowNull: true };
    return [subColumnName, properties];
  });

  return subColumns;
};

const allColumns = mainColumnNames.flatMap((mainColumnName) => {
  const subColumns = buildSubColumns(mainColumnName);
  return [...subColumns];
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      const addColumns = allColumns.map(([columnName, properties]) => {
        return queryInterface.addColumn(establishmentTable, columnName, properties, { transaction });
      });

      return Promise.all(addColumns);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      const dropColumns = allColumns.map(([columnName, _prop]) => {
        return queryInterface.removeColumn(establishmentTable, columnName, { transaction });
      });

      return Promise.all(dropColumns);
    });
  },
};
