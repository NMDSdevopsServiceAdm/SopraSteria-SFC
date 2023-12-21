module.exports = function (sequelize, DataTypes) {
  const BenchmarksTurnoverByEstId = sequelize.define(
    'benchmarksTurnoverByEstId',
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
    },
    {
      tableName: '"BenchmarksTurnoverByEstId"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksTurnoverByEstId;
};
