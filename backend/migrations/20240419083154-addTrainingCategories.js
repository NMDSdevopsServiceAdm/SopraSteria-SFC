'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `INSERT INTO cqc."TrainingCategories" ("ID", "Seq", "Category") VALUES
        (44, 0, 'Assisting and moving people'),
        (46, 0, 'Oral health'),
        (47, 0, 'Moving and handling objects'),
        (49, 0, 'Assisted digital and accessibility'),
        (50, 0, 'Digital leadership skills'),
        (51, 0, 'In-house systems and applications'),
        (52, 0, 'Online safety and security'),
        (53, 0, 'Social media and communications'),
        (54, 0, 'Working with digital technology');`,
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DELETE FROM cqc."TrainingCategories" WHERE "ID" IN (44, 46, 47, 49, 50, 51, 52, 53, 54);',
    );
  },
};
