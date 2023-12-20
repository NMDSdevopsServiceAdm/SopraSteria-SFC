'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `INSERT INTO cqc."TrainingCategories" ("ID", "Seq", "Category") VALUES
        (38, 284, 'Oliver McGowan Mandatory Training (elearning)'),
        (39, 285, 'Oliver McGowan Mandatory Training (Tier 1)'),
        (40, 286, 'Oliver McGowan Mandatory Training (Tier 2)');`,
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DELETE FROM cqc."TrainingCategories" WHERE "ID" IN (38, 39, 40);');
  },
};
