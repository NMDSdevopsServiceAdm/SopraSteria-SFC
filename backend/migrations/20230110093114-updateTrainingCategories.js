/* eslint-disable no-useless-escape */
'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Activity provision, wellbeing'
          WHERE "ID" = 1;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Children''s, young people''s related training'
          WHERE "ID" = 3;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Complaints handling, conflict resolution'
          WHERE "ID" = 5;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Confidentiality, GDPR'
          WHERE "ID" = 6;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Continence care'
          WHERE "ID" = 7;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'COSHH'
          WHERE "ID" = 9;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Dignity, respect, person-centered care'
          WHERE "ID" = 12;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Infection control'
          WHERE "ID" = 21;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Leadership and management'
          WHERE "ID" = 22;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Moving and handling'
          WHERE "ID" = 27;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Palliative, end of life'
          WHERE "ID" = 29;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Personal care'
          WHERE "ID" = 30;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Physical disability'
          WHERE "ID" = 31;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Positive behaviour and support'
          WHERE "ID" = 32;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Safeguarding adults'
          WHERE "ID" = 33;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Supervision, performance management'
          WHERE "ID" = 36;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
          SET "Category" = 'Other'
          WHERE "ID" = 37;`,
          { transaction },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Activity provision/Well-being'
        WHERE "ID" = 1;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Childrens / young people''s related training'
        WHERE "ID" = 3;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Complaints handling/conflict resolution'
        WHERE "ID" = 5;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Confidentiality/GDPR'
        WHERE "ID" = 6;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Continence Care'
        WHERE "ID" = 7;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Coshh'
        WHERE "ID" = 9;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Dignity, Respect, Person Centered care'
        WHERE "ID" = 12;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Infection Control'
        WHERE "ID" = 21;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Leadership & Management'
        WHERE "ID" = 22;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Moving and Handling'
        WHERE "ID" = 27;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Palliative or end of life care'
        WHERE "ID" = 29;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Personal Care'
        WHERE "ID" = 30;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Physical Disability'
        WHERE "ID" = 31;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Positive behaviour and support'
        WHERE "ID" = 32;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Safeguarding Adults'
        WHERE "ID" = 33;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Supervision / Performance management'
        WHERE "ID" = 36;`,
          { transaction },
        ),
        await queryInterface.sequelize.query(
          `UPDATE cqc."TrainingCategories"
        SET "Category" = 'Any other not in the above categories'
        WHERE "ID" = 37;`,
          { transaction },
        ),
      ]);
    });
  },
};
