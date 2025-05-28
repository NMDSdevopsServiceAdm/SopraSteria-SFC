'use strict';
const models = require('../server/models/index');

const careWorkforcePathwayRoleCategories = [
  {
    id: 1,
    seq: 10,
    title: 'New to care',
    description: "Is in a care-providing role that's a start point for\n a career in social care",
    analysisFileCode: 1,
    bulkUploadCode: 1,
  },
  {
    id: 2,
    seq: 20,
    title: 'Care or support worker',
    description: "Is established in their role, they've consolidated\n their skills and experience",
    analysisFileCode: 2,
    bulkUploadCode: 2,
  },
  {
    id: 3,
    seq: 30,
    title: 'Enhanced care worker',
    description: 'Is delegated activities by regulated professionals\n or provides specialist support',
    analysisFileCode: 3,
    bulkUploadCode: 3,
  },
  {
    id: 4,
    seq: 40,
    title: 'Supervisor or leader',
    description: 'Might be a team leader with some staff management\n responsibilities',
    analysisFileCode: 4,
    bulkUploadCode: 4,
  },
  {
    id: 5,
    seq: 50,
    title: 'Practice leader',
    description: 'Has specialist skills and expertise in their field of care,\n but does not line manage',
    analysisFileCode: 5,
    bulkUploadCode: 5,
  },
  {
    id: 6,
    seq: 60,
    title: 'Deputy manager',
    description: 'Has people management responsibilities and helps\n to run the service',
    analysisFileCode: 6,
    bulkUploadCode: 6,
  },
  {
    id: 7,
    seq: 70,
    title: 'Registered manager',
    description: 'Is focussed on regulatory and legal requirements,\n and runs the service',
    analysisFileCode: 7,
    bulkUploadCode: 7,
  },
  {
    id: 101,
    seq: 1010,
    title: 'I do not know',
    description: null,
    analysisFileCode: -2,
    bulkUploadCode: 999,
  },
  {
    id: 102,
    seq: 1020,
    title: 'None of the above',
    description: 'Select this for admin, ancillary and other roles not\n yet included in the care workforce pathway',
    analysisFileCode: 8,
    bulkUploadCode: 8,
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
        await models.careWorkforcePathwayRoleCategory.create(roleCategory, { transaction });
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
