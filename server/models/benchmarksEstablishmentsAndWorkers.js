module.exports = function (sequelize, DataTypes) {
  const BenchmarksEstablishmentsAndWorkers = sequelize.define(
    'BenchmarksEstablishmentsAndWorkers',
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
      WorkerCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksEstablishmentsAndWorkers"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksEstablishmentsAndWorkers;
};
