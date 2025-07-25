'use strict';

const jobRolesThatCannotDoDHA = [
  { JobID: 12, JobName: 'Employment support' },
  { JobID: 23, JobName: 'Registered nurse' },
  { JobID: 14, JobName: 'Manager (care-related, but not care-providing)' },
  { JobID: 2, JobName: 'Administrative' },
  { JobID: 5, JobName: 'Ancillary staff (non care-providing)' },
  { JobID: 21, JobName: 'Other (not directly involved in providing care)' },
  { JobID: 17, JobName: 'Nursing associate' },
  { JobID: 16, JobName: 'Nursing assistant' },
  { JobID: 31, JobName: 'Learning and development lead' },
  { JobID: 33, JobName: 'Data analyst' },
  { JobID: 34, JobName: 'Data governance manager' },
  { JobID: 35, JobName: 'IT and digital support' },
  { JobID: 36, JobName: 'IT manager' },
  { JobID: 37, JobName: 'IT service desk manager' },
  { JobID: 38, JobName: 'Software developer' },
];

const jobIdsToExclude = jobRolesThatCannotDoDHA.map((job) => job.JobID);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."Job"
      SET "CanDoDelegatedHealthcareActivities" = TRUE
      WHERE "JobID" NOT IN (${jobIdsToExclude.join(', ')})
    `);
  },

  async down(queryInterface) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."Job"
      SET "CanDoDelegatedHealthcareActivities" = NULL
      WHERE "JobID" NOT IN (${jobIdsToExclude.join(', ')})
    `);
  },
};
