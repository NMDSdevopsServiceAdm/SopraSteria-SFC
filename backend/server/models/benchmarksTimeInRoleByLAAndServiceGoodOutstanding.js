module.exports = function (sequelize, DataTypes) {
  const BenchmarksTimeInRoleByLAAndServiceGoodOutstanding = sequelize.define(
    'benchmarksTimeInRoleByLAAndServiceGoodOutstanding',
    {
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
      InRoleFor12MonthsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      NotInRoleFor12MonthsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      InRoleFor12MonthsPercentage: {
        type: DataTypes.DECIMAL(11, 10),
        allowNull: false,
      },
      CQCGoodOutstandingRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksTimeInRoleByLAAndServiceGoodOutstanding"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksTimeInRoleByLAAndServiceGoodOutstanding;
};
