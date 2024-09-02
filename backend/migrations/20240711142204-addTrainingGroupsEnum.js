'use strict';

const table = { tableName: 'TrainingCategories', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      queryInterface.addColumn(table, 'TrainingCategoryGroup', {
        type: Sequelize.DataTypes.ENUM,
        values: [
          'Care skills and knowledge',
          'Health and safety in the workplace',
          'IT, digital and data in the workplace',
          'Specific conditions and disabilities',
          'Staff development',
        ],
        transaction
      });
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      queryInterface.removeColumn(table, 'TrainingCategoryGroup', {transaction});
    })
  }
};
