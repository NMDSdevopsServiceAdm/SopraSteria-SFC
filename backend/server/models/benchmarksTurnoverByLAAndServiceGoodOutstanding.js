module.exports = function (sequelize, DataTypes) {
  const BenchmarksTurnoverByLAAndServiceGoodOutstanding = sequelize.define(
    'benchmarksTurnoverByLAAndServiceGoodOutstanding',
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
      Employees: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Leavers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      WorkerCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      TurnoverRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      CQCGoodOutstandingRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksTurnoverByLAAndServiceGoodOutstanding',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksTurnoverByLAAndServiceGoodOutstanding;
};
