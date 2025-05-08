'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
      { schema: 'cqc' },
    );

    await queryInterface.sequelize.query(
      `INSERT INTO cqc."CareWorkforcePathwayRoleCategories" VALUES
        (1, 10,'New to care', 'Is in a care-providing role that\'\'s a start point for a career in social care', 1, 1),
        (2, 20, 'Care or support worker', 'Is established in their role, they\'\'ve consolidated their skills and experience', 2, 2),
        (3, 30, 'Enhanced care worker', 'Is delegated activities by regulated professionals or provides specialist support', 3, 3),
        (4, 40, 'Supervisor or leader', 'Might be a team leader with some staff management responsibilities', 4, 4),
        (5, 50, 'Practice leader', 'Has specialist skills and expertise in their field of care, but does not line manage', 5, 5),
        (6, 60, 'Deputy manager', 'Has people management responsibilities and helps to run the service', 6, 6),
        (7, 70, 'Registered manager', 'Is focussed on regulatory and legal requirements, and runs the service', 7, 7),
        (8, 80, 'I do not know', null, -2, 999),
        (9, 90, 'None of the above', 'Select this for admin, ancillary and other roles not yet included in the care workforce', 8, 8);
      `,
    );

    return;
  },

  async down(queryInterface) {
    return queryInterface.dropTable({
      tableName: 'CareWorkforcePathwayRoleCategories',
      schema: 'cqc',
    });
  },
};
