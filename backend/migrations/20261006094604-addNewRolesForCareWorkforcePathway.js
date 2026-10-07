'use strict';

const Group = {
  CareProviding: 'Care Providing',
  SeniorLeadership: 'Senior leadership',
  NonCareProviding: 'Non-care providing',
  Others: 'others',
};

const table = {
  tableName: 'CareWorkforcePathwayRoleCategories',
  schema: 'cqc',
};

const existingRoleCategories = [
  {
    id: 1,
    seq: 10,
    title: 'New to care',
    oldDescription: "Is in a care-providing role that's a start point for a&nbsp;career&nbsp;in&nbsp;social&nbsp;care",
    newDescription: 'Usually less than 12 months into their first care role, building core skills',
    group: Group.CareProviding,
  },
  {
    id: 2,
    seq: 20,
    title: 'Care or support worker',
    oldDescription: "Is established in their role, they've consolidated their&nbsp;skills&nbsp;and&nbsp;experience",
    newDescription: "Is established in their role, they've consolidated their skills and&nbsp;experience",
    group: Group.CareProviding,
  },
  {
    id: 3,
    seq: 30,
    title: 'Enhanced care worker',
    oldDescription: 'Is delegated activities by regulated professionals or&nbsp;provides&nbsp;specialist&nbsp;support',
    newDescription: "Delivers 'delegated healthcare activities' or specialist support but does&nbsp;not&nbsp;supervise",
    group: Group.CareProviding,
  },
  {
    id: 5,
    seq: 50,
    newSeq: 41,
    title: 'Practice leader',
    oldDescription:
      'Has&nbsp;specialist&nbsp;skills&nbsp;and&nbsp;expertise&nbsp;in&nbsp;their&nbsp;field&nbsp;of&nbsp;care, but&nbsp;does&nbsp;not&nbsp;line&nbsp;manage',
    newDescription: 'Leads a care specialism and shares knowledge, but does not line manage',
    group: Group.CareProviding,
  },
  {
    id: 4,
    seq: 40,
    newSeq: 51,
    title: 'Supervisor or leader',
    oldDescription: 'Might be a team leader with some staff management responsibilities',
    newDescription: 'Might be a team leader with some staff management responsibilities',
    group: Group.CareProviding,
  },

  {
    id: 6,
    seq: 60,
    title: 'Deputy manager',
    oldDescription: 'Has people management responsibilities and helps to&nbsp;run&nbsp;the&nbsp;service',
    newDescription: 'Has people management responsibilities and helps to run the service',
    group: Group.SeniorLeadership,
  },
  {
    id: 7,
    seq: 70,
    title: 'Registered manager',
    oldDescription: 'Is focussed on regulatory and legal requirements, and&nbsp;runs&nbsp;the&nbsp;service',
    newDescription: 'Is focused on regulatory and legal requirements, and runs the service',
    group: Group.SeniorLeadership,
  },
  {
    id: 101,
    seq: 1010,
    title: 'I do not know',
    oldDescription: null,
    newDescription: null,
    group: Group.Others,
  },
  {
    id: 102,
    seq: 1020,
    title: 'None of the above',
    newTitle: 'None of these categories',
    oldDescription:
      'Select this for admin, ancillary and other roles not yet&nbsp;included&nbsp;in&nbsp;the&nbsp;care&nbsp;workforce&nbsp;pathway',
    newDescription: null,
    group: Group.Others,
  },
];

const newRoleCategories = [
  {
    id: 8,
    seq: 80,
    title: 'Corporate management',
    description: 'Middle or senior managers who ensure the business runs efficiently and effectively',
    group: Group.SeniorLeadership,

    // NOTE: analysisFileCode and bulkUploadCode are not confirmed yet. may need to change later
    analysisFileCode: 9,
    bulkUploadCode: 9,
  },

  {
    id: 9,
    seq: 90,
    title: 'Activity co-ordinator',
    description: 'Plans social or therapeutic activities but does not deliver personal care',
    group: Group.NonCareProviding,
    analysisFileCode: 10,
    bulkUploadCode: 10,
  },

  {
    id: 10,
    seq: 100,
    title: 'Administration',
    description: 'Includes administration staff, supervisors and managers',
    group: Group.NonCareProviding,
    analysisFileCode: 11,
    bulkUploadCode: 11,
  },
  {
    id: 11,
    seq: 110,
    title: 'Care technologist',
    description: 'Identifies, installs, and supports technology for care recipients',
    group: Group.NonCareProviding,
    analysisFileCode: 12,
    bulkUploadCode: 12,
  },
  {
    id: 12,
    seq: 120,
    title: 'Catering',
    description: 'Includes catering staff, supervisors and managers',
    group: Group.NonCareProviding,
    analysisFileCode: 13,
    bulkUploadCode: 13,
  },
  {
    id: 13,
    seq: 130,
    title: 'Domestic',
    description: 'Includes domestic staff, supervisors and managers',
    group: Group.NonCareProviding,
    analysisFileCode: 14,
    bulkUploadCode: 14,
  },
  {
    id: 14,
    seq: 140,
    title: 'Learning and development practitioner',
    description: 'Supports workforce learning and promotes professional development',
    group: Group.NonCareProviding,
    analysisFileCode: 15,
    bulkUploadCode: 15,
  },
  {
    id: 15,
    seq: 150,
    title: 'Maintenance',
    description: 'Includes maintenance staff, supervisors and managers',
    group: Group.NonCareProviding,
    analysisFileCode: 16,
    bulkUploadCode: 16,
  },
  {
    id: 16,
    seq: 160,
    title: 'Quality assurance lead',
    description: 'Monitors, reviews and strengthens quality of care',
    group: Group.NonCareProviding,
    analysisFileCode: 17,
    bulkUploadCode: 17,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        table,
        'Group',
        {
          type: Sequelize.DataTypes.ENUM,
          allowNull: true,
          values: Object.values(Group),
        },
        { transaction },
      );

      for (const data of existingRoleCategories) {
        const { id, group } = data;
        const seq = data?.newSeq ?? data.seq;
        const description = data.newDescription;
        const title = data?.newTitle ?? data.title;
        const replacements = { id, title, group, seq, description };

        const update = `UPDATE cqc."CareWorkforcePathwayRoleCategories"
          SET
            "Seq" = :seq,
            "Title" = :title,
            "Description" = :description,
            "Group" = :group
          WHERE "ID" = :id;`;
        await queryInterface.sequelize.query(update, { replacements, transaction });
      }

      for (const data of newRoleCategories) {
        const insertNewRole = `INSERT INTO cqc."CareWorkforcePathwayRoleCategories"
        ("ID", "Seq", "Title", "Description", "Group", "AnalysisFileCode", "BulkUploadCode")
            VALUES
        (:id, :seq, :title, :description, :group, :analysisFileCode, :bulkUploadCode)`;

        await queryInterface.sequelize.query(insertNewRole, { replacements: data, transaction });
      }
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const data of existingRoleCategories) {
        const { id, title, group } = data;
        const seq = data.seq;
        const description = data.oldDescription;
        const replacements = { id, title, group, seq, description };

        const revertUpdate = `UPDATE cqc."CareWorkforcePathwayRoleCategories"
          SET
            "Seq" = :seq,
            "Title" = :title,
            "Description" = :description,
            "Group" = :group
          WHERE "ID" = :id;`;
        await queryInterface.sequelize.query(revertUpdate, { replacements, transaction });
      }

      const ids = newRoleCategories.map((role) => role.id).join(', ');
      const deleteNewRoles = `DELETE FROM cqc."CareWorkforcePathwayRoleCategories"
        WHERE "ID" IN (${ids});
      `;

      await queryInterface.sequelize.query(deleteNewRoles, { transaction });

      await queryInterface.removeColumn(table, 'Group', { transaction });
    });
  },
};
