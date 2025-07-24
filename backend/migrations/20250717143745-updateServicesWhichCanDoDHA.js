'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."services"
      SET "CanDoDelegatedHealthcareActivities" = TRUE
      WHERE "id" NOT IN (11, 1, 5, 16, 36);
    `);
  },

  async down(queryInterface) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."services"
      SET "CanDoDelegatedHealthcareActivities" = null;
    `);
  },
};
