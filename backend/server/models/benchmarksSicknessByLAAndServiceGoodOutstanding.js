module.exports = function (sequelize, DataTypes) {
  const BenchmarksSicknessByLAAndServiceGoodOutstanding = sequelize.define(
    'benchmarksSicknessByLAAndServiceGoodOutstanding',
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
      AverageNoOfSickDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      CQCGoodOutstandingRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksSicknessByLAAndServiceGoodOutstanding"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksSicknessByLAAndServiceGoodOutstanding;
};
