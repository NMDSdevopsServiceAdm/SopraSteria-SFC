module.exports = function (sequelize, DataTypes) {
  const BenchmarksQualificationsByLAAndService = sequelize.define(
    'benchmarksQualificationsByLAAndService',
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
      tableName: '"BenchmarksQualificationsByLAAndService"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return BenchmarksQualificationsByLAAndService;
};
