'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const createWorkerTrainingDeliveredBy = `CREATE TYPE cqc."WorkerTrainingDeliveredBy" AS ENUM (
      'In-house staff',
      'External provider'
    );`;

    const createwWorkerTrainingDeliveryMode = `CREATE TYPE cqc."WorkerTrainingDeliveryMode" AS ENUM (
      'Face to face',
      'E-learning'
    );`;

    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.sequelize.query(createWorkerTrainingDeliveredBy, { transaction }),
        queryInterface.sequelize.query(createwWorkerTrainingDeliveryMode, { transaction }),
      ]);
    });
  },

  async down(queryInterface) {
    const dropWorkerTrainingDeliveredBy = 'DROP TYPE cqc."WorkerTrainingDeliveredBy"';
    const dropWorkerTrainingDeliveryMode = 'DROP TYPE cqc."WorkerTrainingDeliveryMode"';

    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.sequelize.query(dropWorkerTrainingDeliveredBy, { transaction }),
        queryInterface.sequelize.query(dropWorkerTrainingDeliveryMode, { transaction }),
      ]);
    });
  },
};
