'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return Promise.all([
      queryInterface.sequelize.query(`
      UPDATE cqc."DelegatedHealthcareActivities"
      SET "BulkUploadCode" = 8
      WHERE "ID" = 8;
    `),
    ]);
  },

  async down (queryInterface) {
        return Promise.all([
      queryInterface.sequelize.query(`
        UPDATE cqc."DelegatedHealthcareActivities"
        SET "BulkUploadCode" = 998
        WHERE "ID" = 8;
      `),
    ]);
  }
};
