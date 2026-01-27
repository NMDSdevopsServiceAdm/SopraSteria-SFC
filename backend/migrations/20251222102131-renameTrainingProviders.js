'use strict';

const models = require('../server/models/index');

const trainingProviders = [
  { id: 23, newName: 'FreeBird Associates', oldName: 'Freebird associates' },
  {
    id: 24,
    newName: 'Guardian Angels Training',
    oldName: 'Guardian Angels Training (Stewart Hill Associates Limited, T/As Guardian Angels)',
  },
  { id: 25, newName: 'Gecko Programmes Ltd', oldName: 'Gecko programmes Ltd' },
  {
    id: 53,
    newName: 'The Education Training Collective (Stockton Riverside College)',
    oldName: 'The Education Training Collective – Stockton Riverside College',
  },
  { id: 56, newName: 'Training in Care Ltd', oldName: 'The United Care Network' },
  { id: 57, newName: 'Unique Training Solutions Ltd', oldName: 'Training in Care Ltd.' },
  { id: 58, newName: 'United Care Network', oldName: 'Unique Training Solutions Ltd' },
  {
    id: 59,
    newName: 'United Care Network (BrightPath Academy)',
    oldName: 'United care networks Ta Brightpath academy',
  },
  {
    id: 60,
    newName: 'Universal Vibes Limited (Care Trainings)',
    oldName: 'Universal Vibes Limited Training As Care Trainings',
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const trainingProvider of trainingProviders) {
        await models.trainingProvider.update(
          {
            name: trainingProvider.newName,
          },
          {
            where: {
              id: trainingProvider.id,
            },
            transaction,
          },
        );
      }
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const trainingProvider of trainingProviders) {
        await models.trainingProvider.update(
          {
            name: trainingProvider.oldName,
          },
          {
            where: {
              id: trainingProvider.id,
            },
            transaction,
          },
        );
      }
    });
  },
};
