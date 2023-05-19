module.exports = function (sequelize, DataTypes) {
  const BenchmarksPayByLAAndService = sequelize.define(
    'benchmarksPayByLAAndService',
    {
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
      AverageHourlyRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      AverageAnnualFTE: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksPayByLAAndService"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksPayByLAAndService;
};
