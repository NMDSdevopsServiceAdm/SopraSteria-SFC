module.exports = function (sequelize, DataTypes) {
  const BenchmarksQualificationsByEstId = sequelize.define(
    'benchmarksQualificationsByEstId',
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
      CountHasSCQual: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      CountNoSCQual: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Qualifications: {
        type: DataTypes.DECIMAL(11, 10),
        allowNull: false,
      },
    },
    {
      tableName: '"BenchmarksQualificationsByEstId"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksQualificationsByEstId;
};
