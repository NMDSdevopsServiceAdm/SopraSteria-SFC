module.exports = function (sequelize, DataTypes) {
  const BenchmarksQualifications = sequelize.define(
    'benchmarksQualifications',
    {
      CssrID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      MainServiceFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      qualifications: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'Qualifications',
      },
      EstablishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: 'BenchmarksQualifications',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  BenchmarksQualifications.associate = (models) => {
    BenchmarksQualifications.belongsTo(models.services, {
      foreignKey: 'MainServiceFK',
      targetKey: 'reportingID',
      as: 'BenchmarkToService',
    });
    BenchmarksQualifications.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentFK',
      targetKey: 'id',
      as: 'benchmarkEstablishment',
    });
  };

  return BenchmarksQualifications;
};
