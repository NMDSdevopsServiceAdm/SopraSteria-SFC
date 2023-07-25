'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (30, \'Deputy manager\')', {
          transaction,
        }),
        queryInterface.sequelize.query(
          'insert into cqc."Job" ("JobID", "JobName") values (31, \'Learning and development lead\')',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('insert into cqc."Job" ("JobID", "JobName") values (32, \'Team leader\')', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Registered manager\' where "JobID"=22', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Registered nurse\' where "JobID"=23', {
          transaction,
        }),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('delete from cqc."Job" ("JobID", "JobName") where "JobID" IN (30, 31, 32)', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Registered Manager\' where "JobID"=22', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Registered Nurse\' where "JobID"=23', {
          transaction,
        }),
      ]);
    });
  },
};
