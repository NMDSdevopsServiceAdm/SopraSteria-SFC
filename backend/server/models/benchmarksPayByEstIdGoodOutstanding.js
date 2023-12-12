module.exports = function (sequelize, DataTypes) {
  const BenchmarksPayByEstIdGoodOutstanding = sequelize.define(
    'benchmarksPayByEstIdGoodOutstanding',
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
      CQCGoodOutstandingRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksPayByEstIdGoodOutstanding"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksPayByEstIdGoodOutstanding;
};
