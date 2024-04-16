'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (33, \'Data analyst\')', {
          transaction,
        }),
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (34, \'Data governance manager\')',{
          transaction,
        }),
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (35, \'IT and digital support\')', {
          transaction,
        }),
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (36, \'IT Manager\')', {
          transaction,
        }),
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (37, \'IT service desk manager\')', {
          transaction,
        }),
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (38, \'Software developer\')', {
          transaction,
        }),
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (39, \'Support worker\')', {
          transaction,
        }),
      ]);
    });
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('delete from cqc."Job" where "JobID" IN (33, 34, 35, 36, 37, 38, 39)', {
          transaction,
        }),
      ]);
    });
  },
};
