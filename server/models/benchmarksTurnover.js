module.exports = function (sequelize, DataTypes) {
  const BenchmarksTurnover = sequelize.define(
    'benchmarksTurnover',
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
      turnover: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'Turnover',
      },
      EstablishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'BenchmarksTurnover',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  BenchmarksTurnover.associate = (models) => {
    BenchmarksTurnover.belongsTo(models.services, {
      foreignKey: 'MainServiceFK',
      targetKey: 'reportingID',
      as: 'BenchmarkToService',
    });
    BenchmarksTurnover.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentFK',
      targetKey: 'id',
      as: 'benchmarkEstablishment',
    });
  };

  BenchmarksTurnover.getComparisonGroupRankings = async function (establishmentId) {
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

  return BenchmarksTurnover;
};
