'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `INSERT INTO cqc."TrainingCategories" ("ID", "Seq", "Category") VALUES
        (41, 0, 'Oral health'),
        (42, 0, 'Moving and handling objects'),
        (43, 0, 'Assisted digital and accessibility'),
        (44, 0, 'Digital leadership skills'),
        (45, 0, 'In-house systems and applications'),
        (46, 0, 'Online safety and security'),
        (47, 0, 'Social media and communications'),
        (48, 0, 'Working with digital technology');`,
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DELETE FROM cqc."TrainingCategories" WHERE "ID" IN (41, 42, 43, 44, 45, 46, 47, 48);',
    );
  },
};
