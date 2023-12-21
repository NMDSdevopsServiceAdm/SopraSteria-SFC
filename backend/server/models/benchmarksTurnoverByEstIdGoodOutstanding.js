module.exports = function (sequelize, DataTypes) {
  const BenchmarksTurnoverByEstIdGoodOutstanding = sequelize.define(
    'benchmarksTurnoverByEstIdGoodOutstanding',
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
      TurnoverRate: DataTypes.DECIMAL(5, 2),
      CQCGoodOutstandingRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksTurnoverByEstIdGoodOutstanding"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksTurnoverByEstIdGoodOutstanding;
};
