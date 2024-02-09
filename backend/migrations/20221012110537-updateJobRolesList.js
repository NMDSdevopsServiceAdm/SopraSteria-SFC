'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Activities worker, coordinator\' where "JobID"=1',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Administrative, office staff (non care-providing)\' where "JobID"=2',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Advice, guidance and advocacy\' where "JobID"=3',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Allied health professional (not occupational therapist)\' where "JobID"=4',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Ancillary staff (non care-providing)\' where "JobID"=5',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Any children\'\'s, young people\'\'s job role\' where "JobID"=6',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Assessment officer\' where "JobID"=7', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Care coordinator\' where "JobID"=8', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Care navigator\' where "JobID"=9', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Care worker\' where "JobID"=10', {
          transaction,
        }),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Community, support and outreach work\' where "JobID"=11',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Employment support\' where "JobID"=12', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'First-line manager\' where "JobID"=13', {
          transaction,
        }),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Managers and staff (care-related, but not care-providing)\' where "JobID"=14',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Middle management\' where "JobID"=15', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Nursing assistant\' where "JobID"=16', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Nursing associate\' where "JobID"=17', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Occupational therapist\' where "JobID"=18', {
          transaction,
        }),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Occupational therapist assistant\' where "JobID"=19',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Other (directly involved in providing care)\' where "JobID"=20',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Other (not directly involved in providing care)\' where "JobID"=21',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Safeguarding and reviewing officer\' where "JobID"=24',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Senior care worker\' where "JobID"=25', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Senior management\' where "JobID"=26', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Social worker\' where "JobID"=27', {
          transaction,
        }),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Activities worker or co-ordinator\' where "JobID"=1',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Administrative / office staff not care-providing\' where "JobID"=2',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Advice, Guidance and Advocacy\' where "JobID"=3',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Allied Health Professional (not Occupational Therapist)\' where "JobID"=4',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Ancillary staff not care-providing\' where "JobID"=5',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'"Any childrens / young people\'\'s job role"\' where "JobID"=6',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Assessment Officer\' where "JobID"=7', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Care Coordinator\' where "JobID"=8', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Care Navigator\' where "JobID"=9', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Care Worker\' where "JobID"=10', {
          transaction,
        }),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Community, Support and Outreach Work\' where "JobID"=11',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Employment Support\' where "JobID"=12', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'First Line Manager\' where "JobID"=13', {
          transaction,
        }),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Managers and staff care-related but not care-providing\' where "JobID"=14',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Middle Management\' where "JobID"=15', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Nursing Assistant\' where "JobID"=16', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Nursing Associate\' where "JobID"=17', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Occupational Therapist\' where "JobID"=18', {
          transaction,
        }),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Occupational Therapist Assistant\' where "JobID"=19',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Other job roles directly involved in providing care\' where "JobID"=20',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Other job roles not directly involved in providing care\' where "JobID"=21',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'update cqc."Job" set "JobName"=\'Safeguarding & Reviewing Officer\' where "JobID"=24',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Senior Care Worker\' where "JobID"=25', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Senior Management\' where "JobID"=26', {
          transaction,
        }),
        queryInterface.sequelize.query('update cqc."Job" set "JobName"=\'Social Worker\' where "JobID"=27', {
          transaction,
        }),
      ]);
    });
  },
};
