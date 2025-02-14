'use strict';

const models = require('../server/models/index');

const qualificationsWithTypos = [
  {
    id: 123,
    updatedTitle: 'Advanced apprenticeship in health and social care (framework)',
    incorrectTitle: 'Advance apprenticeship in health and social care (framework)',
  },
  { id: 2, updatedTitle: 'Stroke awareness', incorrectTitle: 'Stroke Awareness' },
  {
    id: 11,
    updatedTitle:
      "Employment responsibilities and rights in health, social care, and children's and young people's settings",
    incorrectTitle:
      "Employment Responsibilities and Rights in Health, Social Care, Children and Young People's settings",
  },
  { id: 102, updatedTitle: 'A1, A2 or other assessor NVQ', incorrectTitle: 'A1, A2, or other assessor NVQ' },
  {
    id: 112,
    updatedTitle: "Any children's or young people's qualification",
    incorrectTitle: "Any childrens or young people's qualification",
  },
  {
    id: 62,
    updatedTitle: "Introduction to health, social care, and children's and young people's settings",
    incorrectTitle: "Introduction to health, social care and children's and young people's settings",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const qualification of qualificationsWithTypos) {
        await models.workerAvailableQualifications.update(
          {
            title: qualification.updatedTitle,
          },
          {
            where: {
              id: qualification.id,
            },
          },
          { transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const qualification of qualificationsWithTypos) {
        await models.workerAvailableQualifications.update(
          {
            title: qualification.incorrectTitle,
          },
          {
            where: {
              id: qualification.id,
            },
          },
          { transaction },
        );
      }
    });
  },
};
