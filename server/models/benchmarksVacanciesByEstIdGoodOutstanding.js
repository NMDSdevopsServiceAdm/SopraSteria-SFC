module.exports = function (sequelize, DataTypes) {
  const BenchmarksVacanciesByEstIdGoodOutstanding = sequelize.define(
    'benchmarksVacanciesByEstIdGoodOutstanding',
    {
      EstablishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      LocalAuthorityArea: DataTypes.INTEGER,
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
      VacancyRate: DataTypes.DECIMAL(5, 2),
      CQCGoodOutstandingRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksVacanciesByEstIdGoodOutstanding"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksVacanciesByEstIdGoodOutstanding;
};
