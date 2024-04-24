'use strict';
const models = require('../server/models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.workerTrainingCategories.update(
        { category: 'Assisting and moving people' },
        {
          where: {
            id: 27
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Communication' },
        {
          where: {
            id: 4
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Equality and Diversity' },
        {
          where: {
            id: 16
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Infection prevention and control' },
        {
          where: {
            id: 21
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Medication management' },
        {
          where: {
            id: 24
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Mental capacity and liberty safeguards' },
        {
          where: {
            id: 25
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Positive Behaviour and support and non-restrictive practice' },
        {
          where: {
            id: 32
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Basic life support and first aid' },
        {
          where: {
            id: 18
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Food hygeine' },
        {
          where: {
            id: 19
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Health and safety awareness' },
        {
          where: {
            id: 20
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Data management and GDPR' },
        {
          where: {
            id: 6
          }
        },
        { transaction }
      );
  });
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.workerTrainingCategories.update(
        { category: 'Moving and handling' },
        {
          where: {
            id: 27
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Communication skills' },
        {
          where: {
            id: 4
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Equality, diversity and human rights training' },
        {
          where: {
            id: 16
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Infection control' },
        {
          where: {
            id: 21
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Medication safe handlng and awareness' },
        {
          where: {
            id: 24
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Mental capacity and deprivation of liberty' },
        {
          where: {
            id: 25
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Positive Behaviour and support' },
        {
          where: {
            id: 32
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'First aid' },
        {
          where: {
            id: 18
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Food safety and catering' },
        {
          where: {
            id: 19
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Health and safety' },
        {
          where: {
            id: 20
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        { category: 'Confidentiality, GDPR' },
        {
          where: {
            id: 6
          }
        },
        { transaction }
      );
  });
  },
};
