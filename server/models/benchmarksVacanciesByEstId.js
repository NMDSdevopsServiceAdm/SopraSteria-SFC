module.exports = function (sequelize, DataTypes) {
  const BenchmarksVacanciesByEstId = sequelize.define(
    'benchmarksVacanciesByEstId',
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
    },
    {
      tableName: '"BenchmarksVacanciesByEstId"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksVacanciesByEstId;
};
