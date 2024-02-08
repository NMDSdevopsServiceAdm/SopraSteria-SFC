module.exports = function (sequelize, DataTypes) {
  const BenchmarksTurnoverByLAAndService = sequelize.define(
    'benchmarksTurnoverByLAAndService',
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
    },
    {
      tableName: '"BenchmarksTurnoverByLAAndService',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksTurnoverByLAAndService;
};
