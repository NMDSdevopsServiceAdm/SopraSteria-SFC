'use strict';

const newTable = { tableName: 'NurseFieldOfPractice', schema: 'cqc' };

const data = [
  {
    id: 1,
    seq: 10,
    label: 'Adult nursing',
    old_enum: 'Adult Nurse',
    analysisFileCode: 1,
    bulkUploadCode: 1,
  },
  {
    id: 2,
    seq: 20,
    label: 'Mental health nursing',
    old_enum: 'Mental Health Nurse',
    analysisFileCode: 2,
    bulkUploadCode: 2,
  },
  {
    id: 3,
    seq: 30,
    label: 'Learning disabilities nursing',
    old_enum: 'Learning Disabilities Nurse',
    analysisFileCode: 3,
    bulkUploadCode: 3,
  },
  {
    id: 4,
    seq: 40,
    label: "Children's nursing",
    old_enum: "Children's Nurse",
    analysisFileCode: 4,
    bulkUploadCode: 4,
  },
  // the 5th enum "Enrolled Nurse" is not in the new schema, and will be dropped during migration.
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dataSqlStatements = data.map((row) => {
      return `(${row.id}, ${row.seq}, ${queryInterface.sequelize.escape(row.label)}, ${queryInterface.sequelize.escape(row.old_enum)}, ${row.analysisFileCode}, ${row.bulkUploadCode})`;
    });

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
          OldEnum: {
            type: Sequelize.DataTypes.TEXT,
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
