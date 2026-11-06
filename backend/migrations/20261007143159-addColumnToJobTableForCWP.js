'use strict';

const jobRolesExcludedFromCWP = [
  { JobID: 4, JobName: 'Allied health professional (not occupational therapist)' },
  { JobID: 17, JobName: 'Nursing associate' },
  { JobID: 18, JobName: 'Occupational therapist' },
  { JobID: 23, JobName: 'Registered nurse' },
  { JobID: 27, JobName: 'Social worker' },
  { JobID: 33, JobName: 'Data analyst' },
  { JobID: 35, JobName: 'IT and digital support' },
  { JobID: 38, JobName: 'Software developer' },
  { JobID: 12, JobName: 'Employment support' },
  { JobID: 24, JobName: 'Safeguarding and reviewing officer' },
  { JobID: 3, JobName: 'Advice, guidance and advocacy' },
  { JobID: 6, JobName: "Any children's, young people's job role" },
  { JobID: 7, JobName: 'Assessment officer' },
];

const jobIds = jobRolesExcludedFromCWP.map((job) => job.JobID);

const jobsTable = {
  tableName: 'Job',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      const addColumn = queryInterface.addColumn(
        jobsTable,
        'ExcludedFromCareWorkforcePathway',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { transaction },
      );

      const setToTrueForApplicableRoles = queryInterface.sequelize.query(
        `UPDATE cqc."Job"
           SET "ExcludedFromCareWorkforcePathway" = TRUE
         WHERE "JobID" IN (${jobIds.join(', ')}) AND "DeletedAt" IS NULL;
      `,
        { transaction },
      );

      return addColumn.then(setToTrueForApplicableRoles);
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(jobsTable, 'ExcludedFromCareWorkforcePathway');
  },
};
