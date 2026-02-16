'use strict';

const group1 = [18, 20];
const group2 = [7, 24, 25, 12, 23]
const notInGroup3 = group1.concat(group2).map((id) => id);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.sequelize.query(`
      UPDATE cqc."services"
      SET "PayAndPensionsGroup" = 1
      WHERE "id" IN (${group1.join(', ')});
    `),
      queryInterface.sequelize.query(`
      UPDATE cqc."services"
      SET "PayAndPensionsGroup" = 2
      WHERE "id" IN (${group2.join(', ')});
    `),
    queryInterface.sequelize.query(`
      UPDATE cqc."services"
      SET "PayAndPensionsGroup" = 3
      WHERE "id" NOT IN (${notInGroup3.join(', ')});
    `),
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."services"
      SET "PayAndPensionsGroup" = null;
    `);
  }
};
