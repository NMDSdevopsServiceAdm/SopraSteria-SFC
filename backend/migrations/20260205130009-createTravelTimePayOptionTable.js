'use strict';

const newTable = { tableName: 'TravelTimePayOption', schema: 'cqc' };

// AnalysisFileCode are yet to be confirmed at the timing of this file.
const data = [
  {
    id: 1,
    seq: 10,
    label: 'The same rate for travel time as for visits',
    includeRate: false,
    analysisFileCode: null,
    bulkUploadCode: 1,
  },
  {
    id: 2,
    seq: 20,
    label: 'Minimum wage',
    includeRate: false,
    analysisFileCode: null,
    bulkUploadCode: 2,
  },
  {
    id: 3,
    seq: 30,
    label: 'A different travel time rate',
    includeRate: true,
    analysisFileCode: null,
    bulkUploadCode: 3,
  },
  {
    id: 4,
    seq: 40,
    label: 'We pay for travel time in a different way',
    includeRate: false,
    analysisFileCode: null,
    bulkUploadCode: 4,
  },
  {
    id: 5,
    seq: 50,
    label: 'We do not pay for travel time between visits',
    includeRate: false,
    analysisFileCode: null,
    bulkUploadCode: 5,
  },
  {
    id: 6,
    seq: 60,
    label: 'Workers do not travel between visits',
    includeRate: false,
    analysisFileCode: null,
    bulkUploadCode: 6,
  },
  {
    id: 7,
    seq: 70,
    label: 'I do not know',
    includeRate: false,
    analysisFileCode: null,
    bulkUploadCode: 999,
  },
];

const dataSqlStatements = data.map((row) => {
  return `(${row.id}, ${row.seq}, '${row.label}', '${row.includeRate}', ${row.analysisFileCode}, ${row.bulkUploadCode})`;
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        newTable,
        {
          ID: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          Seq: {
            type: Sequelize.DataTypes.INTEGER,
            unique: true,
          },
          Label: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: false,
          },
          IncludeRate: {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
          },
          AnalysisFileCode: {
            type: Sequelize.DataTypes.INTEGER,
            unique: true,
          },
          BulkUploadCode: {
            type: Sequelize.DataTypes.INTEGER,
            unique: true,
          },
        },
        { transaction },
      );
      await queryInterface.sequelize.query(
        `INSERT INTO cqc."${newTable.tableName}" VALUES
        ${dataSqlStatements.join(',\n ')};`,
        { transaction },
      );
      return;
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable(newTable);
  },
};
