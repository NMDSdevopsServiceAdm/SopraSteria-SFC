'use strict';

const data = [
  {
    id: 1,
    seq: 10,
    label: 'The same rate for travel time as for visits',
    includeRate: false,
    analysisFileCode: 1,
    bulkUploadCode: 1,
  },
  {
    id: 2,
    seq: 20,
    label: 'Minimum wage',
    includeRate: false,
    analysisFileCode: 2,
    bulkUploadCode: 2,
  },
  {
    id: 3,
    seq: 30,
    label: 'A different travel time rate',
    includeRate: true,
    analysisFileCode: 3,
    bulkUploadCode: 3,
  },
  {
    id: 4,
    seq: 40,
    label: 'We pay for travel time in a different way',
    includeRate: false,
    analysisFileCode: 4,
    bulkUploadCode: 4,
  },
  {
    id: 5,
    seq: 50,
    label: 'We do not pay for travel time between visits',
    includeRate: false,
    analysisFileCode: 5,
    bulkUploadCode: 5,
  },
  {
    id: 6,
    seq: 60,
    label: 'Workers do not travel between visits',
    includeRate: false,
    analysisFileCode: 6,
    bulkUploadCode: 6,
  },
  {
    id: 7,
    seq: 70,
    label: 'I do not know',
    includeRate: false,
    analysisFileCode: -2,
    bulkUploadCode: 999,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const updateStatements = data.map(({ label, analysisFileCode }) => {
      return `
        UPDATE cqc."TravelTimePayOption"
        SET "AnalysisFileCode" = ${analysisFileCode}
        WHERE "Label" = '${label}';
      `;
    });

    return queryInterface.sequelize.transaction((transaction) => {
      const updates = updateStatements.map((sqlQuery) => queryInterface.sequelize.query(sqlQuery, { transaction }));
      return Promise.all(updates);
    });
  },

  async down(queryInterface) {
    const updateStatements = data.map(({ label }) => {
      return `
        UPDATE cqc."TravelTimePayOption"
        SET "AnalysisFileCode" = null
        WHERE "Label" = '${label}';
      `;
    });

    return queryInterface.sequelize.transaction((transaction) => {
      const updates = updateStatements.map((sqlQuery) => queryInterface.sequelize.query(sqlQuery, { transaction }));
      return Promise.all(updates);
    });
  },
};
