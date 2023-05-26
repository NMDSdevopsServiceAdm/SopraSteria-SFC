'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const changeMainServiceColumn = async (table, constraintName, transaction) => {
      await Promise.all([
        queryInterface.changeColumn(
          table,
          'MainServiceFK',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          { transaction },
        ),
        queryInterface.removeConstraint(table, constraintName, { transaction }),
      ]);
    };

    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        changeMainServiceColumn(
          { tableName: 'BenchmarksPayByEstId', schema: 'cqc' },
          'BenchmarksPayByEstId_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksPayByEstIdGoodOutstanding', schema: 'cqc' },
          'BenchmarksPayByEstIdGoodOutstanding_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksPayByLAAndService', schema: 'cqc' },
          'BenchmarksPayByLAAndService_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksPayByLAAndServiceGoodOutstanding', schema: 'cqc' },
          'BenchmarksPayByLAAndServiceGoodOutstanding_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksQualificationsByEstId', schema: 'cqc' },
          'BenchmarksQualificationsByEstId_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksQualificationsByEstIdGoodOutstanding', schema: 'cqc' },
          'BenchmarksQualificationsByEstIdGoodOutstandi_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksQualificationsByLAAndService', schema: 'cqc' },
          'BenchmarksQualificationsByLAAndService_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksQualificationsByLAAndServiceGoodOutstanding', schema: 'cqc' },
          'BenchmarksQualificationsByLAAndServiceGoodOu_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksSicknessByEstId', schema: 'cqc' },
          'BenchmarksSicknessByEstId_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksSicknessByEstIdGoodOutstanding', schema: 'cqc' },
          'BenchmarksSicknessByEstIdGoodOutstanding_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksSicknessByLAAndService', schema: 'cqc' },
          'BenchmarksSicknessByLAAndService_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksSicknessByLAAndServiceGoodOutstanding', schema: 'cqc' },
          'BenchmarksSicknessByLAAndServiceGoodOutstand_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksTurnoverByEstId', schema: 'cqc' },
          'BenchmarksTurnoverByEstId_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksTurnoverByEstIdGoodOutstanding', schema: 'cqc' },
          'BenchmarksTurnoverByEstIdGoodOutstanding_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksTurnoverByLAAndService', schema: 'cqc' },
          'BenchmarksTurnoverByLAAndService_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksTurnoverByLAAndServiceGoodOutstanding', schema: 'cqc' },
          'BenchmarksTurnoverByLAAndServiceGoodOutstand_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksVacanciesByEstId', schema: 'cqc' },
          'BenchmarksVacanciesByEstId_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksVacanciesByEstIdGoodOutstanding', schema: 'cqc' },
          'BenchmarksVacanciesByEstIdGoodOutstanding_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksVacanciesByLAAndService', schema: 'cqc' },
          'BenchmarksVacanciesByLAAndService_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksVacanciesByLAAndServiceGoodOutstanding', schema: 'cqc' },
          'BenchmarksVacanciesByLAAndServiceGoodOutstan_MainServiceFK_fkey',
          transaction,
        ),
        changeMainServiceColumn(
          { tableName: 'BenchmarksEstablishmentsAndWorkers', schema: 'cqc' },
          'BenchmarksEstablishmentsAndWorkers_MainServiceFK_fkey',
          transaction,
        ),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    const changeMainServiceColumn = async (table, transaction) => {
      await queryInterface.changeColumn(
        table,
        'MainServiceFK',
        {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: 'services',
              schema: 'cqc',
            },
            key: 'reportingID',
          },
        },
        { transaction },
      );
    };

    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        changeMainServiceColumn({ tableName: 'BenchmarksPayByEstId', schema: 'cqc' }, transaction),
        changeMainServiceColumn({ tableName: 'BenchmarksPayByEstIdGoodOutstanding', schema: 'cqc' }, transaction),
        changeMainServiceColumn({ tableName: 'BenchmarksPayByLAAndService', schema: 'cqc' }, transaction),
        changeMainServiceColumn(
          { tableName: 'BenchmarksPayByLAAndServiceGoodOutstanding', schema: 'cqc' },
          transaction,
        ),
        changeMainServiceColumn({ tableName: 'BenchmarksQualificationsByEstId', schema: 'cqc' }, transaction),
        changeMainServiceColumn(
          { tableName: 'BenchmarksQualificationsByEstIdGoodOutstanding', schema: 'cqc' },
          transaction,
        ),
        changeMainServiceColumn({ tableName: 'BenchmarksQualificationsByLAAndService', schema: 'cqc' }, transaction),
        changeMainServiceColumn(
          { tableName: 'BenchmarksQualificationsByLAAndServiceGoodOutstanding', schema: 'cqc' },
          transaction,
        ),
        changeMainServiceColumn({ tableName: 'BenchmarksSicknessByEstId', schema: 'cqc' }, transaction),
        changeMainServiceColumn({ tableName: 'BenchmarksSicknessByEstIdGoodOutstanding', schema: 'cqc' }, transaction),
        changeMainServiceColumn({ tableName: 'BenchmarksSicknessByLAAndService', schema: 'cqc' }, transaction),
        changeMainServiceColumn(
          { tableName: 'BenchmarksSicknessByLAAndServiceGoodOutstanding', schema: 'cqc' },
          transaction,
        ),
        changeMainServiceColumn({ tableName: 'BenchmarksTurnoverByEstId', schema: 'cqc' }, transaction),
        changeMainServiceColumn({ tableName: 'BenchmarksTurnoverByEstIdGoodOutstanding', schema: 'cqc' }, transaction),
        changeMainServiceColumn({ tableName: 'BenchmarksTurnoverByLAAndService', schema: 'cqc' }, transaction),
        changeMainServiceColumn(
          { tableName: 'BenchmarksTurnoverByLAAndServiceGoodOutstanding', schema: 'cqc' },
          transaction,
        ),
        changeMainServiceColumn({ tableName: 'BenchmarksVacanciesByEstId', schema: 'cqc' }, transaction),
        changeMainServiceColumn({ tableName: 'BenchmarksVacanciesByEstIdGoodOutstanding', schema: 'cqc' }, transaction),
        changeMainServiceColumn({ tableName: 'BenchmarksVacanciesByLAAndService', schema: 'cqc' }, transaction),
        changeMainServiceColumn(
          { tableName: 'BenchmarksVacanciesByLAAndServiceGoodOutstanding', schema: 'cqc' },
          transaction,
        ),
        changeMainServiceColumn({ tableName: 'BenchmarksEstablishmentsAndWorkers', schema: 'cqc' }, transaction),
      ]);
    });
  },
};
