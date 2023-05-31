module.exports = function (sequelize, DataTypes) {
  const BenchmarksVacanciesByLAAndServiceGoodOutstanding = sequelize.define(
    'benchmarksVacanciesByLAAndServiceGoodOutstanding',
    {
      LocalAuthorityArea: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      MainServiceFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Employees: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Vacancies: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      BaseEstablishments: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      WorkerCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      VacancyRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      CQCGoodOutstandingRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksVacanciesByLAAndServiceGoodOutstanding"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksVacanciesByLAAndServiceGoodOutstanding;
};
