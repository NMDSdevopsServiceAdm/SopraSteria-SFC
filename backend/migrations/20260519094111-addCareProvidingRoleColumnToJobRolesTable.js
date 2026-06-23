'use strict';

const careProvidingJobRoles = [
  { JobID: '10', JobName: 'Care worker', IsCareProvidingRole: true },
  { JobID: '11', JobName: 'Community support and outreach work', IsCareProvidingRole: true },
  { JobID: '20', JobName: 'Other (directly involved in providing care)', IsCareProvidingRole: true },
  { JobID: '22', JobName: 'Registered manager', IsCareProvidingRole: true },
  { JobID: '25', JobName: 'Senior care worker', IsCareProvidingRole: true },
  { JobID: '28', JobName: 'Supervisor', IsCareProvidingRole: true },
  { JobID: '32', JobName: 'Team leader', IsCareProvidingRole: true },
  { JobID: '39', JobName: 'Support worker', IsCareProvidingRole: true },
];
const jobIds = careProvidingJobRoles.map((job) => job.JobID);

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
        'IsCareProvidingRole',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        { transaction },
      );

      const setToTrueForApplicableRoles = queryInterface.sequelize.query(
        `
      UPDATE cqc."Job"
      SET "IsCareProvidingRole" = TRUE
      WHERE "JobID" IN (${jobIds.join(', ')}) AND "DeletedAt" IS NULL;
    `,
        { transaction },
      );

      return addColumn.then(setToTrueForApplicableRoles);
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(jobsTable, 'IsCareProvidingRole');
  },
};
