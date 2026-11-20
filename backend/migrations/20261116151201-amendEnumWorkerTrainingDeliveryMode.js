'use strict';

const currentChoices = ['Face to face', 'E-learning'];
const newChoices = ['Online with a live trainer', 'A mix of delivery methods'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const addNewOptions = [
      `ALTER TYPE cqc."WorkerTrainingDeliveryMode" ADD VALUE IF NOT EXISTS '${newChoices[0]}' AFTER '${currentChoices.at(-1)}';`,
      `ALTER TYPE cqc."WorkerTrainingDeliveryMode" ADD VALUE IF NOT EXISTS '${newChoices[1]}' AFTER '${newChoices[0]}'`,
    ];

    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.sequelize.query(addNewOptions[0], { transaction }),
        queryInterface.sequelize.query(addNewOptions[1], { transaction }),
      ]);
    });
  },

  async down(queryInterface) {
    const renameNewEnum = `ALTER TYPE cqc."WorkerTrainingDeliveryMode" RENAME TO "WorkerTrainingDeliveryMode_toBeDeleted";`;
    const recreateOldEnums = `CREATE TYPE cqc."WorkerTrainingDeliveryMode" AS ENUM (
        ${currentChoices.map((value) => `'${value}'`).join(', ')}
      );`;

    const switchToOldEnum = [
      `ALTER TABLE cqc."TrainingCourse" ALTER COLUMN "HowWasItDelivered" TYPE cqc."WorkerTrainingDeliveryMode" USING "HowWasItDelivered"::text::cqc."WorkerTrainingDeliveryMode";`,
      `ALTER TABLE cqc."WorkerTraining" ALTER COLUMN "HowWasItDelivered" TYPE cqc."WorkerTrainingDeliveryMode" USING "HowWasItDelivered"::text::cqc."WorkerTrainingDeliveryMode";`,
    ];
    const deleteUnusedEnum = `DROP TYPE cqc."WorkerTrainingDeliveryMode_toBeDeleted"`;

    const allQueries = [renameNewEnum, recreateOldEnums, ...switchToOldEnum, deleteUnusedEnum];

    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const query of allQueries) {
        await queryInterface.sequelize.query(query, { transaction });
      }
    });
  },
};
