'use strict';

/** @type {import('sequelize-cli').Migration} */

const dhaRows = [
  {
    ID: 1,
    Seq: 10,
    Title: 'Vital signs monitoring',
    Description: 'Like monitoring heart rate as part of treating a condition',
    AnalysisFileCode: 1,
    BulkUploadCode: 1,
  },
  {
    ID: 2,
    Seq: 20,
    Title: 'Specialised medication administration',
    Description: 'Like administering insulin injections',
    AnalysisFileCode: 2,
    BulkUploadCode: 2,
  },
  {
    ID: 3,
    Seq: 30,
    Title: 'Complex posture and mobility care',
    Description: 'Like support with prescribed exercise programmes',
    AnalysisFileCode: 3,
    BulkUploadCode: 3,
  },
  {
    ID: 4,
    Seq: 40,
    Title: 'Compromised skin integrity and wound care',
    Description: 'Like applying or replacing a dry dressing',
    AnalysisFileCode: 4,
    BulkUploadCode: 4,
  },
  {
    ID: 5,
    Seq: 50,
    Title: 'Airways and breathing care',
    Description: 'Like supplying prescribed oxygen through a mask',
    AnalysisFileCode: 5,
    BulkUploadCode: 5,
  },
  {
    ID: 6,
    Seq: 60,
    Title: 'Feeding and digestive care',
    Description: 'Like administering PEG feeds',
    AnalysisFileCode: 6,
    BulkUploadCode: 6,
  },
  {
    ID: 7,
    Seq: 70,
    Title: 'Bladder and bowel care',
    Description: 'Like emptying and changing a stoma bag',
    AnalysisFileCode: 7,
    BulkUploadCode: 7,
  },
  {
    ID: 8,
    Seq: 80,
    Title: 'Other delegated healthcare activity',
    Description: 'Something else delegated by a regulated healthcare professional',
    AnalysisFileCode: 8,
    BulkUploadCode: 998,
  },
];

const dhaOptionsAsSqlStatements = dhaRows.map((row) => {
  return `(${row.ID}, ${row.Seq}, '${row.Title}', '${row.Description}', ${row.AnalysisFileCode}, ${row.BulkUploadCode})`;
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'DelegatedHealthcareActivities',
      {
        ID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        Seq: {
          type: Sequelize.DataTypes.INTEGER,
          unique: true,
        },
        Title: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        Description: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        AnalysisFileCode: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          unique: true,
        },
        BulkUploadCode: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          unique: true,
        },
      },
      { schema: 'cqc' },
    );

    await queryInterface.sequelize.query(
      `INSERT INTO cqc."DelegatedHealthcareActivities" VALUES
        ${dhaOptionsAsSqlStatements.join(',\n ')};`,
    );
    return;
  },

  async down(queryInterface) {
    return queryInterface.dropTable({
      tableName: 'DelegatedHealthcareActivities',
      schema: 'cqc',
    });
  },
};
