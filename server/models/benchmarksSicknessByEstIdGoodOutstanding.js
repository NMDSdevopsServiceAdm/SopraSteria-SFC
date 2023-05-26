module.exports = function (sequelize, DataTypes) {
  const BenchmarksSicknessByEstIdGoodOutstanding = sequelize.define(
    'benchmarksSicknessByEstIdGoodOutstanding',
    {
      EstablishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      WorkersForSickness: {
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
      tableName: '"BenchmarksSicknessByEstIdGoodOutstanding"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksSicknessByEstIdGoodOutstanding;
};
