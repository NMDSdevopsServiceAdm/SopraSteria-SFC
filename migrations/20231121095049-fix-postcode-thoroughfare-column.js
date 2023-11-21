'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    queryInterface.sequelize.query(`
      ALTER TABLE cqcref."postcodes"
      ADD COLUMN IF NOT EXISTS "thoroughfare" VARCHAR(255)
    `);
  },
};
