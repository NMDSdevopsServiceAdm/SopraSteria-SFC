'use strict';

const table = {
  tableName: 'WorkerTraining',
  schema: 'cqc',
};

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          table,
          'TrainingCourseFK',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: {
                tableName: 'TrainingCourse',
                schema: 'cqc',
              },
              key: 'ID',
            },
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'DeliveredBy',
          {
            type: 'cqc."WorkerTrainingDeliveredBy"',
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'ExternalProviderName',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'HowWasItDelivered',
          {
            type: 'cqc."WorkerTrainingDeliveryMode"',
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'DoesNotExpire',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'ValidityPeriodInMonth',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },
  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeColumn(table, 'TrainingCourseFK', { transaction }),
        queryInterface.removeColumn(table, 'DeliveredBy', { transaction }),
        queryInterface.removeColumn(table, 'ExternalProviderName', { transaction }),
        queryInterface.removeColumn(table, 'HowWasItDelivered', { transaction }),
        queryInterface.removeColumn(table, 'DoesNotExpire', { transaction }),
        queryInterface.removeColumn(table, 'ValidityPeriodInMonth', { transaction }),
      ]);
    });
  },
};
