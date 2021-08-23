'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `INSERT INTO cqc."Qualifications" VALUES
          (136, 685, 'Degree', 'Health and Social Care degree', 144, null, null, 6, false, false, 'QL144ACHQ6');`
    );
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.query(
      `DELETE FROM cqc."Qualifications" WHERE "ID"=136;`
    );
  },
};
