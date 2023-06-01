module.exports = function (sequelize, DataTypes) {
  const BenchmarksVacanciesByLAAndService = sequelize.define(
    'benchmarksVacanciesByLAAndService',
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
    },
    {
      tableName: '"BenchmarksVacanciesByLAAndService"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksVacanciesByLAAndService;
};
