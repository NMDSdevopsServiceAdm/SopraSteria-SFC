'use strict';

const workerTraining = { tableName: 'WorkerTraining', schema: 'cqc' };
const trainingCourse = { tableName: 'TrainingCourse', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint(workerTraining, 'WorkerTraining_TrainingCourseFK_fkey', { transaction });
      await queryInterface.addConstraint(workerTraining, {
        fields: ['TrainingCourseFK'],
        type: 'foreign key',
        name: 'WorkerTraining_TrainingCourseFK_fkey',
        references: {
          table: trainingCourse,
          field: 'ID',
        },
        onDelete: 'set null',
        transaction,
      });
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint(workerTraining, 'WorkerTraining_TrainingCourseFK_fkey', { transaction });
      await queryInterface.addConstraint(workerTraining, {
        fields: ['TrainingCourseFK'],
        type: 'foreign key',
        name: 'WorkerTraining_TrainingCourseFK_fkey',
        references: {
          table: trainingCourse,
          field: 'ID',
        },
        transaction,
      });
    });
  },
};
