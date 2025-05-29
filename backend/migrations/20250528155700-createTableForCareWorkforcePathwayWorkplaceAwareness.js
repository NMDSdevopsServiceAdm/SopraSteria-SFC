'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'CareWorkforcePathwayWorkplaceAwareness',
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
      `INSERT INTO cqc."CareWorkforcePathwayWorkplaceAwareness" VALUES
        (1, 10, 'Aware of how the care workforce pathway works in practice', 1, 1),
        (2, 20, 'Aware of the aims of the care workforce pathway', 2, 2),
        (3, 30, 'Aware of the term \'\'care workforce pathway\'\'', 3, 3),
        (4, 40, 'Not aware of the care workforce pathway', 0, 4),
        (5, 50, 'I do not know how aware our workplace is', -2, 999)
      `
    )
    return
  },

  async down(queryInterface){
    return queryInterface.dropTable({
      tableName: 'CareWorkforcePathwayWorkplaceAwareness',
      schema: 'cqc',
    });
  }
};

