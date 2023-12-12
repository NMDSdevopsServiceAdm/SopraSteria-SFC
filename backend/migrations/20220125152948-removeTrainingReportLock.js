'use strict';

const establishmentTable = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeColumn(establishmentTable, 'TrainingReportLockHeld', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'TrainingReportState', { transaction }),
        queryInterface.sequelize.query('DROP TYPE IF EXISTS "TrainingReportStates";'),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          establishmentTable,
          'TrainingReportLockHeld',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          establishmentTable,
          'TrainingReportState',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: false,
            defaultValue: 'READY',
            values: ['READY', 'DOWNLOADING', 'FAILED', 'WARNINGS', 'COMPLETING'],
          },
          { transaction },
        ),
      ]);
    });
  },
};
