'use strict';

const addAnalysisFileCodeForEachService = [
  { AnalysisFileCode: 1, name: 'Care home services with nursing' },
  { AnalysisFileCode: 2, name: 'Care home services without nursing' },
  { AnalysisFileCode: 53, name: 'Sheltered housing' },
  { AnalysisFileCode: 5, name: 'Other adult residential care service' },
  { AnalysisFileCode: 6, name: 'Day care and day services' },
  { AnalysisFileCode: 7, name: 'Other adult day care service' },
  { AnalysisFileCode: 8, name: 'Domiciliary care services' },
  { AnalysisFileCode: 73, name: 'Live-in care' },
  { AnalysisFileCode: 54, name: 'Extra care housing services' },
  { AnalysisFileCode: 55, name: 'Supported living services' },
  { AnalysisFileCode: 10, name: 'Domestic services and home help' },
  { AnalysisFileCode: 12, name: 'Other adult domiciliary care service' },
  { AnalysisFileCode: 17, name: 'Shared lives' },
  { AnalysisFileCode: 13, name: 'Carers support' },
  { AnalysisFileCode: 14, name: 'Short breaks, respite care' },
  { AnalysisFileCode: 15, name: 'Community support and outreach' },
  { AnalysisFileCode: 16, name: 'Social work and care management' },
  { AnalysisFileCode: 18, name: 'Disability adaptations, assistive technology services' },
  { AnalysisFileCode: 19, name: 'Occupational, employment-related services' },
  { AnalysisFileCode: 20, name: 'Information and advice services' },
  { AnalysisFileCode: 21, name: 'Other adult community care service' },
  { AnalysisFileCode: 61, name: 'Community based services for people with a learning disability' },
  { AnalysisFileCode: 62, name: 'Community based services for people with mental health needs' },
  { AnalysisFileCode: 63, name: 'Community based services for people who misuse substances' },
  { AnalysisFileCode: 64, name: 'Community healthcare services' },
  { AnalysisFileCode: 66, name: 'Hospice services' },
  { AnalysisFileCode: 67, name: 'Long-term conditions services' },
  {
    AnalysisFileCode: 68,
    name: 'Hospital services for people with mental health needs, learning disabilities, problems with substance misuse',
  },
  { AnalysisFileCode: 69, name: 'Rehabilitation services' },
  { AnalysisFileCode: 70, name: 'Residential substance misuse treatment, rehabilitation services' },
  { AnalysisFileCode: 71, name: 'Other service (healthcare)' },
  { AnalysisFileCode: 74, name: 'Nurses agency' },
  { AnalysisFileCode: 52, name: 'Other service (not healthcare)' },
  { AnalysisFileCode: 72, name: 'Head office services' },
  { AnalysisFileCode: 75, name: "Any children's, young people's service" },
  { AnalysisFileCode: 60, name: 'Specialist college services' },
];

module.exports = {
  async up(queryInterface) {
    const caseStatement = addAnalysisFileCodeForEachService
      .map(({ AnalysisFileCode, name }) => `WHEN '${name.replace(/'/g, "''")}' THEN ${AnalysisFileCode}`)
      .join('\n');

    return queryInterface.sequelize.query(`
      UPDATE cqc."services"
      SET "AnalysisFileCode" = CASE "name"
        ${caseStatement}
      END
      WHERE "name" IN (
        ${addAnalysisFileCodeForEachService.map(({ name }) => `'${name.replace(/'/g, "''")}'`).join(', ')}
      );
    `);
  },

  async down(queryInterface) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."services"
      SET "AnalysisFileCode" = NULL
      WHERE "name" IN (
        ${addAnalysisFileCodeForEachService.map(({ name }) => `'${name.replace(/'/g, "''")}'`).join(', ')}
      );
    `);
  },
};
