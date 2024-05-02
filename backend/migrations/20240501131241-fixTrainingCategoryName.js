'use strict';
const models = require('../server/models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    return await models.workerTrainingCategories.update(
      { category: 'Positive behaviour support and non-restrictive practice' },
      {
        where: {
          id: 32,
        },
      },
    );
  },

  async down() {
    return await models.workerTrainingCategories.update(
      { category: 'Positive behaviour and support and non-restrictive practice' },
      {
        where: {
          id: 32,
        },
      },
    );
  },
};
