'use strict';

const mainTable = { tableName: 'EstablishmentJobs', schema: 'cqc' };
const viewTables = [
  { tableName: 'StartersVW', jobType: 'Starters' },
  { tableName: 'LeaversVW', jobType: 'Leavers' },
  { tableName: 'VacanciesVW', jobType: 'Vacancies' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      const promises = [];

      promises.push(
        queryInterface.addColumn(
          mainTable,
          'OtherJobRoleName',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      );

      viewTables.forEach(({ tableName, jobType }) => {
        const sqlString = `
          CREATE OR REPLACE VIEW cqc."${tableName}" AS
            SELECT "EstablishmentJobs"."EstablishmentJobID",
            "EstablishmentJobs"."EstablishmentID",
            "EstablishmentJobs"."JobID",
            "EstablishmentJobs"."JobType",
            "EstablishmentJobs"."Total",
            "EstablishmentJobs"."OtherJobRoleName"
          FROM cqc."EstablishmentJobs"
          WHERE ("EstablishmentJobs"."JobType" = '${jobType}'::cqc.job_type);
        `;

        promises.push(queryInterface.sequelize.query(sqlString, { transaction }));
      });

      return Promise.all(promises);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      const promises = [];

      viewTables.forEach(({ tableName, jobType }) => {
        const sqlString = `
          DROP VIEW IF EXISTS cqc."${tableName}";
          CREATE OR REPLACE VIEW cqc."${tableName}" AS
            SELECT "EstablishmentJobs"."EstablishmentJobID",
            "EstablishmentJobs"."EstablishmentID",
            "EstablishmentJobs"."JobID",
            "EstablishmentJobs"."JobType",
            "EstablishmentJobs"."Total"
          FROM cqc."EstablishmentJobs"
          WHERE ("EstablishmentJobs"."JobType" = '${jobType}'::cqc.job_type);
        `;

        promises.push(queryInterface.sequelize.query(sqlString, { transaction }));
      });

      promises.push(queryInterface.removeColumn(mainTable, 'OtherJobRoleName', { transaction }));

      return Promise.all(promises);
    });
  },
};
