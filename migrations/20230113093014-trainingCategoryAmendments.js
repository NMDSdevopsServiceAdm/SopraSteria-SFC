'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Emergency aid awareness'
          WHERE "ID" = 14;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'First aid'
          WHERE "ID" = 18;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Health and safety'
          WHERE "ID" = 20;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Mental capacity and deprivation of liberty'
          WHERE "ID" = 25;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Palliative, end of life care'
          WHERE "ID" = 29;`,
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = '"Emergency Aid awareness"'
          WHERE "ID" = 14;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'First Aid'
          WHERE "ID" = 18;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Health and Safety'
          WHERE "ID" = 20;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Mental capacity and Deprivation of Liberty'
          WHERE "ID" = 25;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Palliative or end of life care'
          WHERE "ID" = 29;`,
          { transaction },
        ),
      ]);
    });
  },
};
