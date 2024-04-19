'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `INSERT INTO cqc."TrainingCategories" ("ID", "Seq", "Category") VALUES
        (41, 0, 'Assisting and moving people'),
        (42, 0, 'Oral health'),
        (43, 0, 'Moving and handling objects'),
        (44, 0, 'Assisted digital and accessibility'),
        (45, 0, 'Digital leadership skills'),
        (46, 0, 'In-house systems and applications'),
        (47, 0, 'Online safety and security'),
        (48, 0, 'Social media and communications'),
        (49, 0, 'Working with digital technology');`,
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DELETE FROM cqc."TrainingCategories" WHERE "ID" IN (41, 42, 43, 44, 45, 46, 47, 48, 49);',
    );
  },
};
