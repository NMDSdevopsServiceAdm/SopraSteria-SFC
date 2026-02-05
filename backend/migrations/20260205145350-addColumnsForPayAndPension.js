'use strict';

const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };
const travelTimePayOptionTable = { tableName: 'TravelTimePayOptions', schema: 'cqc' };

const Sequelize = require('sequelize');

const mainColumns = [
  [
    'PensionContributionPercentageValue',
    {
      type: Sequelize.DataTypes.DECIMAL(6, 3),
      allowNull: true,
    },
  ],
  [
    'StaffOptOutOfWorkplacePensionValue',
    {
      type: Sequelize.DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', "Don't know"],
    },
  ],
  [
    'OfferSleepInValue',
    {
      type: Sequelize.DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', "Don't know"],
    },
  ],
  [
    'HowToPayForSleepInValue',
    {
      type: Sequelize.DataTypes.ENUM,
      allowNull: true,
      values: ['Hourly rate', 'Flat rate', 'I do not know'],
    },
  ],
  [
    'TravelTimePayOptionFKValue',
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
    'TravelTimePayRateValue',
    {
      type: Sequelize.DataTypes.DECIMAL(9, 2), // same as actual DB type of worker table's AnnualHourlyPayRate
      allowNull: true,
    },
  ],
];

const buildSubColumns = (mainColumnName) => {
  const columnNameStem = mainColumnName.slice(0, -5);

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

const allColumns = mainColumns.flatMap((mainColumn) => {
  const mainColumnName = mainColumn[0];
  const subColumns = buildSubColumns(mainColumnName);
  return [mainColumn, ...subColumns];
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
