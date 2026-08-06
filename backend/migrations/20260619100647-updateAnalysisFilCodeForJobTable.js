'use strict';

const jobRoles = [
  { AnalysisFileCode: 1, JobName: 'Senior management' },
  { AnalysisFileCode: 2, JobName: 'Middle management' },
  { AnalysisFileCode: 3, JobName: 'First-line manager' },
  { AnalysisFileCode: 4, JobName: 'Registered manager' },
  { AnalysisFileCode: 5, JobName: 'Supervisor' },
  { AnalysisFileCode: 6, JobName: 'Social worker' },
  { AnalysisFileCode: 7, JobName: 'Senior care worker' },
  { AnalysisFileCode: 8, JobName: 'Care worker' },
  { AnalysisFileCode: 9, JobName: 'Community support and outreach work' },
  { AnalysisFileCode: 10, JobName: 'Employment support' },
  { AnalysisFileCode: 11, JobName: 'Advice, guidance and advocacy' },
  { AnalysisFileCode: 15, JobName: 'Occupational therapist' },
  { AnalysisFileCode: 16, JobName: 'Registered nurse' },
  { AnalysisFileCode: 17, JobName: 'Allied health professional (not occupational therapist)' },
  // { AnalysisFileCode: 22, JobName: 'Technician' }, // this line is commented out because there is an extra space for the JobName Technician in the database
  { AnalysisFileCode: 23, JobName: 'Other (directly involved in providing care)' },
  { AnalysisFileCode: 24, JobName: 'Manager (care-related, but not care-providing)' },
  { AnalysisFileCode: 25, JobName: 'Administrative' },
  { AnalysisFileCode: 26, JobName: 'Ancillary staff (non care-providing)' },
  { AnalysisFileCode: 27, JobName: 'Other (not directly involved in providing care)' },
  { AnalysisFileCode: 34, JobName: 'Activities worker, co-ordinator' },
  { AnalysisFileCode: 35, JobName: 'Safeguarding and reviewing officer' },
  { AnalysisFileCode: 36, JobName: 'Occupational therapist assistant' },
  { AnalysisFileCode: 37, JobName: 'Nursing associate' },
  { AnalysisFileCode: 38, JobName: 'Nursing assistant' },
  { AnalysisFileCode: 39, JobName: 'Assessment officer' },
  { AnalysisFileCode: 40, JobName: 'Care co-ordinator' },
  { AnalysisFileCode: 41, JobName: 'Care navigator' },
  { AnalysisFileCode: 42, JobName: "Any children's, young people's job role" },
  { AnalysisFileCode: 43, JobName: 'Deputy manager' },
  { AnalysisFileCode: 44, JobName: 'Learning and development lead' },
  { AnalysisFileCode: 45, JobName: 'Team leader' },
  { AnalysisFileCode: 46, JobName: 'Data analyst' },
  { AnalysisFileCode: 47, JobName: 'Data governance manager' },
  { AnalysisFileCode: 48, JobName: 'IT and digital support' },
  { AnalysisFileCode: 49, JobName: 'IT manager' },
  { AnalysisFileCode: 50, JobName: 'IT service desk manager' },
  { AnalysisFileCode: 51, JobName: 'Software developer' },
  { AnalysisFileCode: 52, JobName: 'Support worker' },
];

module.exports = {
  async up(queryInterface) {
    const caseStatement = jobRoles
      .map(({ AnalysisFileCode, JobName }) => `WHEN '${JobName.replace(/'/g, "''")}' THEN ${AnalysisFileCode}`)
      .join('\n');

    return queryInterface.sequelize.query(`
      UPDATE cqc."Job"
      SET "AnalysisFileCode" = CASE "JobName"
        ${caseStatement}
      END
      WHERE "JobName" IN (
        ${jobRoles.map(({ JobName }) => `'${JobName.replace(/'/g, "''")}'`).join(', ')}
      );
    `);
  },

  async down(queryInterface) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."Job"
      SET "AnalysisFileCode" = NULL
      WHERE "JobName" IN (
        ${jobRoles.map(({ JobName }) => `'${JobName.replace(/'/g, "''")}'`).join(', ')}
      );
    `);
  },
};
