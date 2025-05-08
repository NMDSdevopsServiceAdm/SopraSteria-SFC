'use strict';
const models = require('../server/models/index');

const careWorkforcePathwayRoleCategories = [
  {
    ID: 1,
    Seq: 10,
    Title: 'New to care',
    Description: "Is in a care-providing role that's a start point for a career in social care",
    AnalysisFileCode: 1,
    BulkUploadCode: 1,
  },
  {
    ID: 2,
    Seq: 20,
    Title: 'Care or support worker',
    Description: "Is established in their role, they've consolidated their skills and experience",
    AnalysisFileCode: 2,
    BulkUploadCode: 2,
  },
  {
    ID: 3,
    Seq: 30,
    Title: 'Enhanced care worker',
    Description: 'Is delegated activities by regulated professionals or provides specialist support',
    AnalysisFileCode: 3,
    BulkUploadCode: 3,
  },
  {
    ID: 4,
    Seq: 40,
    Title: 'Supervisor or leader',
    Description: 'Might be a team leader with some staff management responsibilities',
    AnalysisFileCode: 4,
    BulkUploadCode: 4,
  },
  {
    ID: 5,
    Seq: 50,
    Title: 'Practice leader',
    Description: 'Has specialist skills and expertise in their field of care, but does not line manage',
    AnalysisFileCode: 5,
    BulkUploadCode: 5,
  },
  {
    ID: 6,
    Seq: 60,
    Title: 'Deputy manager',
    Description: 'Has people management responsibilities and helps to run the service',
    AnalysisFileCode: 6,
    BulkUploadCode: 6,
  },
  {
    ID: 7,
    Seq: 70,
    Title: 'Registered manager',
    Description: 'Is focussed on regulatory and legal requirements, and runs the service',
    AnalysisFileCode: 7,
    BulkUploadCode: 7,
  },
  { ID: 8, Seq: 80, Title: 'I do not know', Description: null, AnalysisFileCode: -2, BulkUploadCode: 999 },
  {
    ID: 9,
    Seq: 90,
    Title: 'None of the above',
    Description: 'Select this for admin, ancillary and other roles not yet included in the care workforce',
    AnalysisFileCode: 8,
    BulkUploadCode: 8,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'CareWorkforcePathwayRoleCategories',
        {
          ID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          Seq: {
            type: Sequelize.INTEGER,
            allowNull: false,
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
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
          },
          BulkUploadCode: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
          },
        },
        { schema: 'cqc', transaction },
      );

      for (const roleCategory of careWorkforcePathwayRoleCategories) {
        await models.careWorkforcePathwayRoleCategory.create(
          {
            id: roleCategory.ID,
            seq: roleCategory.Seq,
            title: roleCategory.Title,
            description: roleCategory.Description,
            analysisFileCode: roleCategory.AnalysisFileCode,
            bulkUploadCode: roleCategory.BulkUploadCode,
          },
          { transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable({
      tableName: 'CareWorkforcePathwayRoleCategories',
      schema: 'cqc',
    });
  },
};
