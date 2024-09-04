'use strict';
const models = require('../server/models/index');

const careSkills = [8,21,24,25,27,28,29,32,33,12,16,7,13,30,1,41];
const healthAndSafety = [14,17,18,19,20,9,42];
const digitalAndData = [6,43,44,45,46,47,48];
const specificConditions = [10,23,31,15,11,26,2,35,34,38,39,40];
const staffDevelopment = [22,3,4,36,5];


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.workerTrainingCategories.update(
        {
          trainingCategoryGroup: 'Care skills and knowledge',
        },
        {
          where: {
            id: { [Sequelize.Op.in]: careSkills }
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        {
          trainingCategoryGroup: 'Health and safety in the workplace',
        },
        {
          where: {
            id: { [Sequelize.Op.in]: healthAndSafety }
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        {
          trainingCategoryGroup: 'IT, digital and data in the workplace',
        },
        {
          where: {
            id: { [Sequelize.Op.in]: digitalAndData }
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        {
          trainingCategoryGroup: 'Specific conditions and disabilities',
        },
        {
          where: {
            id: { [Sequelize.Op.in]: specificConditions }
          }
        },
        { transaction }
      );

      await models.workerTrainingCategories.update(
        {
          trainingCategoryGroup: 'Staff development',
        },
        {
          where: {
            id: { [Sequelize.Op.in]: staffDevelopment }
          }
        },
        { transaction }
      );
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.workerTrainingCategories.update(
        {
          trainingCategoryGroup: null,
        },
        {
          where: {
            trainingCategoryGroup: {
              [Sequelize.Op.ne]: null
            }
          }
        },
        { transaction }
      );
    });
  }
};