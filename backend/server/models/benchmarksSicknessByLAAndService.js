module.exports = function (sequelize, DataTypes) {
  const BenchmarksSicknessByLAAndService = sequelize.define(
    'benchmarksSicknessByLAAndService',
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
    },
    {
      tableName: '"BenchmarksSicknessByLAAndService"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksSicknessByLAAndService;
};
