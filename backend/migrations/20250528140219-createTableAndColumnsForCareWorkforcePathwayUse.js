'use strict';

const models = require('../server/models/index');

const cwpReasonsTable = { tableName: 'CareWorkforcePathwayReasons', schema: 'cqc' };
const junctionTable = { tableName: 'EstablishmentCWPReasons', schema: 'cqc' };
const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
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
          Text: {
            type: Sequelize.DataTypes.TEXT,
          },
          IsOther: {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false,
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

      const addColumnsToEstablishmentTable = [
        queryInterface.addColumn(
          establishmentTable,
          'CareWorkforcePathwayUseValue',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don't know"],
          },
          { transaction },
        ),
        ['SavedAt', 'ChangedAt'].map((suffix) => {
          return queryInterface.addColumn(
            establishmentTable,
            `CareWorkforcePathwayUse${suffix}`,
            {
              type: Sequelize.DataTypes.DATE,
              allowNull: true,
            },
            { transaction },
          );
        }),
        ['SavedBy', 'ChangedBy'].map((suffix) => {
          return queryInterface.addColumn(
            establishmentTable,
            `CareWorkforcePathwayUse${suffix}`,
            {
              type: Sequelize.DataTypes.TEXT,
              allowNull: true,
            },
            { transaction },
          );
        }),
      ];

      const addDataToReasonTable = reasonTableData.map((rowData) =>
        models.CareWorkforcePathwayReasons.create(rowData, { transaction }),
      );

      await Promise.all([createReasonTable, createJunctionTable, ...addColumnsToEstablishmentTable]);

      await Promise.all(addDataToReasonTable);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable(junctionTable, { transaction });
      await queryInterface.removeColumn(establishmentTable, 'CareWorkforcePathwayUseValue', { transaction });
      await queryInterface.removeColumn(establishmentTable, 'CareWorkforcePathwayUseSavedAt', { transaction });
      await queryInterface.removeColumn(establishmentTable, 'CareWorkforcePathwayUseChangedAt', { transaction });
      await queryInterface.removeColumn(establishmentTable, 'CareWorkforcePathwayUseSavedBy', { transaction });
      await queryInterface.removeColumn(establishmentTable, 'CareWorkforcePathwayUseChangedBy', { transaction });
      await queryInterface.dropTable(cwpReasonsTable, { transaction });
    });
  },
};

const reasonTableData = [
  { text: "To help define our organisation's values", id: 1, seq: 10, analysisFileCode: 1, bulkUploadCode: 1 },
  { text: 'To help update our job descriptions', id: 2, seq: 20, analysisFileCode: 2, bulkUploadCode: 2 },
  {
    text: 'To help update our HR and learning and development policies',
    id: 3,
    seq: 30,
    analysisFileCode: 3,
    bulkUploadCode: 3,
  },
  {
    text: 'To help identify skills and knowledge gaps in our staff',
    id: 4,
    seq: 40,
    analysisFileCode: 4,
    bulkUploadCode: 4,
  },
  {
    text: 'To help identify learning and development opportunities for our staff',
    id: 5,
    seq: 50,
    analysisFileCode: 5,
    bulkUploadCode: 5,
  },
  { text: 'To help set levels of pay', id: 6, seq: 60, analysisFileCode: 6, bulkUploadCode: 6 },
  {
    text: 'To help with advertising job roles and recruitment',
    id: 7,
    seq: 70,
    analysisFileCode: 7,
    bulkUploadCode: 7,
  },
  {
    text: 'To help demonstrate delivery and outcomes to commissioners and CQC',
    id: 8,
    seq: 80,
    analysisFileCode: 8,
    bulkUploadCode: 8,
  },
  { text: 'To help plan our future workforce', id: 9, seq: 90, analysisFileCode: 9, bulkUploadCode: 9 },
  { text: 'For something else', id: 10, seq: 100, analysisFileCode: 10, bulkUploadCode: 10, isOther: true },
];
