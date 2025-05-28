'use strict';

const models = require('../server/models/index');

const cwpReasonsTable = { tableName: 'CareWorkforcePathwayReasons', schema: 'cqc' };
const junctionTable = { tableName: 'EstablishmentCWPReason', schema: 'cqc' };
const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      const createReasonTable = queryInterface.createTable(
        cwpReasonsTable,
        {
          ID: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
          },
          Seq: {
            type: Sequelize.DataTypes.INTEGER,
            unique: true,
          },
          Reason: {
            type: Sequelize.DataTypes.TEXT,
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

      const createJunctionTable = queryInterface.createTable(
        junctionTable,
        {
          EstablishmentID: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: establishmentTable,
              key: 'EstablishmentID',
            },
          },
          CareWorkforcePathwayReasonID: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: cwpReasonsTable,
              key: 'ID',
            },
          },
          Other: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
        },
        { transaction },
      );

      const addColumnToEstablishmentTable = queryInterface.addColumn(
        establishmentTable,
        'CareWorkforcePathwayUse',
        {
          type: Sequelize.DataTypes.ENUM,
          allowNull: true,
          values: ['Yes', 'No', "Don't know"],
        },
        { transaction },
      );

      const addDataToReasonTable = reasonTableData.map((rowData) =>
        models.CareWorkforcePathwayReasons.create(rowData, { transaction }),
      );

      return Promise.all([
        createReasonTable,
        createJunctionTable,
        addColumnToEstablishmentTable,
        ...addDataToReasonTable,
      ]);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable(junctionTable, { transaction });
      await queryInterface.removeColumn(establishmentTable, 'CareWorkforcePathwayUse', { transaction });
      await queryInterface.dropTable(cwpReasonsTable, { transaction });
    });
  },
};

const reasonTableData = [
  { reason: "To help define our organisation's values", id: 1, seq: 10, analysisFileCode: 1, bulkUploadCode: 1 },
  { reason: 'To help update our job descriptions', id: 2, seq: 20, analysisFileCode: 2, bulkUploadCode: 2 },
  {
    reason: 'To help update our HR and learning and development policies',
    id: 3,
    seq: 30,
    analysisFileCode: 3,
    bulkUploadCode: 3,
  },
  {
    reason: 'To help identify skills and knowledge gaps in our staff',
    id: 4,
    seq: 40,
    analysisFileCode: 4,
    bulkUploadCode: 4,
  },
  {
    reason: 'To help identify learning and development opportunities for our staff',
    id: 5,
    seq: 50,
    analysisFileCode: 5,
    bulkUploadCode: 5,
  },
  { reason: 'To help set levels of pay', id: 6, seq: 60, analysisFileCode: 6, bulkUploadCode: 6 },
  {
    reason: 'To help with advertising job roles and recruitment',
    id: 7,
    seq: 70,
    analysisFileCode: 7,
    bulkUploadCode: 7,
  },
  {
    reason: 'To help demonstrate delivery and outcomes to commissioners and CQC',
    id: 8,
    seq: 80,
    analysisFileCode: 8,
    bulkUploadCode: 8,
  },
  { reason: 'To help plan our future workforce', id: 9, seq: 90, analysisFileCode: 9, bulkUploadCode: 9 },
  { reason: 'For something else', id: 10, seq: 100, analysisFileCode: 10, bulkUploadCode: 10 },
];
