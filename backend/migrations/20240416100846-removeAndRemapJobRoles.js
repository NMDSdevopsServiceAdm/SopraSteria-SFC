'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(`
          UPDATE cqc."Worker
          SET "MainJobFKValue" = 8
          WHERE "MainJobFKValue" = 9` ,
        {
          transaction,
        }),
        queryInterface.sequelize.query(`
          UPDATE cqc."Worker
          SET "MainJobFKValue" = 21
          WHERE "MainJobFKValue" = 29` ,
        {
          transaction,
        }),
        queryInterface.sequelize.query(`
          DELETE cqc."Job"
          WHERE "JobID" IN (9, 29)
        `)
      ]);
    });
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(`
          INSERT INTO cqc."Job" ("JobID", "JobName")
          VALUES (9, 'Care navigator'),
                 (29, 'Technician')
        `,
        {
          transaction,
        })
      ]);
    });
  }
};
