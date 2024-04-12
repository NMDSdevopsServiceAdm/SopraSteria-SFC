'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `INSERT INTO cqc."TrainingCategories" ("ID", "Seq", "Category") VALUES
        (44, 440, 'Assisting and moving people'),
        (46, 460, 'Oral health'),
        (47, 470, 'Moving and handling objects'),
        (49, 490, 'Assisted digital and accessibility (new)'),
        (50, 500, 'Digital leadership skills (new)'),
        (51, 510, 'In-house systems and applications'),
        (52, 520, 'Online safety and security'),
        (53, 530, 'Social media and communications'),
        (54, 540, 'Working with digital technology');`,
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DELETE FROM cqc."TrainingCategories" WHERE "ID" IN (44, 46, 47, 49, 50, 51, 52, 53, 54);',
    );
  },
};
