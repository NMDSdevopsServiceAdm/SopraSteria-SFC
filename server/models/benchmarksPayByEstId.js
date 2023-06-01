module.exports = function (sequelize, DataTypes) {
  const BenchmarksPayByEstId = sequelize.define(
    'benchmarksPayByEstId',
    {
      EstablishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      MainJobRoleFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        key: 'MainJobRole',
      },
      LocalAuthorityArea: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      MainServiceFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      BaseEstablishments: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      BaseWorkers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      AverageHourlyRate: DataTypes.INTEGER,
      AverageAnnualFTE: DataTypes.INTEGER,
    },
    {
      tableName: '"BenchmarksPayByEstId"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksPayByEstId;
};
