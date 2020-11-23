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

  BenchmarksQualifications.getComparisonGroupRankings = async function (establishmentId) {
    const cssr = await sequelize.models.cssr.getCSSR(establishmentId);
    return await this.findAll({
      where: {
        CssrID: cssr,
        EstablishmentFK: {
          [sequelize.Op.not]: [establishmentId],
        },
      },
    });
  };

  return BenchmarksQualifications;
};
