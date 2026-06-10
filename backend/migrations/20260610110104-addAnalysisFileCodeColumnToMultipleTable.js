'use strict';

const servicesTable = { tableName: 'services', schema: 'cqc' };
const trainingCategoriesTable = { tableName: 'TrainingCategories', schema: 'cqc' };
const cssrTable = { tableName: 'Cssr', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          servicesTable,
          'AnalysisFileCode',
          {
            type: Sequelize.DataTypes.INTEGER,
            unique: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          trainingCategoriesTable,
          'AnalysisFileCode',
          {
            type: Sequelize.DataTypes.INTEGER,
            unique: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          cssrTable,
          'AnalysisFileCode',
          {
            type: Sequelize.DataTypes.INTEGER,
            unique: true,
          },
          { transaction },
        ),
      ]);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(servicesTable, 'AnalysisFileCode', { transaction }),
        queryInterface.removeColumn(trainingCategoriesTable, 'AnalysisFileCode', { transaction }),
        queryInterface.removeColumn(cssrTable, 'AnalysisFileCode', { transaction }),
      ]);
    });
  },
};
